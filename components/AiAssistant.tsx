import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Send, Sparkles, User, Bot, Phone, PhoneOff, Activity, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AiAssistantProps {
  user: UserProfile;
}

const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
};

const base64Encode = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64Decode = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const AiAssistant: React.FC<AiAssistantProps> = ({ user }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user.username}! I'm your Flowing Wisdom assistant. You can chat with me here, or tap the phone icon to start a real-time voice conversation!` }
  ]);
  const [input, setInput] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volumeLevel, setVolumeLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const liveSessionRef = useRef<any>(null);

  useEffect(() => {
    if (mode === 'text') scrollToBottom();
  }, [messages, mode]);

  useEffect(() => {
    return () => {
      stopLiveSession();
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendText = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTextLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: `You are a helpful, empathetic period tracking assistant for a teenager named ${user.username}, age ${user.age}. Keep answers concise.`
          },
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });
      
      const result = await chat.sendMessageStream({ message: userMsg.text });
      let fullResponse = '';
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of result) {
          fullResponse += chunk.text;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullResponse } : m));
      }
    } catch (error) {
        console.error("AI Error", error);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error. Please try again." }]);
    } finally {
        setTextLoading(false);
    }
  };

  const startLiveSession = async () => {
    try {
      setLiveStatus('connecting');
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let activeSession: any = null;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are Flowing Wisdom, a supportive health assistant for ${user.username}.`,
        },
        callbacks: {
          onopen: () => {
            setLiveStatus('connected');
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
              setVolumeLevel(sum / (inputData.length/100));
              const pcm16 = floatTo16BitPCM(inputData);
              const base64Data = base64Encode(pcm16);
              if (activeSession) {
                activeSession.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64Data } });
              }
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const rawBytes = base64Decode(audioData);
              const int16Data = new Int16Array(rawBytes.buffer);
              const float32Data = new Float32Array(int16Data.length);
              for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
              }
              const audioBuffer = outputCtx.createBuffer(1, float32Data.length, 24000);
              audioBuffer.getChannelData(0).set(float32Data);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
            }
          },
          onclose: () => setLiveStatus('disconnected'),
          onerror: () => setLiveStatus('disconnected')
        }
      });
      activeSession = await sessionPromise;
      liveSessionRef.current = activeSession;
    } catch (error) {
      setLiveStatus('disconnected');
    }
  };

  const stopLiveSession = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setLiveStatus('disconnected');
  };

  const toggleMode = () => {
    if (mode === 'text') {
      setMode('live');
    } else {
      stopLiveSession();
      setMode('text');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden relative"
    >
        <div className="bg-gradient-to-r from-[#FF2D55] to-[#7C3AED] p-5 text-white flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="font-bold text-xl">Flowing Wisdom AI</h2>
                    <p className="text-xs opacity-90 font-medium tracking-wide uppercase">{mode === 'live' ? 'Live Voice Call' : 'Chat Assistant'}</p>
                </div>
            </div>
            <button 
              onClick={toggleMode}
              className={`p-3 rounded-full transition-all shadow-lg ${mode === 'live' ? 'bg-white text-red-500' : 'bg-white/20 hover:bg-white/30 text-white'}`}
            >
              {mode === 'live' ? <PhoneOff size={24} /> : <Phone size={24} />}
            </button>
        </div>

        {mode === 'text' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm
                            ${msg.role === 'user' ? 'bg-[#FF2D55] text-white' : 'bg-white border border-gray-100 text-[#7C3AED]'}`}>
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className={`group relative p-4 rounded-3xl max-w-[80%] text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-[#FF2D55] text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                            {msg.text}
                            {msg.role === 'model' && (
                                <button onClick={() => speakText(msg.text)} className="absolute -bottom-8 left-0 text-gray-400 hover:text-[#7C3AED] transition-colors p-2">
                                    <Volume2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {textLoading && (
                    <div className="flex gap-4">
                         <div className="w-10 h-10 bg-white border border-gray-100 text-[#7C3AED] rounded-full flex items-center justify-center"><Bot size={20} /></div>
                         <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder="Type your message..."
                        disabled={textLoading}
                        className="flex-1 bg-gray-50 rounded-full px-6 h-12 focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-800 placeholder-gray-400 border border-gray-200"
                    />
                    <button 
                        onClick={handleSendText}
                        disabled={!input.trim() || textLoading}
                        className="bg-[#7C3AED] text-white w-12 h-12 rounded-full hover:scale-105 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center"
                    >
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            </div>
          </>
        )}

        {mode === 'live' && (
          <div className="flex-1 bg-[#2D1B4E] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7C3AED] rounded-full blur-[120px] opacity-30 animate-pulse"></div>
             
             <div className="relative z-10 flex flex-col items-center gap-10">
                {liveStatus === 'disconnected' && (
                   <div className="text-center space-y-6">
                      <h3 className="text-white text-2xl font-bold">Start a conversation</h3>
                      <button 
                        onClick={startLiveSession}
                        className="bg-[#00E0C6] hover:bg-[#00C0A8] text-[#2D1B4E] px-10 py-5 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(0,224,198,0.4)] transition-all transform hover:scale-105 flex items-center gap-3"
                      >
                         <Phone size={28} />
                         Start Call
                      </button>
                   </div>
                )}

                {liveStatus === 'connecting' && (
                   <div className="text-center">
                      <Loader2 size={80} className="text-[#00E0C6] animate-spin mb-6" />
                      <p className="text-gray-300 font-medium text-lg">Connecting...</p>
                   </div>
                )}

                {liveStatus === 'connected' && (
                   <div className="text-center space-y-12">
                      <div className="relative flex items-center justify-center">
                         <div className="absolute w-64 h-64 bg-[#FF2D55] rounded-full blur-2xl opacity-40 transition-all duration-75"
                              style={{ transform: `scale(${1 + volumeLevel * 4})` }}></div>
                         <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#FF2D55] to-[#7C3AED] flex items-center justify-center shadow-2xl border-4 border-white/20 z-10">
                            <Sparkles size={60} className="text-white animate-pulse" />
                         </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[#00E0C6] font-bold bg-white/10 py-2 px-6 rounded-full mx-auto w-fit backdrop-blur-sm border border-white/10">
                         <Activity size={18} className="animate-pulse" />
                         Live Connection
                      </div>

                      <button 
                        onClick={stopLiveSession}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
                      >
                         <PhoneOff size={32} />
                      </button>
                   </div>
                )}
             </div>
          </div>
        )}
    </motion.div>
  );
};

export default AiAssistant;