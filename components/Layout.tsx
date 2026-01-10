
import React from 'react';
import { AppView, UserProfile } from '../types';
import { ICONS, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  streak: number;
  userProfile: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, streak, userProfile }) => {
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
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-blue-100">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-800 text-sm leading-none mb-1">স্টাডিবাডি</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter leading-none">শেখো এবং কথা বলো</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {userProfile.isAdmin && (
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-blue-100 animate-pulse">
              <i className="fa-solid fa-user-shield text-[10px]"></i>
              <span className="text-[10px] font-black uppercase tracking-tighter">এডমিন</span>
            </div>
          )}
          
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100">
            <span className="animate-pulse text-xs">{ICONS.Flame}</span>
            <span className="font-bold text-xs">{streak} দিন</span>
          </div>
          
          <button 
            onClick={() => setView(AppView.PROFILE)}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-all border ${userProfile.isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
          >
            <div className={`w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm flex items-center justify-center ${userProfile.isAdmin ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-500'}`}>
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{userProfile.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700 max-w-[60px] truncate">{userProfile.name}</span>
          </button>
        </div>
      </header>

      {/* Persistent Developer Banner - Image Removed */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 px-6 py-5 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        
        <div className="max-w-2xl mx-auto flex items-center relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-blue-500/30 text-blue-200 text-[9px] px-2.5 py-1 rounded-full border border-blue-500/20 font-bold uppercase tracking-widest flex items-center gap-1.5">
                 <i className="fa-solid fa-crown text-[8px]"></i> এডমিন
               </span>
               <span className="bg-white/10 text-white/60 text-[9px] px-2.5 py-1 rounded-full border border-white/10 font-bold uppercase tracking-widest">ডেভেলপার</span>
            </div>
            <h3 className="text-xl font-black tracking-tight leading-none mb-2 text-white drop-shadow-sm">রিমন মাহমুদ রোমান</h3>
            <p className="text-xs text-white/60 font-medium flex items-center gap-2">
              <i className="fa-solid fa-envelope text-blue-400"></i> romantechgp@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full p-4 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer Message */}
        <footer className="mt-12 mb-4 text-center px-6">
          <div className="w-12 h-1 bg-slate-200 mx-auto mb-4 rounded-full opacity-50"></div>
          <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
            "প্রতিটি শিশু যেন সহজে এআই ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"
          </p>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-2 flex justify-around items-center z-50 safe-area-inset-bottom shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentView === item.id 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`text-lg ${currentView === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
