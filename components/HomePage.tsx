
import React from 'react';
import { Tab, Staff, HistoryRecord } from '../types';

interface HomePageProps {
  staff: Staff[];
  productionHistory: HistoryRecord[];
  setActiveTab: (tab: Tab) => void;
  insights: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ staff, productionHistory, setActiveTab, insights, isAnalyzing, onAnalyze }) => {
  const totalProduction = productionHistory.reduce((acc, h) => acc + h.totalTk, 0);
  const netSalary = staff.reduce((acc, s) => {
    const earned = Math.round((s.salary / 30) * s.present) + (s.otHours * s.otRate);
    return acc + (earned - s.advance);
  }, 0);

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="hero-gradient rounded-3xl p-8 md:p-16 text-white overflow-hidden relative shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-orange-500 font-bold tracking-[0.3em] uppercase mb-4">Admin Dashboard</h2>
          <h1 className="text-4xl md:text-6xl font-black leading-none mb-6 italic uppercase">Efficiency in <br/><span className="text-orange-500">Every Stitch.</span></h1>
          <p className="text-zinc-400 text-lg mb-8 font-light">M.M SPORTS ম্যানেজমেন্ট সিস্টেমে আপনাকে স্বাগতম। এখান থেকে আপনি উৎপাদন, হাজিরা এবং বেতন সহজেই পরিচালনা করতে পারবেন।</p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab(Tab.Production)}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> নতুন উৎপাদন
            </button>
            <button 
              onClick={() => setActiveTab(Tab.Attendance)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl font-bold transition"
            >
              হাজিরা চেক করুন
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="fa-shirt" 
          label="মোট উৎপাদন (ইতিহাস)" 
          value={`Tk ${totalProduction.toLocaleString()}`} 
          color="orange"
        />
        <StatCard 
          icon="fa-users" 
          label="মোট কর্মী" 
          value={`${staff.length} জন`} 
          color="blue"
        />
        <StatCard 
          icon="fa-money-bill-wave" 
          label="নিট প্রদেয় বেতন" 
          value={`Tk ${netSalary.toLocaleString()}`} 
          color="green"
        />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black uppercase text-zinc-800 flex items-center gap-2">
            <i className="fa-solid fa-brain text-orange-500"></i> AI Factory Insights
          </h3>
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
          </button>
        </div>
        {insights ? (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
             <p className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">{insights}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">Click "Analyze Data" to get smart performance feedback for your factory.</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MenuButton icon="fa-industry" label="উৎপাদন লগ" onClick={() => setActiveTab(Tab.Production)} />
        <MenuButton icon="fa-calendar-check" label="দৈনিক হাজিরা" onClick={() => setActiveTab(Tab.Attendance)} />
        <MenuButton icon="fa-wallet" label="মাসিক স্যালারি" onClick={() => setActiveTab(Tab.Salary)} />
        <MenuButton icon="fa-arrows-rotate" label="রিফ্রেশ ডাটা" onClick={() => window.location.reload()} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string, label: string, value: string, color: string }> = ({ icon, label, value, color }) => {
  const colorClasses: any = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-all">
      <div className={`w-14 h-14 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-2xl`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: string, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="p-6 bg-white border border-zinc-200 rounded-2xl hover:border-orange-500 hover:shadow-md transition text-center group"
  >
    <i className={`fa-solid ${icon} text-3xl mb-3 text-zinc-400 group-hover:text-orange-500`}></i>
    <p className="font-bold text-sm">{label}</p>
  </button>
);

export default HomePage;
