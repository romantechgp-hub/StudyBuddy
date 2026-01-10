
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient, encode, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage, Modality, Chat, GenerateContentResponse } from '@google/genai';
import { ICONS } from '../constants';

const TalkMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('কথা বলতে স্টার্ট চাপো');
  const [transcript, setTranscript] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [liveCaption, setLiveCaption] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const chatRef = useRef<Chat | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  // System instruction for the AI Tutor
  const TUTOR_INSTRUCTION = `You are 'Buddy', a friendly and patient English tutor for Bengali students. 
  Your primary goal is to help the student improve their English. 
  
  CRITICAL RULES:
  1. If the student speaks or writes WRONG English (grammatical errors, wrong word choice, etc.), immediately point it out in a friendly way.
  2. ALWAYS explain the correction in BENGALI so they understand why it was wrong. 
  3. Example response: "Your sentence was 'He go to school'. That's almost right! But it should be 'He goes to school'. কারণ He হলো Third Person Singular, তাই verb-এর সাথে s/es যোগ হয়।"
  4. If they speak in Bengali, translate it to English and teach them.
  5. Keep the conversation encouraging. Don't be too formal.`;

  // Auto scroll to bottom whenever transcript changes
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveCaption, isTyping]);

  // Initialize or Reset Chat Session
  const getChatSession = () => {
    if (!chatRef.current) {
      const ai = getGeminiClient();
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: TUTOR_INSTRUCTION
        }
      });
    }
    return chatRef.current;
  };

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping || isActive) return;

    const userMsg = inputText.trim();
    setInputText('');
    setTranscript(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const chat = getChatSession();
      const result = await chat.sendMessageStream({ message: userMsg });
      
      setTranscript(prev => [...prev, { role: 'ai', text: '' }]);
      
      let fullText = '';
      for await (const chunk of result) {
        const chunkResponse = chunk as GenerateContentResponse;
        const textPart = chunkResponse.text;
        if (textPart) {
          fullText += textPart;
          setTranscript(prev => {
            const newTranscript = [...prev];
            if (newTranscript.length > 0) {
              newTranscript[newTranscript.length - 1] = { role: 'ai', text: fullText };
            }
            return newTranscript;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setTranscript(prev => [...prev, { role: 'ai', text: "দুঃখিত, এখন কথা বলতে পারছি না। একটু পরে চেষ্টা করো।" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const stopConversation = () => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('আবার কথা বলতে প্রস্তুত');
    setLiveCaption('');
    
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
  };

  const startConversation = async () => {
    try {
      setStatus('এআই বন্ধুর সাথে সংযোগ হচ্ছে...');
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGeminiClient();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('এখন বলো! আমি শুনছি...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isActive && !sessionRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputTransRef.current += text;
              setLiveCaption(text);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputTransRef.current += text;
              setLiveCaption(text);
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputTransRef.current || currentOutputTransRef.current) {
                setTranscript(prev => [
                  ...prev,
                  { role: 'user', text: currentInputTransRef.current || '(অডিও ইনপুট)' },
                  { role: 'ai', text: currentOutputTransRef.current || '...' }
                ]);
              }
              currentInputTransRef.current = '';
              currentOutputTransRef.current = '';
              setLiveCaption('');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
              });
              
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini error:', e);
            setStatus('সংযোগ সমস্যা। আবার চেষ্টা করুন...');
            stopConversation();
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: TUTOR_INSTRUCTION
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('মাইক্রোফোন চালু করা যাচ্ছে না। অনুমতি পরীক্ষা করুন।');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-4">
      {/* Voice Control Card */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center shrink-0">
        <div className={`relative w-20 h-20 rounded-full mb-3 flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-100 ring-4 ring-blue-50 scale-105' : 'bg-slate-100'}`}>
           <div className={`text-3xl transition-transform duration-500 ${isActive ? 'animate-bounce-slow' : ''}`}>
              🤖
           </div>
           {isActive && (
             <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white animate-pulse"></div>
           )}
        </div>
        
        <p className={`text-[12px] font-bold mb-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
          {status}
        </p>

        {!isActive ? (
          <button
            onClick={startConversation}
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 text-sm"
          >
            {ICONS.Mic} কথা বলো
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-red-100 text-sm"
          >
            {ICONS.Stop} বন্ধ করো
          </button>
        )}
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
        {transcript.length === 0 && !liveCaption && (
          <div className="text-center text-slate-400 py-10 italic text-sm">
            ভুল ইংরেজি লিখলে আমি সঠিকটা শিখিয়ে দেব! চ্যাট করো।
          </div>
        )}
        {transcript.map((item, i) => (
          <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              item.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {item.text || (item.role === 'ai' && <span className="italic opacity-50">চিন্তা করছি...</span>)}
            </div>
          </div>
        ))}
        {liveCaption && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm italic rounded-bl-none border border-blue-100">
              {liveCaption}...
            </div>
          </div>
        )}
        {isTyping && !isActive && transcript[transcript.length-1]?.role !== 'ai' && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-4 py-2 rounded-2xl flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Text Input Area */}
      <div className="shrink-0 space-y-2">
        <form 
          onSubmit={handleSendText}
          className={`flex gap-2 p-2 bg-white rounded-2xl border transition-all ${isActive ? 'opacity-50 border-slate-100' : 'border-slate-200 shadow-sm focus-within:border-blue-300'}`}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isActive ? "ভয়েস মোড বন্ধ করে লিখুন" : "ভুল ইংরেজি লিখলেও সমস্যা নেই!"}
            className="flex-1 bg-transparent px-3 py-2 outline-none text-sm text-slate-700 disabled:cursor-not-allowed"
            disabled={isActive || isTyping}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isActive || isTyping}
            className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:bg-slate-300 active:scale-90"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
        {isActive && <p className="text-[10px] text-center text-blue-500 font-bold animate-pulse">ভয়েস মোড চালু আছে, আমি শুনছি!</p>}
      </div>
    </div>
  );
};

export default TalkMode;
