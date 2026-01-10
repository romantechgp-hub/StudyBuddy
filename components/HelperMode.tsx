
import React, { useState } from 'react';
import { translateAndGuide, generateSpeech, decodeAudioData } from '../services/geminiService';
import { ICONS } from '../constants';

const HelperMode: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{english: string, guide: string} | null>(null);

  const translate = async () => {
    if (!text.trim()) {
      setError('অনুগ্রহ করে বাংলায় কিছু লেখো!');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await translateAndGuide(text);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('দুঃখিত! অনুবাদ করতে পারছি না। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  };

  const playTranslation = async () => {
    if (!result?.english || audioLoading) return;
    setAudioLoading(true);
    try {
      const audioData = await generateSpeech(result.english);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(audioData, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error("TTS Error:", err);
      setError('উচ্চারণ শোনাতে সমস্যা হচ্ছে।');
    } finally {
      setAudioLoading(false);
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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            {ICONS.Helper}
          </div>
          <h2 className="text-xl font-bold text-slate-800">অনুবাদ ও উচ্চারণ 🇧🇩➡️🇺🇸</h2>
        </div>
        <p className="text-slate-500 mb-6 text-sm ml-1">
          যেকোনো বাংলা কথা এখানে লিখুন বা বলুন, আমি সেটার স্মার্ট ইংরেজি শিখিয়ে দেব।
        </p>

        <div className="space-y-4">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError('');
              }}
              placeholder={isListening ? "আমি শুনছি, বলো..." : "বাংলায় লিখুন (যেমন: আমার খুব খিদে পেয়েছে)"}
              className="w-full p-5 pr-14 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              onKeyPress={(e) => e.key === 'Enter' && translate()}
            />
            <button 
              onClick={startVoiceInput}
              className={`absolute right-3 p-3 rounded-2xl transition-all ${isListening ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              {ICONS.Mic}
            </button>
          </div>
          <button
            onClick={translate}
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-[1.5rem] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i> অনুবাদ হচ্ছে...
                </span>
            ) : 'সঠিক ইংরেজি জানুন'}
          </button>
          {error && <p className="text-red-500 text-xs font-bold text-center mt-2 px-4 py-2 bg-red-50 rounded-xl">{error}</p>}
        </div>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-[3rem] border-2 border-emerald-50 text-center space-y-6 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-300">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">স্মার্ট ইংরেজি</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">"{result.english}"</h3>
          </div>
          
          <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100/50">
            <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1">উচ্চারণ গাইড</p>
            <p className="text-emerald-700 font-bold text-lg">{result.guide}</p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              onClick={playTranslation}
              disabled={audioLoading}
              className={`flex items-center justify-center gap-3 mx-auto font-black px-10 py-4 rounded-[1.5rem] transition-all active:scale-95 shadow-md ${
                audioLoading 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
              }`}
            >
                {audioLoading ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-volume-high"></i>
                )}
                {audioLoading ? 'অডিও তৈরি হচ্ছে...' : 'উচ্চারণ শুনুন'}
            </button>
            <p className="text-[10px] text-slate-400 font-medium italic">উচ্চারণ শুনে বারবার বলার চেষ্টা করো!</p>
          </div>
        </div>
      )}

      {/* Info Card */}
      {!result && !loading && (
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white flex gap-4 items-center">
           <div className="text-3xl opacity-50">💡</div>
           <div>
             <h4 className="font-bold text-sm">সহজ টিপস</h4>
             <p className="text-[11px] text-white/50 leading-relaxed">
               আপনি যা বলতে চান তা সহজ বাংলায় লিখুন। আমি আপনাকে এমন ইংরেজি শিখিয়ে দেব যা শুনলে মনে হবে আপনি একজন দক্ষ বক্তা।
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default HelperMode;
