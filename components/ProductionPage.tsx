
import React, { useState } from 'react';
import { ProductionEntry, HistoryRecord } from '../types';

interface ProductionPageProps {
  currentProduction: { day: ProductionEntry[], night: ProductionEntry[] };
  setCurrentProduction: (data: any) => void;
  productionHistory: (HistoryRecord & { firestoreId: string })[];
  saveHistory: (record: HistoryRecord) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  updateHistory: (firestoreId: string, record: HistoryRecord) => Promise<void>;
}

const ProductionPage: React.FC<ProductionPageProps> = ({ 
  currentProduction, 
  setCurrentProduction, 
  productionHistory, 
  saveHistory, 
  deleteHistory,
  updateHistory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const updateEntry = (shift: 'day' | 'night', index: number, field: keyof ProductionEntry, value: any) => {
    const newData = { ...currentProduction };
    const newShift = [...newData[shift]];
    newShift[index] = { ...newShift[index], [field]: value };
    newData[shift] = newShift;
    setCurrentProduction(newData);
  };

  const addRow = (shift: 'day' | 'night') => {
    const newData = { ...currentProduction };
    newData[shift] = [...newData[shift], { mc: '01', op: 'Operator', ds: 'Design', stitch: 0, qty: 0, prc: 0 }];
    setCurrentProduction(newData);
  };

  const removeRow = (shift: 'day' | 'night', index: number) => {
    if (currentProduction[shift].length <= 1) return;
    const newData = { ...currentProduction };
    newData[shift] = currentProduction[shift].filter((_, i) => i !== index);
    setCurrentProduction(newData);
  };

  const calculateTotals = (data: ProductionEntry[]) => {
    const qty = data.reduce((acc, curr) => acc + (parseFloat(curr.qty as any) || 0), 0);
    const tk = data.reduce((acc, curr) => acc + ((parseFloat(curr.qty as any) || 0) * (parseFloat(curr.prc as any) || 0)), 0);
    return { qty, tk };
  };

  const dayTotals = calculateTotals(currentProduction.day);
  const nightTotals = calculateTotals(currentProduction.night);
  const grandQty = dayTotals.qty + nightTotals.qty;
  const grandTk = dayTotals.tk + nightTotals.tk;

  const handleSave = async () => {
    if (grandQty === 0) {
      alert("Cannot save empty production.");
      return;
    }
    const record: HistoryRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toLocaleTimeString(),
      totalQty: grandQty,
      totalTk: grandTk,
      dayData: currentProduction.day,
      nightData: currentProduction.night,
      daySummary: dayTotals,
      nightSummary: nightTotals
    };
    await saveHistory(record);
    alert("Record saved to Cloud!");
  };

  const clearWorkspace = () => {
    if (confirm("Clear current workspace?")) {
      setCurrentProduction({
        day: [{ mc: '01', op: 'Operator', ds: 'Design', stitch: 0, qty: 0, prc: 0 }],
        night: [{ mc: '01', op: 'Operator', ds: 'Design', stitch: 0, qty: 0, prc: 0 }]
      });
    }
  };

  const handleLoadToWorkspace = (h: HistoryRecord) => {
    if (confirm("Load this record into the current workspace?")) {
      setCurrentProduction({
        day: h.dayData,
        night: h.nightData
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateHistoryField = async (h: HistoryRecord & { firestoreId: string }, shift: 'day' | 'night', index: number, field: keyof ProductionEntry, value: any) => {
    const updatedData = { ...h };
    const shiftData = [...(shift === 'day' ? updatedData.dayData : updatedData.nightData)];
    shiftData[index] = { ...shiftData[index], [field]: value };
    
    if (shift === 'day') updatedData.dayData = shiftData;
    else updatedData.nightData = shiftData;

    updatedData.daySummary = calculateTotals(updatedData.dayData);
    updatedData.nightSummary = calculateTotals(updatedData.nightData);
    updatedData.totalQty = updatedData.daySummary.qty + updatedData.nightSummary.qty;
    updatedData.totalTk = updatedData.daySummary.tk + updatedData.nightSummary.tk;

    await updateHistory(h.firestoreId, updatedData);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic border-l-8 border-orange-500 pl-4 leading-none mb-1">Production Registry</h2>
          <p className="text-[10px] text-gray-400 ml-4 font-bold uppercase tracking-widest">Live Workshop Mode</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleSave} className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition shadow-lg shadow-green-600/20">
            <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Save Record
          </button>
          <button onClick={clearWorkspace} className="flex-1 md:flex-none bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-200 transition">
            <i className="fa-solid fa-eraser mr-2"></i> Clear
          </button>
        </div>
      </div>

      {/* Main Production Entry Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <ShiftTable title="Day" shift="day" entries={currentProduction.day} updateEntry={updateEntry} addRow={addRow} removeRow={removeRow} totals={dayTotals} />
        <ShiftTable title="Night" shift="night" entries={currentProduction.night} updateEntry={updateEntry} addRow={addRow} removeRow={removeRow} totals={nightTotals} />
      </div>

      {/* Totals Banner */}
      <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full text-center md:text-left">
          <div className="w-full md:w-auto">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-1">Total Quantity</p>
            <h4 className="text-3xl md:text-4xl font-black text-orange-500">{grandQty.toLocaleString()} <span className="text-lg">PCS</span></h4>
          </div>
          <div className="hidden md:block h-12 w-px bg-zinc-800"></div>
          <div className="w-full md:w-auto">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-1">Estimated Value</p>
            <h4 className="text-3xl md:text-4xl font-black text-white">Tk {grandTk.toLocaleString()}</h4>
          </div>
        </div>
        <button onClick={() => window.print()} className="w-full md:w-auto bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest no-print transition">
          <i className="fa-solid fa-print mr-2"></i> Print Today
        </button>
      </div>

      {/* History Log */}
      <div className="mt-12 space-y-4 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-2 italic">
            <i className="fa-solid fa-history text-orange-500"></i> Cloud History
          </h3>
          <div className="relative w-full md:w-72">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search by date..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                <tr className="text-center">
                  <th className="p-5 text-left whitespace-nowrap">Date & Timestamp</th>
                  <th className="whitespace-nowrap">Total Qty</th>
                  <th className="whitespace-nowrap">Gross Value</th>
                  <th className="w-48 no-print whitespace-nowrap">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productionHistory.filter(h => (h.date || "").includes(searchTerm)).map(h => (
                  <React.Fragment key={h.firestoreId}>
                    <tr className={`text-center transition-colors ${expandedRow === h.id ? 'bg-orange-50' : 'hover:bg-zinc-50'}`}>
                      <td className="p-4 text-left">
                        <div className="font-black text-zinc-800">{h.date}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{h.timestamp}</div>
                      </td>
                      <td className="font-mono font-bold text-zinc-600">{(h.totalQty || 0).toLocaleString()}</td>
                      <td className="font-black text-green-600">Tk {(h.totalTk || 0).toLocaleString()}</td>
                      <td className="no-print">
                        <div className="flex gap-2 justify-center px-4">
                          <button 
                            onClick={() => setExpandedRow(expandedRow === h.id ? null : h.id)}
                            className={`p-2 rounded-xl text-[10px] font-black uppercase transition-all flex-1 ${
                              expandedRow === h.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-orange-500 border border-orange-200 hover:bg-orange-50'
                            }`}
                          >
                            {expandedRow === h.id ? 'Hide' : 'Expand'}
                          </button>
                          <button 
                            onClick={() => handleLoadToWorkspace(h)}
                            className="p-2 rounded-xl text-[10px] font-black uppercase text-blue-600 border border-blue-200 hover:bg-blue-50 flex-1"
                          >
                            Load
                          </button>
                          <button 
                            onClick={() => deleteHistory(h.firestoreId)}
                            className="p-2 rounded-xl text-red-600 border border-red-200 hover:bg-red-50 flex-none px-3"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === h.id && (
                      <tr className="bg-zinc-50">
                        <td colSpan={4} className="p-4 md:p-8 border-y border-zinc-200 shadow-inner">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                            <HistoryShiftTable 
                              title="Day Shift" 
                              data={h.dayData || []} 
                              summary={h.daySummary || {qty:0, tk:0}} 
                              color="orange" 
                              onUpdate={(idx, field, val) => handleUpdateHistoryField(h, 'day', idx, field, val)}
                            />
                            <HistoryShiftTable 
                              title="Night Shift" 
                              data={h.nightData || []} 
                              summary={h.nightSummary || {qty:0, tk:0}} 
                              color="indigo" 
                              onUpdate={(idx, field, val) => handleUpdateHistoryField(h, 'night', idx, field, val)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShiftTable: React.FC<any> = ({ title, shift, entries, updateEntry, addRow, removeRow, totals }) => (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden transition-all hover:shadow-2xl">
    <div className={`p-5 ${shift === 'day' ? 'bg-orange-500' : 'bg-indigo-600'} text-white flex flex-col sm:flex-row justify-between items-center gap-3`}>
      <h3 className="font-black uppercase tracking-widest flex items-center gap-2 text-sm italic">
        <i className={`fa-solid ${shift === 'day' ? 'fa-sun' : 'fa-moon'}`}></i> {title} Shift Registry
      </h3>
      <div className="flex items-center gap-4 text-[10px] font-black uppercase bg-black/10 px-3 py-1.5 rounded-full">
        <span>Qty: {totals.qty}</span>
        <span className="w-px h-3 bg-white/20"></span>
        <span>Tk: {totals.tk.toLocaleString()}</span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[600px]">
        <thead className="bg-zinc-50 text-gray-400 font-bold uppercase text-[9px] tracking-widest border-b border-gray-100">
          <tr className="text-center">
            <th className="p-4 w-12">MC#</th>
            <th className="text-left px-4">Operator Name</th>
            <th>Design</th>
            <th>Stitch</th>
            <th>Qty</th>
            <th>Rate</th>
            <th className="no-print w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((e: any, i: number) => (
            <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
              <td className="p-2"><input className="w-full text-center bg-transparent font-black border-none text-zinc-800 p-0 focus:ring-0" value={e.mc} onChange={v => updateEntry(shift, i, 'mc', v.target.value)} /></td>
              <td className="p-2 px-4"><input className="w-full bg-transparent font-bold border-none text-zinc-700 p-0 focus:ring-0" value={e.op} onChange={v => updateEntry(shift, i, 'op', v.target.value)} /></td>
              <td className="p-2"><input className="w-full text-center bg-transparent border-none text-zinc-500 p-0 focus:ring-0" value={e.ds} onChange={v => updateEntry(shift, i, 'ds', v.target.value)} /></td>
              <td className="p-2"><input className="w-full text-center bg-transparent border-none p-0 focus:ring-0" type="number" value={e.stitch} onChange={v => updateEntry(shift, i, 'stitch', parseInt(v.target.value) || 0)} /></td>
              <td className="p-2"><input className="w-full text-center bg-transparent font-black text-blue-600 border-none p-0 focus:ring-0" type="number" value={e.qty} onChange={v => updateEntry(shift, i, 'qty', parseInt(v.target.value) || 0)} /></td>
              <td className="p-2"><input className="w-full text-center bg-transparent font-black text-green-700 border-none p-0 focus:ring-0" type="number" value={e.prc} onChange={v => updateEntry(shift, i, 'prc', parseFloat(v.target.value) || 0)} /></td>
              <td className="p-2 no-print text-center"><button onClick={() => removeRow(shift, i)} className="text-red-300 hover:text-red-500"><i className="fa-solid fa-circle-minus text-lg"></i></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <button onClick={() => addRow(shift)} className="w-full py-4 bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-orange-500 transition-all text-[10px] font-black uppercase tracking-widest border-t border-zinc-100 no-print">
      <i className="fa-solid fa-plus-circle mr-2"></i> Add New Machine Row
    </button>
  </div>
);

const HistoryShiftTable: React.FC<any> = ({ title, data, summary, color, onUpdate }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`p-4 font-black uppercase text-[10px] tracking-widest flex justify-between text-white ${color === 'orange' ? 'bg-orange-500' : 'bg-indigo-600'}`}>
      <span>{title} Log</span>
      <span>Tk {summary.tk.toLocaleString()}</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-[10px] min-w-[500px]">
        <thead className="bg-zinc-100 text-zinc-500 font-bold uppercase tracking-tighter">
          <tr className="text-center">
            <th className="p-3">MC</th>
            <th className="text-left px-4">Operator</th>
            <th>Design</th>
            <th>Qty</th>
            <th>Rate</th>
            <th className="pr-4">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((d: any, i: number) => (
            <tr key={i} className="text-center hover:bg-zinc-50">
              <td className="p-2 font-black">{d.mc}</td>
              <td className="p-2 px-4 text-left font-bold text-zinc-700">{d.op}</td>
              <td className="p-2 text-zinc-500 italic">{d.ds}</td>
              <td className="p-2 font-black text-blue-600">{d.qty}</td>
              <td className="p-2 font-bold">{d.prc}</td>
              <td className="p-2 pr-4 font-black text-zinc-800">Tk {(d.qty * d.prc).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProductionPage;
