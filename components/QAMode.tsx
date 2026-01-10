
import React, { useState } from 'react';
import { askGeneralQuestion } from '../services/geminiService';
import { ICONS } from '../constants';

const QAMode: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('অনুগ্রহ করে তোমার প্রশ্নটি লেখো!');
      return;
    }
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const response = await askGeneralQuestion(question);
      setAnswer(response);
    } catch (err) {
      console.error(err);
      setError('দুঃখিত! উত্তর পাওয়া যাচ্ছে না। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজারে ভয়েস ইনপুট সাপোর্ট করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };
    recognition.start();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">প্রশ্ন ও উত্তর ❓</h2>
        <p className="text-slate-600 mb-6 text-sm">
          তোমার মনে যেকোনো প্রশ্ন থাকলে আমাকে জিজ্ঞেস করো। আমি উত্তর দিয়ে সাহায্য করব।
        </p>

        <div className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError('');
              }}
              placeholder={isListening ? "আমি শুনছি, বলো..." : "তোমার প্রশ্নটি লেখো..."}
              className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button 
              onClick={startVoiceInput}
              className={`absolute right-2 p-3 rounded-xl transition-all ${isListening ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}
            >
              {ICONS.Mic}
            </button>
          </div>
          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i> ভাবছি...
                </span>
            ) : 'উত্তর দাও'}
          </button>
          {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}
        </div>
      </div>

      {answer && (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb"></i> এআই উত্তর:
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default QAMode;
