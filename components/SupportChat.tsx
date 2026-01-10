
import React, { useState, useEffect, useRef } from 'react';
import { SupportMessage, UserProfile } from '../types';

interface SupportChatProps {
  userProfile: UserProfile;
  messages: SupportMessage[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({ userProfile, messages, onSendMessage, onBack }) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userMessages = messages.filter(m => m.userId === userProfile.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-none mb-1">হেল্প লাইন</h2>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            অ্যাডমিন অনলাইন
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar pb-4">
        {userMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-4 opacity-50">
             <div className="text-5xl">💬</div>
             <p className="text-slate-500 text-sm font-medium">আপনার যেকোনো সমস্যা বা ফিডব্যাক এখানে লিখুন। অ্যাডমিন খুব দ্রুত উত্তর দেবেন।</p>
          </div>
        ) : (
          userMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAdminReply ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.isAdminReply 
                ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' 
                : 'bg-blue-600 text-white rounded-br-none'
              }`}>
                {msg.isAdminReply && (
                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mb-1">অ্যাডমিন রিপ্লাই</p>
                )}
                <p className="text-sm font-medium">{msg.text}</p>
                <p className={`text-[8px] mt-1 ${msg.isAdminReply ? 'text-slate-400' : 'text-blue-200'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="এখানে মেসেজ লিখুন..."
          className="flex-1 px-4 py-2 outline-none text-sm font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-90"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default SupportChat;
