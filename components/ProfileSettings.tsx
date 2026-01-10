
import React, { useState, useRef } from 'react';
import { UserProfile, AppView } from '../types';
import { ICONS } from '../constants';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
  onAdminLogin: () => void;
  onLogout: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userProfile, onUpdate, onBack, onAdminLogin, onLogout }) => {
  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate({ ...userProfile, name, avatar });
    onBack();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">আমার প্রোফাইল</h2>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
        {/* Avatar Upload */}
        <div className="relative mb-8 group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-blue-50 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-blue-300">{ICONS.User}</span>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {ICONS.Camera}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Name Input */}
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">তোমার নাম</label>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                 <i className="fa-solid fa-user"></i>
               </span>
               <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="নাম লেখো..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            প্রোফাইল সেভ করো
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 px-2 flex items-center gap-2">
          {ICONS.Lock} সেটিংস
        </h4>
        
        {userProfile.isAdmin ? (
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">এডমিন স্ট্যাটাস</p>
                <p className="font-bold text-slate-800">লগইন করা আছে</p>
              </div>
            </div>
            
            <button 
              onClick={onAdminLogin}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-all text-sm mt-2 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-chart-line"></i> ইউজার ডাটাবেজ দেখুন
            </button>

            <button 
              onClick={onLogout}
              className="w-full bg-white text-red-600 font-bold py-3 rounded-2xl border border-red-100 hover:bg-red-50 transition-all text-sm"
            >
              এডমিন লগআউট
            </button>
          </div>
        ) : (
          <button 
            onClick={onAdminLogin}
            className="w-full bg-slate-900 text-white font-bold p-5 rounded-[2rem] flex items-center gap-4 hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
          >
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">
              {ICONS.Lock}
            </div>
            <div className="text-left">
              <h4 className="font-bold">এডমিন প্যানেল</h4>
              <p className="text-[10px] text-white/50">ডেভেলপারের জন্য সংরক্ষিত</p>
            </div>
          </button>
        )}
      </div>

      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
        <div className="flex gap-4">
          <div className="text-2xl mt-1">💡</div>
          <div>
            <h4 className="font-bold text-amber-800 text-sm mb-1">প্রোফাইল কেন দরকার?</h4>
            <p className="text-amber-700/80 text-xs leading-relaxed">
              নিজের নাম আর ছবি দিলে স্টাডিবাডি তোমাকে আরও আপন করে চিনবে এবং তোমার সাথে বন্ধুত্বের মতো কথা বলবে!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
