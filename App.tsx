import React, { useState, useEffect } from 'react';
import { Tab, Staff, ProductionEntry, HistoryRecord, Thread, Transaction } from './types';
import { INITIAL_STAFF, INITIAL_THREADS } from './constants';
import { getProductionInsights } from './geminiService';
import { db } from './firebase';
import { 
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy, addDoc 
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

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const staffList: Staff[] = [];
      snapshot.forEach((doc) => staffList.push({ ...doc.data(), id: doc.id } as Staff));
      if (staffList.length === 0 && isLoading) {
        INITIAL_STAFF.forEach(async (s) => await setDoc(doc(db, "staff", s.id), s));
      } else setStaff(staffList);
    });
    return () => unsub();
  }, [isLoading]);

  useEffect(() => {
    const q = query(collection(db, "threads"), orderBy("sn", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const threadList: Thread[] = [];
      snapshot.forEach((doc) => threadList.push({ ...doc.data(), id: doc.id } as Thread));
      if (threadList.length === 0 && isLoading) {
        INITIAL_THREADS.forEach(async (t) => await setDoc(doc(db, "threads", t.id), t));
      } else setThreads(threadList);
      setIsLoading(false);
    });
    return () => unsub();
  }, [isLoading]);

  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("id", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const historyList: (HistoryRecord & { firestoreId: string })[] = [];
      snapshot.forEach((doc) => historyList.push({ ...doc.data(), firestoreId: doc.id } as any));
      setProductionHistory(historyList);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "finances"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const transList: Transaction[] = [];
      snapshot.forEach((doc) => transList.push({ ...doc.data(), id: doc.id } as Transaction));
      setTransactions(transList);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "currentProduction"), (docSnap) => {
      if (docSnap.exists()) setCurrentProduction(docSnap.data() as any);
    });
    return () => unsub();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await getProductionInsights({ currentProduction, staffCount: staff.length });
    setInsights(result || 'No insights available.');
    setIsAnalyzing(false);
  };

  const updateStaff = async (id: string, field: keyof Staff, value: any) => await updateDoc(doc(db, "staff", id), { [field]: value });
  const updateThread = async (id: string, field: keyof Thread, value: any) => await updateDoc(doc(db, "threads", id), { [field]: value });
  const addThread = async () => {
    const newId = `t${Date.now()}`;
    await setDoc(doc(db, "threads", newId), { id: newId, sn: threads.length + 1, code: 'NEW', name: 'Color', stock: 0, out: 0 });
  };
  const deleteThread = (id: string) => setModalConfig({ isOpen: true, title: "Delete Thread?", message: "Removed permanently.", onConfirm: async () => await deleteDoc(doc(db, "threads", id)) });
  const addStaff = async (d: Partial<Staff>) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "staff", id), { id, name: d.name || 'New', role: d.role || 'Staff', salary: d.salary || 0, advance: 0, present: 0, otHours: 0, otRate: 0 });
  };
  const deleteStaff = (id: string) => setModalConfig({ isOpen: true, title: "Remove Employee?", message: "Are you sure?", onConfirm: async () => await deleteDoc(doc(db, "staff", id)) });
  const updateProduction = async (newData: any) => { setCurrentProduction(newData); await setDoc(doc(db, "settings", "currentProduction"), newData); };
  const saveToHistory = async (record: HistoryRecord) => await addDoc(collection(db, "history"), record);
  const deleteHistoryRecord = (fid: string) => setModalConfig({ isOpen: true, title: "Delete History?", message: "This will be deleted.", onConfirm: async () => await deleteDoc(doc(db, "history", fid)) });
  const addTransaction = async (d: Partial<Transaction>) => await addDoc(collection(db, "finances"), { ...d, date: d.date || new Date().toISOString().split('T')[0] });
  const deleteTransaction = (id: string) => setModalConfig({ isOpen: true, title: "Delete Record?", message: "Confirm deletion.", onConfirm: async () => await deleteDoc(doc(db, "finances", id)) });
  const updateTransaction = async (id: string, f: keyof Transaction, v: any) => await updateDoc(doc(db, "finances", id), { [f]: v });

  if (isLoading) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 uppercase tracking-widest font-black">M.M Cloud Sync...</p></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full animate-fadeIn">
        {activeTab === Tab.Home && <HomePage staff={staff} productionHistory={productionHistory} setActiveTab={setActiveTab} insights={insights} isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} />}
        {activeTab === Tab.Production && <ProductionPage currentProduction={currentProduction} setCurrentProduction={updateProduction} productionHistory={productionHistory} saveHistory={saveToHistory} deleteHistory={deleteHistoryRecord} updateHistory={async (fid, rec) => await setDoc(doc(db, "history", fid), rec)} />}
        {activeTab === Tab.Attendance && <AttendancePage staff={staff} updateStaff={updateStaff} />}
        {activeTab === Tab.Salary && <SalaryPage staff={staff} updateStaff={updateStaff} addStaff={addStaff} deleteStaff={deleteStaff} />}
        {activeTab === Tab.Thread && <ThreadPage threads={threads} updateThread={updateThread} addThread={addThread} deleteThread={deleteThread} />}
        {activeTab === Tab.Finance && <FinancePage transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />}
      </main>
      <footer className="bg-white border-t py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest no-print">M.M SPORTS MANAGEMENT &copy; {new Date().getFullYear()}</footer>
      <ConfirmationModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} />
    </div>
  );
};

export default App;