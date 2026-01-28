
import React from 'react';
import { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: Tab.Home, label: 'Home' },
    { id: Tab.Production, label: 'Production' },
    { id: Tab.Thread, label: 'Thread' },
    { id: Tab.Attendance, label: 'Present' },
    { id: Tab.Salary, label: 'Salary' },
    { id: Tab.Finance, label: 'Finance' },
  ];

  return (
    <header className="bg-zinc-900 text-white shadow-xl sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center gap-3">
            <h1 
              className="text-2xl md:text-3xl font-extrabold tracking-tighter italic cursor-pointer" 
              onClick={() => setActiveTab(Tab.Home)}
            >
              M.M <span className="text-orange-500">SPORTS</span>
            </h1>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Cloud Sync</span>
            </div>
          </div>
          {/* Mobile indicator for scrolling */}
          <div className="md:hidden text-zinc-600 text-[10px] font-black uppercase">
            <i className="fa-solid fa-arrows-left-right animate-pulse mr-1"></i> Swipe
          </div>
        </div>
        <nav className="flex space-x-1 overflow-x-auto w-full md:w-auto no-scrollbar scroll-smooth pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-bold uppercase text-[10px] md:text-xs tracking-wider transition-all border-b-2 md:border-b-4 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
