
import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from '../types';
import { ICONS } from '../constants';
import { getDailyChallenges } from '../services/geminiService';

interface DashboardProps {
  setView: (view: AppView) => void;
  streak: number;
  totalPoints: number;
  addPoints: (points: number) => void;
  userProfile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, streak, totalPoints, addPoints, userProfile }) => {
  const [challengeInput, setChallengeInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 3
  const [message, setMessage] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [targetSentences, setTargetSentences] = useState<string[]>([]);
  const [isLoadingSentences, setIsLoadingSentences] = useState(true);

  // Load daily sentences dynamically
  useEffect(() => {
    const loadDailyGoal = async () => {
      setIsLoadingSentences(true);
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('daily_goal_date');
      const savedSentences = localStorage.getItem('daily_goal_sentences');
      const savedProgress = localStorage.getItem('daily_goal_progress');
      const savedClaimed = localStorage.getItem('daily_goal_claimed');

      if (savedDate === today && savedSentences) {
        setTargetSentences(JSON.parse(savedSentences));
        setProgress(savedProgress ? parseInt(savedProgress) : 0);
        setRewardClaimed(savedClaimed === 'true');
        if (savedProgress && parseInt(savedProgress) >= 3) setShowReward(true);
        setIsLoadingSentences(false);
      } else {
        // Fetch new sentences for the new day
        try {
          const newSentences = await getDailyChallenges();
          setTargetSentences(newSentences);
          setProgress(0);
          setRewardClaimed(false);
          setShowReward(false);
          
          localStorage.setItem('daily_goal_date', today);
          localStorage.setItem('daily_goal_sentences', JSON.stringify(newSentences));
          localStorage.setItem('daily_goal_progress', '0');
          localStorage.setItem('daily_goal_claimed', 'false');
        } catch (error) {
          console.error("Failed to fetch daily goal:", error);
          setTargetSentences(["I love learning English", "Today is a great day", "I can speak English"]);
        } finally {
          setIsLoadingSentences(false);
        }
      }
    };

    loadDailyGoal();
  }, []);

  // Update progress in storage
  useEffect(() => {
    localStorage.setItem('daily_goal_progress', progress.toString());
    if (progress >= 3) setShowReward(true);
  }, [progress]);

  const currentTarget = targetSentences[progress] || targetSentences[0] || "...";

  const handleCheckChallenge = (input: string) => {
    if (isLoadingSentences) return;

    const cleanInput = input.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = currentTarget.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    if (cleanInput === cleanTarget) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      setMessage('অসাধারণ! সঠিক হয়েছে। 🎉');
      setChallengeInput('');
      
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
      localStorage.setItem('daily_goal_claimed', 'true');
      setMessage('অভিনন্দন! ১০ পয়েন্ট যোগ হয়েছে। 💰');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800">হ্যালো {userProfile.name}! 👋</h2>
        <p className="text-slate-500 font-medium">আজকে নতুন কী শিখতে চাও?</p>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-blue-100">
          <div className="text-3xl mb-2">{ICONS.Flame}</div>
          <div className="text-2xl font-bold">{streak}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">ধারাবাহিকতা</div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-6 rounded-[2.5rem] text-white shadow-lg shadow-amber-100">
          <div className="text-3xl mb-2">🪙</div>
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">রিওয়ার্ড পয়েন্ট</div>
        </div>
      </div>

      {/* Daily Challenge Interactive Card */}
      <section className="bg-slate-900 p-6 rounded-[3rem] text-white shadow-2xl border border-slate-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-1">আজকের লক্ষ্য</p>
            <h3 className="text-lg font-bold leading-tight">নিচের বাক্যটি বলো বা লেখো:</h3>
          </div>
          <div className={`p-3 rounded-2xl text-xl transition-all ${progress >= 3 ? 'bg-amber-400 text-slate-900 scale-110 shadow-lg shadow-amber-400/20' : 'bg-white/10 text-white'}`}>
             {progress >= 3 ? '👑' : '🏆'}
          </div>
        </div>

        {progress < 3 ? (
          <div className="space-y-4">
            <div className={`bg-white/5 border border-white/10 p-5 rounded-2xl text-center transition-all ${isLoadingSentences ? 'animate-pulse' : ''}`}>
              {isLoadingSentences ? (
                <p className="text-blue-300 font-mono text-lg font-bold">নতুন লক্ষ্য তৈরি হচ্ছে...</p>
              ) : (
                <p className="text-blue-300 font-mono text-xl font-black">"{currentTarget}"</p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={challengeInput}
                  onChange={(e) => setChallengeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCheckChallenge(challengeInput)}
                  placeholder="এখানে টাইপ করো..."
                  disabled={isLoadingSentences}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                <button 
                  onClick={startVoiceInput}
                  disabled={isLoadingSentences}
                  className={`absolute right-2 top-1.5 p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-blue-400 hover:bg-white/10'}`}
                >
                  {ICONS.Mic}
                </button>
              </div>
              <button 
                onClick={() => handleCheckChallenge(challengeInput)}
                disabled={isLoadingSentences}
                className="bg-blue-600 px-5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                চেক
              </button>
            </div>
            {message && <p className={`text-center text-xs font-bold ${message.includes('সঠিক') || message.includes('যোগ') ? 'text-green-400' : 'text-amber-400'}`}>{message}</p>}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="text-4xl mb-2">🎈</div>
            <p className="text-green-400 font-bold">অভিনন্দন! আজকের সব লক্ষ্য পূরণ হয়েছে।</p>
            {rewardClaimed && <p className="text-blue-400 text-xs">আজকের ১০ পয়েন্ট সংগ্রহ করা হয়েছে!</p>}
          </div>
        )}

        <div className="w-full bg-white/10 h-2.5 rounded-full my-6 overflow-hidden">
           <div 
             className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
             style={{ width: `${(progress / 3) * 100}%` }}
           ></div>
        </div>

        {!rewardClaimed ? (
          <button 
            onClick={handleClaimReward}
            disabled={!showReward || isLoadingSentences}
            className={`w-full font-bold py-4 rounded-2xl text-sm transition-all shadow-xl ${
              showReward 
              ? 'bg-white text-slate-900 hover:bg-blue-50 active:scale-95' 
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
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

      {/* Quick Actions - List from user request */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center justify-between px-1">
          <span>তোমার সেশন বেছে নাও</span>
          <button onClick={() => setView(AppView.CHALLENGE_MODE)} className="text-blue-600 text-xs font-bold hover:underline">অর্জনসমূহ</button>
        </h3>
        <div className="grid gap-4">
          {/* 1. Study Mode */}
          <button 
            onClick={() => setView(AppView.STUDY_MODE)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all text-left group"
          >
            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-blue-600 group-hover:scale-110 transition-transform">
              {ICONS.Study}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">সহজ পড়া মোড</h4>
              <p className="text-[11px] text-slate-400 leading-none">টপিক বুঝে নাও একদম সহজে</p>
            </div>
            <div className="text-slate-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          {/* 2. Math Solver */}
          <button 
            onClick={() => setView(AppView.MATH_SOLVER)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-all text-left group"
          >
            <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-purple-600 group-hover:scale-110 transition-transform">
              {ICONS.Math}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">অংক সমাধানকারী</h4>
              <p className="text-[11px] text-slate-400 leading-none">অংক বুঝিয়ে সমাধান করে দেব</p>
            </div>
            <div className="text-slate-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          {/* 3. Speaking Helper (Translation) */}
          <button 
            onClick={() => setView(AppView.HELPER_MODE)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-all text-left group"
          >
            <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              {ICONS.Helper}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">স্পিকিং হেল্পার ও অনুবাদ</h4>
              <p className="text-[11px] text-slate-400 leading-none">সঠিক উচ্চারণ আর অনুবাদ শেখো</p>
            </div>
            <div className="text-slate-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          {/* 4. Question Answer */}
          <button 
            onClick={() => setView(AppView.QA_MODE)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-orange-200 transition-all text-left group"
          >
            <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-orange-600 group-hover:scale-110 transition-transform">
              {ICONS.QA}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">প্রশ্ন ও উত্তর</h4>
              <p className="text-[11px] text-slate-400 leading-none">মনে যা প্রশ্ন আছে সব জিজ্ঞেস করো</p>
            </div>
            <div className="text-slate-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          {/* 5. AI Buddy Chat */}
          <button 
            onClick={() => setView(AppView.TALK_MODE)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-all text-left group"
          >
            <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-amber-600 group-hover:scale-110 transition-transform">
              {ICONS.Talk}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">এআই বন্ধু চ্যাট</h4>
              <p className="text-[11px] text-slate-400 leading-none">ভয় ছাড়া English কথা বলা শুরু করো</p>
            </div>
            <div className="text-slate-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>

          {/* 6. Help Line Button */}
          <button 
            onClick={() => setView(AppView.SUPPORT_CHAT)}
            className="w-full bg-slate-50 p-5 rounded-[2rem] border-2 border-dashed border-blue-200 shadow-sm flex items-center gap-4 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">হেল্প লাইন চ্যাট</h4>
              <p className="text-[11px] text-blue-500 font-bold leading-none">সরাসরি অ্যাডমিনের সাথে কথা বলুন</p>
            </div>
            <div className="text-blue-300 group-hover:translate-x-1 transition-transform">
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
