
import React, { useState } from 'react';
import { Thread } from '../types';

interface ThreadPageProps {
  threads: Thread[];
  updateThread: (id: string, field: keyof Thread, value: any) => Promise<void>;
  addThread: () => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
}

const ThreadPage: React.FC<ThreadPageProps> = ({ threads, updateThread, addThread, deleteThread }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredThreads = (threads || []).filter(t => 
    (t.code || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase italic border-l-8 border-orange-500 pl-4 leading-none mb-1">Thread Management</h2>
          <p className="text-xs text-gray-400 ml-4 font-bold uppercase tracking-widest">Stock & Inventory Monitor</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input 
            type="text" 
            placeholder="Search code or color..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm"
          />
          <button onClick={addThread} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition shadow-sm">
            <i className="fa-solid fa-plus mr-1"></i> Add Thread
          </button>
          <button onClick={() => window.print()} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition">Print Report</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-white font-bold uppercase text-[10px] tracking-widest">
              <tr className="text-center">
                <th className="p-4 w-16">SN No</th>
                <th className="text-left px-6">Color Code</th>
                <th className="text-left px-6">Color Name</th>
                <th>In Stock</th>
                <th className="text-orange-400">Out</th>
                <th className="bg-orange-500 text-white">Total Stock</th>
                <th className="no-print w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredThreads.map((t) => {
                const totalStock = (t.stock || 0) - (t.out || 0);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors text-center">
                    <td className="p-4 font-mono text-gray-400 font-bold">{t.sn}</td>
                    <td className="text-left px-6 font-black text-zinc-800">
                      <input 
                        className="bg-transparent border-none focus:ring-1 focus:ring-orange-100 rounded w-full"
                        value={t.code || ""}
                        onChange={(e) => updateThread(t.id, 'code', e.target.value)}
                      />
                    </td>
                    <td className="text-left px-6 text-zinc-600 font-bold italic">
                      <input 
                        className="bg-transparent border-none focus:ring-1 focus:ring-orange-100 rounded w-full"
                        value={t.name || ""}
                        onChange={(e) => updateThread(t.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="w-20 text-center font-bold text-zinc-800 bg-transparent border-none focus:ring-2 focus:ring-zinc-100 rounded-lg p-1"
                        value={t.stock || 0}
                        onChange={(e) => updateThread(t.id, 'stock', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="w-20 text-center font-bold text-orange-600 bg-transparent border-none focus:ring-2 focus:ring-orange-50 rounded-lg p-1"
                        value={t.out || 0}
                        onChange={(e) => updateThread(t.id, 'out', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className={`bg-orange-50 font-black text-lg ${totalStock <= 10 ? 'text-red-600' : 'text-orange-700'}`}>
                      {totalStock}
                    </td>
                    <td className="no-print">
                      <button 
                        onClick={() => deleteThread(t.id)} 
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Delete Thread"
                      >
                        <i className="fa-solid fa-trash-can text-lg"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredThreads.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic font-medium">No matching thread records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Total Items in Inventory</p>
            <h3 className="text-3xl font-black">{threads.length}</h3>
          </div>
          <i className="fa-solid fa-boxes-stacked text-4xl text-orange-500 opacity-50"></i>
        </div>
        <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">Low Stock Warning</p>
            <h3 className="text-3xl font-black">{threads.filter(t => ((t.stock || 0) - (t.out || 0)) <= 15).length} Colors</h3>
          </div>
          <i className="fa-solid fa-triangle-exclamation text-4xl text-white opacity-50 animate-pulse"></i>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage;
