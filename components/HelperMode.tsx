
import React, { useState } from 'react';
import { translateAndGuide } from '../services/geminiService';
import { ICONS } from '../constants';

const HelperMode: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{english: string, guide: string} | null>(null);

  const translate = async () => {
    if (!text.trim()) {
      setError('কিছু একটা লেখো!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await translateAndGuide(text);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('দুঃখিত! অনুবাদ করা সম্ভব হচ্ছে না। আবার চেষ্টা করো।');
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
      setText(transcript);
    };
    recognition.start();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">স্পিকিং হেল্পার 🇧🇩➡️🇺🇸</h2>
        <p className="text-slate-600 mb-6 text-sm">
          বাংলায় বলো কী বলতে চাও, আমি ওটার সঠিক ইংরেজি আর উচ্চারণ শিখিয়ে দেব।
        </p>

        <div className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError('');
              }}
              placeholder={isListening ? "আমি শুনছি, বলো..." : "বাংলায় লেখো (যেমন: আমি আজ খুব খুশি)"}
              className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && translate()}
            />
            <button 
              onClick={startVoiceInput}
              className={`absolute right-2 p-3 rounded-xl transition-all ${isListening ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}
            >
              {ICONS.Mic}
            </button>
          </div>
          <button
            onClick={translate}
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i> ভাবছি...
                </span>
            ) : 'এটা কীভাবে বলব?'}
          </button>
          {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}
        </div>
      </div>

      {result && result.english && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-100 text-center space-y-6 animate-in zoom-in duration-300">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">সঠিক ইংরেজি</p>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">"{result.english}"</h3>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">উচ্চারণ গাইড</p>
            <p className="text-emerald-600 font-bold text-lg">{result.guide}</p>
          </div>
          <div className="pt-2">
            <button className="flex items-center justify-center gap-2 mx-auto text-blue-600 font-bold bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
                {ICONS.Mic} এখন এটি বলো!
            </button>
            <p className="text-[10px] text-slate-400 mt-3">নিজেই একবার চেষ্টা করে দেখো!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperMode;
