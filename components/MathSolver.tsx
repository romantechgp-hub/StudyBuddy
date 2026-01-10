
import React, { useState, useRef } from 'react';
import { solveMathProblem } from '../services/geminiService';
import { MathSolution } from '../types';
import { ICONS } from '../constants';

const MathSolver: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MathSolution | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSolve = async (imageData?: string) => {
    if (!problem && !imageData) {
      setError('অংকটি লেখো অথবা ছবি তোলো!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await solveMathProblem(problem, imageData);
      setResult(data);
    } catch (err) {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">অংক সমাধানকারী ➕</h2>
        <p className="text-slate-600 mb-6 text-sm">
          যেকোনো অংক লিখে দাও অথবা ছবি তুলে পাঠাও। আমি সমাধান আর নিয়ম দুটোই বুঝিয়ে দেব।
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="অংকটি লেখো (যেমন: 2x + 5 = 15)"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSolve()}
              disabled={loading}
              className="flex-1 bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i> সমাধান করছি...
                </span>
              ) : 'সমাধান ও ব্যাখ্যা'}
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
          <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 text-center">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">চূড়ান্ত উত্তর</p>
            <h3 className="text-3xl font-black text-purple-900">{result.finalAnswer}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-list-ol text-purple-600"></i> ধাপে ধাপে সমাধান
            </h3>
            <div className="space-y-4">
              {result.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb"></i> নিয়মটি বুঝে নাও
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {result.concept}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathSolver;
