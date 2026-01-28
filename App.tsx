
import React, { useState, useEffect } from 'react';
import { Tab, Staff, ProductionEntry, HistoryRecord, Thread, Transaction } from './types';
import { INITIAL_STAFF, INITIAL_THREADS } from './constants';
import { getProductionInsights } from './geminiService';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc 
} from "firebase/firestore";

// Sub-components
import Header from './components/Header';
import HomePage from './components/HomePage';
import ProductionPage from './components/ProductionPage';
import AttendancePage from './components/AttendancePage';
import SalaryPage from './components/SalaryPage';
import ThreadPage from './components/ThreadPage';
import FinancePage from './components/FinancePage';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [productionHistory, setProductionHistory] = useState<(HistoryRecord & { firestoreId: string })[]>([]);
  const [currentProduction, setCurrentProduction] = useState<{ day: ProductionEntry[], night: ProductionEntry[] }>({ 
    day: [{ mc: '01', op: 'Operator', ds: 'Design', stitch: 0, qty: 0, prc: 0 }], 
    night: [{ mc: '01', op: 'Operator', ds: 'Design', stitch: 0, qty: 0, prc: 0 }] 
  });
  const [insights, setInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load Staff
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const staffList: Staff[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        staffList.push({ ...data, id: doc.id } as Staff);
      });
      
      if (staffList.length === 0 && isLoading) {
        INITIAL_STAFF.forEach(async (s) => {
          await setDoc(doc(db, "staff", s.id), s);
        });
      } else {
        setStaff(staffList);
      }
    });
    return () => unsub();
  }, [isLoading]);

  // Load Threads
  useEffect(() => {
    const q = query(collection(db, "threads"), orderBy("sn", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const threadList: Thread[] = [];
      snapshot.forEach((doc) => threadList.push({ ...doc.data(), id: doc.id } as Thread));
      
      if (threadList.length === 0 && isLoading) {
        INITIAL_THREADS.forEach(async (t) => {
          await setDoc(doc(db, "threads", t.id), t);
        });
      } else {
        setThreads(threadList);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [isLoading]);

  // Load History
  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("id", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const historyList: (HistoryRecord & { firestoreId: string })[] = [];
      snapshot.forEach((doc) => {
        historyList.push({ ...doc.data(), firestoreId: doc.id } as any);
      });
      setProductionHistory(historyList);
    });
    return () => unsub();
  }, []);

  // Load Transactions
  useEffect(() => {
    const q = query(collection(db, "finances"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const transList: Transaction[] = [];
      snapshot.forEach((doc) => {
        transList.push({ ...doc.data(), id: doc.id } as Transaction);
      });
      setTransactions(transList);
    });
    return () => unsub();
  }, []);

  // Sync current production workspace
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "currentProduction"), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentProduction(docSnap.data() as any);
      }
    });
    return () => unsub();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await getProductionInsights({ currentProduction, staffCount: staff.length });
    setInsights(result || 'No insights available.');
    setIsAnalyzing(false);
  };

  const updateStaff = async (id: string, field: keyof Staff, value: any) => {
    const staffDoc = doc(db, "staff", id);
    await updateDoc(staffDoc, { [field]: value });
  };

  const updateThread = async (id: string, field: keyof Thread, value: any) => {
    const threadDoc = doc(db, "threads", id);
    await updateDoc(threadDoc, { [field]: value });
  };

  const addThread = async () => {
    const newId = `t${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      sn: threads.length > 0 ? Math.max(...threads.map(t => t.sn)) + 1 : 1,
      code: 'NEW',
      name: 'Color Name',
      stock: 0,
      out: 0
    };
    await setDoc(doc(db, "threads", newId), newThread);
  };

  const deleteThread = async (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Thread?",
      message: "This item will be permanently removed from the color inventory.",
      onConfirm: async () => {
        await deleteDoc(doc(db, "threads", id));
      }
    });
  };

  const addStaff = async (staffData: Partial<Staff>) => {
    const newId = Date.now().toString();
    const newStaff: Staff = {
      id: newId,
      name: staffData.name || 'New Employee',
      role: staffData.role || 'Staff',
      salary: staffData.salary || 0,
      advance: 0,
      present: 0,
      otHours: 0,
      otRate: 0
    };
    await setDoc(doc(db, "staff", newId), newStaff);
  };

  const deleteStaff = async (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Remove Employee?",
      message: "Are you sure you want to remove this employee from the payroll database?",
      onConfirm: async () => {
        await deleteDoc(doc(db, "staff", id));
      }
    });
  };

  const updateProduction = async (newData: any) => {
    setCurrentProduction(newData);
    await setDoc(doc(db, "settings", "currentProduction"), newData);
  };

  const saveToHistory = async (record: HistoryRecord) => {
    await addDoc(collection(db, "history"), record);
  };

  const deleteHistoryRecord = async (firestoreId: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete History?",
      message: "This production record will be permanently deleted from the cloud history.",
      onConfirm: async () => {
        await deleteDoc(doc(db, "history", firestoreId));
      }
    });
  };

  const updateHistoryRecord = async (firestoreId: string, updatedRecord: HistoryRecord) => {
    const historyDoc = doc(db, "history", firestoreId);
    const { firestoreId: _, ...dataToSave } = updatedRecord as any;
    await setDoc(historyDoc, dataToSave);
  };

  const addTransaction = async (data: Partial<Transaction>) => {
    await addDoc(collection(db, "finances"), {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0]
    });
  };

  const deleteTransaction = async (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Record?",
      message: "This financial transaction will be removed from your ledger permanently.",
      onConfirm: async () => {
        await deleteDoc(doc(db, "finances", id));
      }
    });
  };

  const updateTransaction = async (id: string, field: keyof Transaction, value: any) => {
    await updateDoc(doc(db, "finances", id), { [field]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black tracking-[0.3em] uppercase animate-pulse">Syncing M.M Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full">
        {activeTab === Tab.Home && (
          <HomePage 
            staff={staff} 
            productionHistory={productionHistory} 
            setActiveTab={setActiveTab}
            insights={insights}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
          />
        )}
        
        {activeTab === Tab.Production && (
          <ProductionPage 
            currentProduction={currentProduction} 
            setCurrentProduction={updateProduction}
            productionHistory={productionHistory}
            saveHistory={saveToHistory}
            deleteHistory={deleteHistoryRecord}
            updateHistory={updateHistoryRecord}
          />
        )}
        
        {activeTab === Tab.Attendance && (
          <AttendancePage 
            staff={staff} 
            updateStaff={updateStaff} 
          />
        )}
        
        {activeTab === Tab.Salary && (
          <SalaryPage 
            staff={staff} 
            updateStaff={updateStaff} 
            addStaff={addStaff}
            deleteStaff={deleteStaff}
          />
        )}

        {activeTab === Tab.Thread && (
          <ThreadPage 
            threads={threads} 
            updateThread={updateThread}
            addThread={addThread}
            deleteThread={deleteThread}
          />
        )}

        {activeTab === Tab.Finance && (
          <FinancePage 
            transactions={transactions}
            addTransaction={addTransaction}
            deleteTransaction={deleteTransaction}
            updateTransaction={updateTransaction}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest no-print">
        M.M SPORTS MANAGEMENT SYSTEM &copy; {new Date().getFullYear()} | Real-time Cloud Sync Active
      </footer>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
};

export default App;
