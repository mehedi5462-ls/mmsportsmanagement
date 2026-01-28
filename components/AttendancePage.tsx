
import React from 'react';
import { Staff } from '../types';

interface AttendancePageProps {
  staff: Staff[];
  updateStaff: (id: string, field: keyof Staff, value: any) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ staff, updateStaff }) => {
  const presentCount = staff.filter(s => s.present > 0).length;
  const absentCount = staff.length - presentCount;
  const totalEarned = staff.reduce((acc, s) => acc + Math.round((s.salary / 30) * s.present), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-black text-gray-800 uppercase border-l-8 border-orange-500 pl-4 leading-none mb-1">Attendance</h2>
          <p className="text-[10px] text-gray-400 ml-4 font-bold uppercase tracking-widest">Presence Monitor</p>
        </div>
        <StatusCard icon="fa-user-check" label="Present Today" value={presentCount} color="green" />
        <StatusCard icon="fa-user-xmark" label="Absent Today" value={absentCount} color="red" />
        <StatusCard icon="fa-bangladeshi-taka-sign" label="Total Day Payable" value={`Tk ${totalEarned.toLocaleString()}`} color="black" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-gray-100">
              <tr className="text-gray-500 font-bold uppercase text-[10px]">
                <th className="p-4 w-12">SL</th>
                <th className="text-left">Employee Info</th>
                <th className="no-print">Attendance</th>
                <th>Days Present</th>
                <th>Earned</th>
                <th className="text-red-500">Advance</th>
                <th className="bg-orange-50 text-orange-700">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s, idx) => {
                const daily = Math.round(s.salary / 30);
                const earned = daily * s.present;
                const net = earned - s.advance;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center text-gray-400 font-bold">{idx + 1}</td>
                    <td className="text-left">
                      <div className="font-black text-gray-800">{s.name}</div>
                      <div className="text-[10px] text-orange-500 font-bold uppercase">{s.role}</div>
                    </td>
                    <td className="no-print">
                      <div className="flex gap-1 justify-center">
                        <button 
                          onClick={() => updateStaff(s.id, 'present', Math.min(31, s.present + 1))}
                          className="bg-green-100 text-green-700 w-8 h-8 rounded-lg hover:bg-green-500 hover:text-white transition shadow-sm"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                        <button 
                          onClick={() => updateStaff(s.id, 'present', Math.max(0, s.present - 1))}
                          className="bg-red-100 text-red-700 w-8 h-8 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                      </div>
                    </td>
                    <td className="text-center">
                      <input 
                        className="w-16 text-center bg-transparent font-black text-blue-600 text-lg border-none"
                        type="number" 
                        value={s.present} 
                        onChange={e => updateStaff(s.id, 'present', parseInt(e.target.value) || 0)} 
                      />
                    </td>
                    <td className="text-center font-bold text-gray-700">{earned.toLocaleString()}</td>
                    <td className="text-center">
                      <input 
                        className="w-24 text-center bg-transparent text-red-500 font-bold border-none"
                        type="number" 
                        value={s.advance} 
                        onChange={e => updateStaff(s.id, 'advance', parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td className="bg-orange-50 text-center font-black text-lg text-orange-700">
                      Tk {net.toLocaleString()}
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

const StatusCard: React.FC<{ icon: string, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => {
  const colors: any = {
    green: 'bg-green-50 border-green-100 text-green-600 icon:bg-green-500',
    red: 'bg-red-50 border-red-100 text-red-600 icon:bg-red-500',
    black: 'bg-zinc-900 border-zinc-800 text-zinc-400 icon:bg-orange-500'
  };
  const isBlack = color === 'black';
  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isBlack ? 'bg-zinc-900 text-white shadow-xl border-zinc-800' : colors[color]}`}>
      <div className={`w-10 h-10 ${isBlack ? 'bg-orange-500' : (color === 'green' ? 'bg-green-500' : 'bg-red-500')} text-white rounded-full flex items-center justify-center`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase ${isBlack ? 'text-zinc-400' : ''}`}>{label}</p>
        <h3 className={`text-xl font-black ${isBlack ? 'text-white' : ''}`}>{value}</h3>
      </div>
    </div>
  );
};

export default AttendancePage;
