import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Send, Mic, Sparkles, User, Bot, StopCircle, Volume2, Square, Loader2, Phone, PhoneOff, Activity } from 'lucide-react';

interface AiAssistantProps {
  user: UserProfile;
}

// --- Audio Utils for Live API ---

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
  // --- Text Mode State ---
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user.username}! I'm your Flowing Wisdom assistant. You can chat with me here, or tap the phone icon to start a real-time voice conversation!` }
  ]);
  const [input, setInput] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // --- Live Mode State ---
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volumeLevel, setVolumeLevel] = useState(0);

  // --- Refs for Live API ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const liveSessionRef = useRef<any>(null);

  // --- Common Effects ---
  useEffect(() => {
    if (mode === 'text') {
      scrollToBottom();
    }
  }, [messages, mode]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopLiveSession();
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Text Mode Logic ---

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

  // --- Live Mode Logic ---

  const startLiveSession = async () => {
    try {
      setLiveStatus('connecting');
      
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 }); // Input required at 16k
      audioContextRef.current = audioCtx;
      
      // Output context (can be standard rate)
      const outputCtx = new AudioContextClass({ sampleRate: 24000 }); // High quality output
      
      // 2. Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Variable to hold the session so the audio processor can access it
      let activeSession: any = null;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are Flowing Wisdom, a supportive, big-sister-like health assistant for ${user.username}, age ${user.age}. You are talking over a voice call. Keep responses short, conversational, and encouraging.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setLiveStatus('connected');
            setIsLiveConnected(true);

            // Start Audio Stream Processing
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple visualizer data
              let sum = 0;
              for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
              setVolumeLevel(sum / (inputData.length/100));

              // Convert to PCM 16-bit
              const pcm16 = floatTo16BitPCM(inputData);
              const base64Data = base64Encode(pcm16);

              if (activeSession) {
                activeSession.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const rawBytes = base64Decode(audioData);
              
              // Decode raw PCM to AudioBuffer
              // Gemini returns PCM 24kHz (based on outputCtx sampleRate choice)
              // We need to manually convert raw PCM bytes to float32 for AudioBuffer
              
              // Helper to decode raw PCM (Int16) to AudioBuffer
              const int16Data = new Int16Array(rawBytes.buffer);
              const float32Data = new Float32Array(int16Data.length);
              for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
              }

              const audioBuffer = outputCtx.createBuffer(1, float32Data.length, 24000);
              audioBuffer.getChannelData(0).set(float32Data);

              // Schedule playback
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setLiveStatus('disconnected');
            setIsLiveConnected(false);
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setLiveStatus('disconnected');
            alert("Connection interrupted.");
          }
        }
      });

      // Wait for connection to establish so we can send data
      activeSession = await sessionPromise;
      liveSessionRef.current = activeSession;

    } catch (error) {
      console.error("Failed to start live session", error);
      setLiveStatus('disconnected');
      setIsLiveConnected(false);
    }
  };

  const stopLiveSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    // No explicit close method on the session object in the example, 
    // but usually closing the client or context is enough.
    // Ideally: liveSessionRef.current?.close(); 
    
    // Reset refs
    streamRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    nextStartTimeRef.current = 0;
    
    setLiveStatus('disconnected');
    setIsLiveConnected(false);
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
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 text-white flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-lg">Flowing Wisdom AI</h2>
                    <p className="text-xs opacity-80">{mode === 'live' ? 'Live Voice Call' : 'Chat Assistant'}</p>
                </div>
            </div>
            <button 
              onClick={toggleMode}
              className={`p-2 rounded-full transition-all ${mode === 'live' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              title={mode === 'live' ? "Switch to Text" : "Start Live Call"}
            >
              {mode === 'live' ? <PhoneOff size={20} /> : <Phone size={20} />}
            </button>
        </div>

        {/* --- TEXT MODE UI --- */}
        {mode === 'text' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 
                            ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-accent-100 text-accent-600'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`group relative p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                            {msg.text}
                            {msg.role === 'model' && (
                                <button onClick={() => speakText(msg.text)} className="absolute -bottom-6 left-0 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                    <Volume2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {textLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center"><Bot size={16} /></div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center">
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
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                            placeholder="Type your message..."
                            disabled={textLoading}
                            className="w-full h-full bg-gray-50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary-300 text-gray-800 placeholder-gray-400 border border-gray-200"
                        />
                    </div>
                    <button 
                        onClick={handleSendText}
                        disabled={!input.trim() || textLoading}
                        className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
          </>
        )}

        {/* --- LIVE MODE UI --- */}
        {mode === 'live' && (
          <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
             
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 z-0"></div>
             
             {/* Main Visualizer */}
             <div className="relative z-10 flex flex-col items-center gap-8">
                
                {liveStatus === 'disconnected' && (
                   <div className="text-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto border-4 border-gray-700">
                         <Bot size={64} className="text-gray-500" />
                      </div>
                      <h3 className="text-white text-xl font-medium">Start a conversation</h3>
                      <button 
                        onClick={startLiveSession}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform hover:scale-105 flex items-center gap-3"
                      >
                         <Phone size={24} />
                         Start Call
                      </button>
                   </div>
                )}

                {liveStatus === 'connecting' && (
                   <div className="text-center">
                      <Loader2 size={64} className="text-primary-400 animate-spin mb-4" />
                      <p className="text-gray-400">Connecting to Gemini Live...</p>
                   </div>
                )}

                {liveStatus === 'connected' && (
                   <div className="text-center space-y-12">
                      <div className="relative">
                         {/* Pulsing Rings based on volume */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/20 rounded-full blur-xl transition-all duration-100"
                              style={{ transform: `translate(-50%, -50%) scale(${1 + volumeLevel * 5})` }}></div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent-500/30 rounded-full blur-md transition-all duration-100"
                              style={{ transform: `translate(-50%, -50%) scale(${1 + volumeLevel * 3})` }}></div>
                         
                         <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-2xl border-4 border-gray-800 z-10">
                            <Sparkles size={48} className="text-white animate-pulse" />
                         </div>
                      </div>

                      <div>
                         <h3 className="text-2xl font-bold text-white mb-2">Flowing Wisdom</h3>
                         <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium bg-gray-800/50 py-1 px-3 rounded-full mx-auto w-fit">
                            <Activity size={14} className="animate-pulse" />
                            Live Connection
                         </div>
                      </div>

                      <div className="flex justify-center gap-6">
                         <button 
                           onClick={stopLiveSession}
                           className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                         >
                            <PhoneOff size={28} />
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}
    </div>
  );
};

export default AiAssistant;