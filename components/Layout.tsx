
import React from 'react';
import { AppView } from '../types';
import { ICONS, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  streak: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, streak }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: ICONS.Home, label: 'হোম' },
    { id: AppView.STUDY_MODE, icon: ICONS.Study, label: 'পড়া' },
    { id: AppView.TALK_MODE, icon: ICONS.Talk, label: 'কথা বলা' },
    { id: AppView.HELPER_MODE, icon: ICONS.Helper, label: 'অনুবাদ' },
    { id: AppView.CHALLENGE_MODE, icon: ICONS.Challenge, label: 'লক্ষ্য' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">স্টাডিবাডি</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wide">শেখো এবং কথা বলো</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100">
          <span className="animate-pulse">{ICONS.Flame}</span>
          <span className="font-bold text-sm">{streak} দিন</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-2 flex justify-around items-center z-50 safe-area-inset-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentView === item.id 
                ? 'text-blue-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`text-xl ${currentView === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[11px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
