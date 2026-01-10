
import React, { useState, useRef } from 'react';
import { getStudyExplanation } from '../services/geminiService';
import { StudyExplanation } from '../types';
import { ICONS } from '../constants';

const StudyMode: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudyExplanation | null>(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStudy = async (imageData?: string) => {
    if (!topic && !imageData) {
      setError('অনুগ্রহ করে একটি টপিক লেখো অথবা বইয়ের ছবি তোলো।');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getStudyExplanation(topic, imageData);
      setResult(data);
    } catch (err) {
      setError('দুঃখিত! কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।');
      console.error(err);
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
      setTopic(prev => prev + " " + transcript);
    };
    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleStudy(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-slate-800">সহজ পড়া মোড 📖</h2>
          <button 
            onClick={startVoiceInput}
            className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50' : 'bg-blue-50 text-blue-600'}`}
          >
            {ICONS.Mic}
          </button>
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          পড়া সহজ ভাষায় বুঝিয়ে দেওয়ার জন্য আমি আছি। কোনো টপিক লেখো অথবা বইয়ের ছবি তোলো!
        </p>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={isListening ? "আমি শুনছি, বলো..." : "এখানে তোমার টপিক লেখো (যেমন: নিউটনের ৩য় সূত্র)"}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleStudy()}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i> ভাবছি...
                </span>
              ) : 'সহজে বুঝিয়ে দাও'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 text-slate-700 p-4 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              {ICONS.Camera}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
      </div>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-comment-dots"></i> বাংলা ব্যাখ্যা
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium">
              {result.bengali}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-language"></i> ইংরেজি ভার্সন
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {result.english}
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i> সহজ উদাহরণ (গল্প)
            </h3>
            <p className="text-slate-700 italic">
              "{result.story}"
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list-check"></i> মনে রাখার মতো মূল বিষয়
            </h3>
            <ul className="space-y-2">
              {result.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-slate-600">
                  <span className="text-blue-500 font-bold">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMode;
