
import React, { useState } from 'react';
import { Transaction } from '../types';

interface FinancePageProps {
  transactions: Transaction[];
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, field: keyof Transaction, value: any) => Promise<void>;
}

const FinancePage: React.FC<FinancePageProps> = ({ transactions, addTransaction, deleteTransaction, updateTransaction }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: '',
    type: 'earn' as 'earn' | 'expense'
  });

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'earn') acc.earn += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { earn: 0, expense: 0 });

  const netBalance = totals.earn - totals.expense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    await addTransaction({
      date: formData.date,
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type
    });
    setFormData({ ...formData, name: '', amount: '' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard label="Total Earned" value={`Tk ${totals.earn.toLocaleString()}`} color="green" />
        <FinanceCard label="Total Expense" value={`Tk ${totals.expense.toLocaleString()}`} color="red" />
        <FinanceCard label="Net Cash Balance" value={`Tk ${netBalance.toLocaleString()}`} color="orange" dark />
      </div>

      {/* Modern Record Entry Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 no-print">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 className="font-black text-gray-800 uppercase italic leading-none">Record Transaction</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update your financial ledger</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Entry Date</label>
            <input 
              type="date" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Particulars / Details</label>
            <input 
              type="text" 
              placeholder="e.g. Fabric Purchase, Order Payment" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Amount (Tk)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="flex-none flex bg-zinc-100 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'earn'})}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.type === 'earn' ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Earn
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'expense'})}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.type === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Expense
            </button>
          </div>
          <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20 active:scale-95">
            Log Transaction
          </button>
        </form>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-zinc-900 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-sm italic">Live Financial Ledger</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="text-[10px] font-bold uppercase bg-white/10 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
              <i className="fa-solid fa-print mr-2"></i> Print Ledger
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              <tr className="text-center">
                <th className="p-4 text-left px-6">Entry Date</th>
                <th className="text-left px-6">Particulars</th>
                <th className="text-green-600">Credit (Earn)</th>
                <th className="text-red-600">Debit (Expense)</th>
                <th className="no-print w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 transition-colors text-center group">
                  <td className="p-4 text-left px-6">
                    <input 
                      type="date"
                      className="bg-transparent border-none font-bold text-zinc-500 focus:ring-0 p-0 text-xs w-full"
                      value={t.date}
                      onChange={e => updateTransaction(t.id, 'date', e.target.value)}
                    />
                  </td>
                  <td className="text-left px-6 font-black text-zinc-800">
                    <input 
                      className="bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-zinc-100 rounded px-1 transition-colors"
                      value={t.name}
                      onChange={e => updateTransaction(t.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className={`font-black text-lg ${t.type === 'earn' ? 'text-green-600' : 'text-zinc-200'}`}>
                    {t.type === 'earn' ? `Tk ${t.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className={`font-black text-lg ${t.type === 'expense' ? 'text-red-600' : 'text-zinc-200'}`}>
                    {t.type === 'expense' ? `Tk ${t.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="no-print">
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Entry"
                    >
                      <i className="fa-solid fa-trash-can text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400 italic font-medium">
                    <i className="fa-solid fa-receipt text-3xl mb-4 block opacity-20"></i>
                    No financial transactions found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinanceCard: React.FC<{ label: string, value: string, color: string, dark?: boolean }> = ({ label, value, color, dark }) => {
  const accentColor: any = {
    green: 'text-green-500',
    red: 'text-red-500',
    orange: 'text-orange-500'
  };
  return (
    <div className={`${dark ? 'bg-zinc-900 text-white shadow-2xl' : 'bg-white'} rounded-3xl p-6 border border-gray-200 shadow-lg relative overflow-hidden transition-transform hover:scale-[1.02]`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <h3 className={`text-3xl font-black ${accentColor[color]}`}>{value}</h3>
      <div className={`absolute top-0 right-0 w-24 h-24 ${dark ? 'bg-white/5' : 'bg-zinc-50'} -mr-10 -mt-10 rounded-full blur-2xl`}></div>
    </div>
  );
};

export default FinancePage;
