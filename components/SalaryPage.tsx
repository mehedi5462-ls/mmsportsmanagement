
import React, { useState } from 'react';
import { Staff } from '../types';

interface SalaryPageProps {
  staff: Staff[];
  updateStaff: (id: string, field: keyof Staff, value: any) => void;
  addStaff: (data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
}

const SalaryPage: React.FC<SalaryPageProps> = ({ staff, updateStaff, addStaff, deleteStaff }) => {
  const [newStaff, setNewStaff] = useState({ name: '', role: '', salary: '' });

  const totals = staff.reduce((acc, s) => {
    const base = Math.round((s.salary / 30) * s.present);
    const ot = (s.otHours || 0) * (s.otRate || 0);
    const net = (base + ot) - (s.advance || 0);
    return {
      base: acc.base + base,
      ot: acc.ot + ot,
      adv: acc.adv + (s.advance || 0),
      net: acc.net + net
    };
  }, { base: 0, ot: 0, adv: 0, net: 0 });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) return;
    addStaff({
      name: newStaff.name,
      role: newStaff.role,
      salary: parseFloat(newStaff.salary) || 0
    });
    setNewStaff({ name: '', role: '', salary: '' });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Financial Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <DashCard label="Net Payable" value={`Tk ${totals.net.toLocaleString()}`} color="orange" dark />
        <DashCard label="Base Earnings" value={`Tk ${totals.base.toLocaleString()}`} color="zinc" />
        <DashCard label="Overtime Bill" value={`Tk ${totals.ot.toLocaleString()}`} color="blue" />
        <DashCard label="Advances" value={`Tk ${totals.adv.toLocaleString()}`} color="red" />
      </div>

      {/* Improved Staff Registration Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 no-print">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <h3 className="font-black text-gray-800 uppercase italic leading-none">Employee Registration</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enroll new worker into the system</p>
          </div>
        </div>
        
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Robin Ahmed" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
              value={newStaff.name}
              onChange={e => setNewStaff({...newStaff, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Position</label>
            <input 
              type="text" 
              placeholder="e.g. Senior Operator" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
              value={newStaff.role}
              onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monthly Basic</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
              value={newStaff.salary}
              onChange={e => setNewStaff({...newStaff, salary: e.target.value})}
              required
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-orange-500 text-white py-3.5 rounded-2xl text-xs font-black hover:bg-orange-600 transition-all uppercase tracking-[0.2em] shadow-lg shadow-orange-500/30 active:scale-95">
              Confirm Enrollment
            </button>
          </div>
        </form>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic leading-none mb-1">Payroll Sheet</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Auto-Calculated Factory Wages</p>
          </div>
          <button onClick={() => window.print()} className="w-full sm:w-auto bg-zinc-100 text-zinc-800 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition">
            <i className="fa-solid fa-print mr-2"></i> Print Payroll
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead className="bg-zinc-950 border-b border-gray-100 text-zinc-500 uppercase font-black text-[9px] tracking-widest">
              <tr className="text-center">
                <th className="p-5 w-16">SL</th>
                <th className="text-left px-6">Employee Info</th>
                <th>Days</th>
                <th>Basic Salary</th>
                <th className="bg-blue-900/10 text-blue-800">OT (Hrs)</th>
                <th className="bg-blue-900/10 text-blue-800">OT Rate</th>
                <th className="text-red-500">Advance</th>
                <th className="bg-orange-500 text-white px-6">Net Payable</th>
                <th className="no-print w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s, idx) => {
                const base = Math.round((s.salary / 30) * s.present);
                const ot = (s.otHours || 0) * (s.otRate || 0);
                const net = (base + ot) - (s.advance || 0);
                return (
                  <tr key={s.id} className="hover:bg-zinc-50 transition-colors text-center">
                    <td className="p-5 text-zinc-400 font-mono font-black">{idx + 1}</td>
                    <td className="px-6 py-4 text-left">
                      <input 
                        className="font-black text-zinc-800 bg-transparent border-none p-0 focus:ring-0 w-full hover:bg-zinc-100 rounded px-1 transition-colors" 
                        value={s.name} 
                        onChange={e => updateStaff(s.id, 'name', e.target.value)}
                      />
                      <input 
                        className="text-[9px] text-zinc-400 uppercase font-black bg-transparent border-none p-0 focus:ring-0 w-full tracking-widest" 
                        value={s.role} 
                        onChange={e => updateStaff(s.id, 'role', e.target.value)}
                      />
                    </td>
                    <td className="font-black text-blue-600">
                      <input 
                        className="w-12 text-center bg-transparent border-none font-black p-0 focus:ring-0" 
                        type="number" 
                        value={s.present} 
                        onChange={e => updateStaff(s.id, 'present', parseInt(e.target.value) || 0)} 
                      />
                    </td>
                    <td className="font-bold text-zinc-500">
                      <input 
                        className="w-24 text-center bg-transparent border-none font-bold p-0 focus:ring-0" 
                        type="number" 
                        value={s.salary} 
                        onChange={e => updateStaff(s.id, 'salary', parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td className="bg-blue-50/20 font-black text-blue-600">
                      <input className="w-12 text-center bg-transparent border-none font-black p-0 focus:ring-0" type="number" value={s.otHours} onChange={e => updateStaff(s.id, 'otHours', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="bg-blue-50/20">
                      <input className="w-16 text-center bg-transparent border-none font-bold p-0 focus:ring-0" type="number" value={s.otRate} onChange={e => updateStaff(s.id, 'otRate', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="text-red-500 font-black">
                      <input 
                        className="w-24 text-center bg-transparent border-none text-red-500 font-black p-0 focus:ring-0" 
                        type="number" 
                        value={s.advance} 
                        onChange={e => updateStaff(s.id, 'advance', parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td className="bg-orange-500 text-white font-black text-sm shadow-inner px-6">Tk {net.toLocaleString()}</td>
                    <td className="no-print p-4">
                      <button 
                        onClick={() => deleteStaff(s.id)} 
                        className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashCard: React.FC<any> = ({ label, value, color, dark }) => {
  const colorText: any = {
    orange: 'text-orange-500',
    zinc: 'text-zinc-800',
    blue: 'text-blue-600',
    red: 'text-red-600'
  };
  return (
    <div className={`${dark ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white border-zinc-200 shadow-sm'} rounded-3xl p-6 border flex flex-col justify-between transition-transform hover:scale-[1.03]`}>
      <div>
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className={`text-2xl font-black ${colorText[color]}`}>{value}</h3>
      </div>
      <div className={`mt-5 pt-4 border-t ${dark ? 'border-zinc-800' : 'border-gray-50'} flex justify-between items-center`}>
        <span className="text-[9px] font-bold uppercase opacity-30">Factory Payroll</span>
        <i className={`fa-solid ${dark ? 'fa-wallet text-orange-500' : 'fa-chart-simple text-zinc-300'}`}></i>
      </div>
    </div>
  );
};

export default SalaryPage;
