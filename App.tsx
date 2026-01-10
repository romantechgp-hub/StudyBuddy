
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudyMode from './components/StudyMode';
import TalkMode from './components/TalkMode';
import HelperMode from './components/HelperMode';
import MathSolver from './components/MathSolver';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [streak, setStreak] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);

  // Load persistence data
  useEffect(() => {
    const lastVisit = localStorage.getItem('last_visit');
    const today = new Date().toDateString();
    
    if (lastVisit && lastVisit !== today) {
      setStreak(prev => prev + 1);
    }
    localStorage.setItem('last_visit', today);

    const savedPoints = localStorage.getItem('total_points');
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints, 10));
    }
  }, []);

  const addPoints = (points: number) => {
    const newPoints = totalPoints + points;
    setTotalPoints(newPoints);
    localStorage.setItem('total_points', newPoints.toString());
  };

  const renderView = () => {
    switch (view) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setView} streak={streak} totalPoints={totalPoints} addPoints={addPoints} />;
      case AppView.STUDY_MODE:
        return <StudyMode />;
      case AppView.TALK_MODE:
        return <TalkMode />;
      case AppView.HELPER_MODE:
        return <HelperMode />;
      case AppView.MATH_SOLVER:
        return <MathSolver />;
      case AppView.CHALLENGE_MODE:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="text-6xl mb-4">🎖️</div>
             <h2 className="text-2xl font-bold text-slate-800">তোমার অর্জন</h2>
             <p className="text-slate-500">তোমার বর্তমান পয়েন্ট: <span className="text-blue-600 font-bold">{totalPoints}</span></p>
             <button 
               onClick={() => setView(AppView.DASHBOARD)}
               className="bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl"
             >
               হোমে ফিরে যাও
             </button>
          </div>
        );
      default:
        return <Dashboard setView={setView} streak={streak} totalPoints={totalPoints} addPoints={addPoints} />;
    }
  };

  return (
    <Layout currentView={view} setView={setView} streak={streak}>
      {renderView()}
    </Layout>
  );
};

export default App;
