
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudyMode from './components/StudyMode';
import TalkMode from './components/TalkMode';
import HelperMode from './components/HelperMode';
import QAMode from './components/QAMode';
import MathSolver from './components/MathSolver';
import ProfileSettings from './components/ProfileSettings';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SupportChat from './components/SupportChat';
import { AppView, UserProfile, SupportMessage } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [streak, setStreak] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  
  // Persistent Unique ID for user session
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) return JSON.parse(saved);
    return {
      id: 'student-' + Math.random().toString(36).substr(2, 9),
      name: 'স্টুডেন্ট',
      avatar: '',
      isAdmin: false
    };
  });

  // Load persistence data
  useEffect(() => {
    // Load last visit/streak
    const lastVisit = localStorage.getItem('last_visit');
    const today = new Date().toDateString();
    
    let currentStreak = 1;
    const savedStreak = localStorage.getItem('streak');
    if (savedStreak) currentStreak = parseInt(savedStreak, 10);

    if (lastVisit && lastVisit !== today) {
      currentStreak += 1;
      setStreak(currentStreak);
      localStorage.setItem('streak', currentStreak.toString());
    } else {
      setStreak(currentStreak);
    }
    localStorage.setItem('last_visit', today);

    // Load points
    const savedPoints = localStorage.getItem('total_points');
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints, 10));
    }

    // Load all users list
    const savedAllUsers = localStorage.getItem('all_users_db');
    if (savedAllUsers) {
      setAllUsers(JSON.parse(savedAllUsers));
    }

    // Load support messages
    const savedMsgs = localStorage.getItem('support_messages');
    if (savedMsgs) {
      setSupportMessages(JSON.parse(savedMsgs));
    }
  }, []);

  const updateAllUsersList = (profile: UserProfile, points: number, currentStreak: number) => {
    const userToSave = { ...profile, points, streak: currentStreak, lastActive: new Date().toISOString() };
    setAllUsers(prev => {
      const existingIdx = prev.findIndex(u => u.id === profile.id);
      let newList = [...prev];
      if (existingIdx > -1) {
        newList[existingIdx] = userToSave;
      } else {
        newList.push(userToSave);
      }
      localStorage.setItem('all_users_db', JSON.stringify(newList));
      return newList;
    });
  };

  const handleUserMessage = (text: string) => {
    const newMsg: SupportMessage = {
      id: Date.now().toString(),
      userId: userProfile.id,
      userName: userProfile.name,
      text,
      timestamp: Date.now(),
      isAdminReply: false
    };
    const updatedMsgs = [...supportMessages, newMsg];
    setSupportMessages(updatedMsgs);
    localStorage.setItem('support_messages', JSON.stringify(updatedMsgs));
  };

  const handleAdminReply = (userId: string, userName: string, text: string) => {
    const newMsg: SupportMessage = {
      id: Date.now().toString(),
      userId,
      userName: 'Admin',
      text,
      timestamp: Date.now(),
      isAdminReply: true
    };
    const updatedMsgs = [...supportMessages, newMsg];
    setSupportMessages(updatedMsgs);
    localStorage.setItem('support_messages', JSON.stringify(updatedMsgs));
  };

  const addPoints = (points: number) => {
    const newPoints = totalPoints + points;
    setTotalPoints(newPoints);
    localStorage.setItem('total_points', newPoints.toString());
    updateAllUsersList(userProfile, newPoints, streak);
  };

  const updateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
    updateAllUsersList(newProfile, totalPoints, streak);
  };

  const handleAdminSuccess = (email?: string) => {
    const adminProfile = { 
      ...userProfile, 
      isAdmin: true, 
      name: userProfile.name === 'স্টুডেন্ট' ? 'রিমন মাহমুদ রোমান' : userProfile.name 
    };
    updateProfile(adminProfile);
    setView(AppView.ADMIN_DASHBOARD);
  };

  const handleLogout = () => {
    const normalProfile = { ...userProfile, isAdmin: false };
    updateProfile(normalProfile);
    setView(AppView.DASHBOARD);
  };

  const renderView = () => {
    switch (view) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setView} streak={streak} totalPoints={totalPoints} addPoints={addPoints} userProfile={userProfile} />;
      case AppView.STUDY_MODE:
        return <StudyMode />;
      case AppView.TALK_MODE:
        return <TalkMode />;
      case AppView.HELPER_MODE:
        return <HelperMode />;
      case AppView.MATH_SOLVER:
        return <MathSolver />;
      case AppView.QA_MODE:
        return <QAMode />;
      case AppView.SUPPORT_CHAT:
        return <SupportChat userProfile={userProfile} messages={supportMessages} onSendMessage={handleUserMessage} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.ADMIN_LOGIN:
        return <AdminLogin onLoginSuccess={handleAdminSuccess} onBack={() => setView(AppView.PROFILE)} />;
      case AppView.ADMIN_DASHBOARD:
        return <AdminDashboard users={allUsers} messages={supportMessages} onAdminReply={handleAdminReply} onBack={() => setView(AppView.PROFILE)} />;
      case AppView.PROFILE:
        return (
          <ProfileSettings 
            userProfile={userProfile} 
            onUpdate={updateProfile} 
            onBack={() => setView(AppView.DASHBOARD)}
            onAdminLogin={() => setView(AppView.ADMIN_LOGIN)}
            onLogout={handleLogout}
          />
        );
      case AppView.CHALLENGE_MODE:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
             <div className="text-6xl mb-4">🎖️</div>
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">তোমার অর্জন</h2>
             <p className="text-slate-500 font-medium">তোমার বর্তমান পয়েন্ট: <span className="text-blue-600 font-black">{totalPoints}</span></p>
             <button 
               onClick={() => setView(AppView.DASHBOARD)}
               className="bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl shadow-lg mt-6"
             >
               হোমে ফিরে যাও
             </button>
          </div>
        );
      default:
        return <Dashboard setView={setView} streak={streak} totalPoints={totalPoints} addPoints={addPoints} userProfile={userProfile} />;
    }
  };

  return (
    <Layout currentView={view} setView={setView} streak={streak} userProfile={userProfile}>
      {renderView()}
    </Layout>
  );
};

export default App;
