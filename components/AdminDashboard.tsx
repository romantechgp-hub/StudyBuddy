
import React, { useState } from 'react';
import { UserProfile, SupportMessage } from '../types';
import { ICONS } from '../constants';

interface AdminDashboardProps {
  users: UserProfile[];
  messages: SupportMessage[];
  onBack: () => void;
  onAdminReply: (userId: string, userName: string, text: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, messages, onBack, onAdminReply }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages'>('users');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());
  const [replyUserId, setReplyUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Group messages by user (only those from users)
  const userMessageGroups = messages.reduce((acc, msg) => {
    if (!msg.isAdminReply) {
      if (!acc[msg.userId]) acc[msg.userId] = [];
      acc[msg.userId].push(msg);
    }
    return acc;
  }, {} as Record<string, SupportMessage[]>);

  // Statistics
  const totalUsers = users.length;
  const totalPoints = users.reduce((acc, user) => acc + (user.points || 0), 0);
  const pendingMessages = Object.keys(userMessageGroups).length;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncTime(new Date().toLocaleTimeString());
    }, 2500);
  };

  const handleSendReply = () => {
    if (!replyUserId || !replyText.trim()) return;
    const user = users.find(u => u.id === replyUserId);
    onAdminReply(replyUserId, user?.name || 'User', replyText);
    setReplyText('');
    setReplyUserId(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500 pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">সেন্ট্রাল কন্ট্রোল</h2>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isSyncing ? <i className="fa-solid fa-rotate fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-down"></i>}
          {isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউড সিঙ্ক'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
        >
          ইউজার লিস্ট ({totalUsers})
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'messages' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
        >
          হেল্প ইনবক্স {pendingMessages > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] ml-1">{pendingMessages}</span>}
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">মোট ইউজার</p>
              <h4 className="text-xl font-black text-slate-800">{totalUsers}</h4>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">মোট পয়েন্ট</p>
              <h4 className="text-xl font-black text-amber-500">{totalPoints}</h4>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">ইনবক্স</p>
              <h4 className="text-xl font-black text-blue-600">{pendingMessages}</h4>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5 flex items-center justify-between bg-slate-50 border-b border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ইউজার ডাটাবেজ</span>
               <span className="text-[8px] text-slate-300 italic">সিঙ্ক: {syncTime}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-slate-100 flex items-center justify-center text-blue-300 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{user.name}</h4>
                      <p className="text-[9px] text-slate-400">#{user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-500">{user.points || 0}🪙</p>
                    <p className="text-[9px] text-slate-300">স্ট্রিক: {user.streak || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(userMessageGroups).length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] text-center border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm font-medium italic">কোনো নতুন মেসেজ নেই।</p>
            </div>
          ) : (
            Object.keys(userMessageGroups).map((userId) => {
              const userMsgs = userMessageGroups[userId];
              const lastMsg = userMsgs[userMsgs.length - 1];
              const user = users.find(u => u.id === userId);
              return (
                <div key={userId} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{user?.name || 'অজানা ইউজার'}</h4>
                        <p className="text-[10px] text-slate-400">{new Date(lastMsg.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setReplyUserId(userId)}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
                    >
                      রিপ্লাই দিন
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{lastMsg.text}"</p>
                  </div>

                  {replyUserId === userId && (
                    <div className="space-y-3 pt-2 animate-in slide-in-from-top-2">
                       <textarea 
                         value={replyText}
                         onChange={(e) => setReplyText(e.target.value)}
                         placeholder="আপনার উত্তর লিখুন..."
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                       />
                       <div className="flex gap-2">
                         <button 
                           onClick={handleSendReply}
                           className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all"
                         >
                           পাঠিয়ে দিন
                         </button>
                         <button 
                           onClick={() => setReplyUserId(null)}
                           className="px-6 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl text-xs"
                         >
                           বাদ দিন
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
