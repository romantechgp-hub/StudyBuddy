
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  setView: (view: AppView) => void;
  streak: number;
  totalPoints: number;
  addPoints: (points: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, streak, totalPoints, addPoints }) => {
  const [challengeInput, setChallengeInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 3
  const [message, setMessage] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Today's target sentence
  const targetSentences = [
    "I love learning English",
    "StudyBuddy is my friend",
    "I want to speak fluently"
  ];

  const currentTarget = targetSentences[progress] || targetSentences[0];

  const handleCheckChallenge = (input: string) => {
    const cleanInput = input.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = currentTarget.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    if (cleanInput === cleanTarget) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      setMessage('অসাধারণ! সঠিক হয়েছে। 🎉');
      setChallengeInput('');
      
      if (nextProgress >= 3) {
        setShowReward(true);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('আবার চেষ্টা করো, বানান ঠিক আছে তো?');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজারে ভয়েস ইনপুট সাপোর্ট করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChallengeInput(transcript);
      handleCheckChallenge(transcript);
    };
    recognition.start();
  };

  const handleClaimReward = () => {
    if (showReward && !rewardClaimed) {
      addPoints(10);
      setRewardClaimed(true);
      setShowReward(false);
      setMessage('অভিনন্দন! ১০ পয়েন্ট যোগ হয়েছে। 💰');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800">হ্যালো স্টুডেন্ট! 👋</h2>
        <p className="text-slate-500 font-medium">আজকে নতুন কী শিখতে চাও?</p>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100">
          <div className="text-3xl mb-2">{ICONS.Flame}</div>
          <div className="text-2xl font-bold">{streak}</div>
          <div className="text-xs font-medium opacity-80">দিনের ধারাবাহিকতা</div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-6 rounded-[2rem] text-white shadow-lg shadow-amber-100">
          <div className="text-3xl mb-2">🪙</div>
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-xs font-medium opacity-80">মোট রিওয়ার্ড পয়েন্ট</div>
        </div>
      </div>

      {/* Daily Challenge Interactive Card */}
      <section className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl border border-slate-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-1">আজকের লক্ষ্য</p>
            <h3 className="text-xl font-bold">নিচের বাক্যটি বলো বা লেখো:</h3>
          </div>
          <div className={`p-3 rounded-2xl text-xl transition-all ${progress >= 3 ? 'bg-amber-400 text-slate-900 scale-110 shadow-lg shadow-amber-400/20' : 'bg-white/10 text-white'}`}>
             {progress >= 3 ? '👑' : '🏆'}
          </div>
        </div>

        {progress < 3 ? (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <p className="text-blue-300 font-mono text-lg font-bold">"{currentTarget}"</p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={challengeInput}
                  onChange={(e) => setChallengeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCheckChallenge(challengeInput)}
                  placeholder="এখানে টাইপ করো..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                />
                <button 
                  onClick={startVoiceInput}
                  className={`absolute right-2 top-1.5 p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-blue-400 hover:bg-white/10'}`}
                >
                  {ICONS.Mic}
                </button>
              </div>
              <button 
                onClick={() => handleCheckChallenge(challengeInput)}
                className="bg-blue-600 px-4 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all"
              >
                চেক
              </button>
            </div>
            {message && <p className={`text-center text-xs font-bold ${message.includes('সঠিক') || message.includes('যোগ') ? 'text-green-400' : 'text-amber-400'}`}>{message}</p>}
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <p className="text-green-400 font-bold">অভিনন্দন! আজকের সব লক্ষ্য পূরণ হয়েছে।</p>
            {rewardClaimed && <p className="text-blue-400 text-xs">আজকের ১০ পয়েন্ট সংগ্রহ করা হয়েছে!</p>}
          </div>
        )}

        <div className="w-full bg-white/10 h-2 rounded-full my-6 overflow-hidden">
           <div 
             className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
             style={{ width: `${(progress / 3) * 100}%` }}
           ></div>
        </div>

        {!rewardClaimed ? (
          <button 
            onClick={handleClaimReward}
            disabled={!showReward}
            className={`w-full font-bold py-4 rounded-2xl text-sm transition-all shadow-lg ${
              showReward 
              ? 'bg-white text-slate-900 hover:bg-blue-50 active:scale-95' 
              : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
             {showReward ? 'পুরস্কার গ্রহণ করো 🎁' : 'লক্ষ্য পূরণ করে পুরস্কার নাও'}
          </button>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-4 rounded-2xl text-center text-sm">
             ১০ পয়েন্ট যোগ হয়েছে! কাল আবার এসো 🌙
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center justify-between px-1">
          <span>তোমার সেশন বেছে নাও</span>
          <span className="text-blue-600 text-xs font-bold">সব দেখো</span>
        </h3>
        <div className="space-y-3">
          <button 
            onClick={() => setView(AppView.STUDY_MODE)}
            className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all text-left group"
          >
            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-blue-600 group-hover:scale-110 transition-transform">
              {ICONS.Study}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">সহজ পড়া মোড</h4>
              <p className="text-xs text-slate-400">টপিক বুঝে নাও একদম সহজে</p>
            </div>
            <div className="text-slate-300">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          <button 
            onClick={() => setView(AppView.MATH_SOLVER)}
            className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-all text-left group"
          >
            <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-purple-600 group-hover:scale-110 transition-transform">
              {ICONS.Math}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">অংক সমাধানকারী</h4>
              <p className="text-xs text-slate-400">অংক সমাধান আর নিয়ম বুঝে নাও</p>
            </div>
            <div className="text-slate-300">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          <button 
            onClick={() => setView(AppView.TALK_MODE)}
            className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-all text-left group"
          >
            <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-amber-600 group-hover:scale-110 transition-transform">
              {ICONS.Talk}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">এআই বন্ধু চ্যাট</h4>
              <p className="text-xs text-slate-400">ভয় ছাড়া English কথা বলা শুরু করো</p>
            </div>
            <div className="text-slate-300">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
