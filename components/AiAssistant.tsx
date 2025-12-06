import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { Send, Sparkles, User, Bot, Phone, PhoneOff, Activity, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { chatWithAi } from '../services/api';

interface AiAssistantProps {
  user: UserProfile;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ user }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user.username}! I'm your Flowing Wisdom assistant. You can chat with me here.` }
  ]);
  const [input, setInput] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live mode states (Placeholder for future implementation)
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    if (mode === 'text') scrollToBottom();
  }, [messages, mode]);

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
      // Call backend API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithAi(userMsg.text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("AI Error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setTextLoading(false);
    }
  };

  // Simplified Live Mode for now (Text-to-Speech fallback or placeholder)
  const startLiveSession = () => {
    setLiveStatus('connecting');
    setTimeout(() => {
      setLiveStatus('connected');
      // In a real implementation, this would connect to a WebRTC stream or similar
    }, 1000);
  };

  const stopLiveSession = () => {
    setLiveStatus('disconnected');
    window.speechSynthesis.cancel();
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
            <p className="text-xs opacity-90 font-medium tracking-wide uppercase">{mode === 'live' ? 'Voice Mode' : 'Chat Assistant'}</p>
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
                  <div className="absolute w-64 h-64 bg-[#FF2D55] rounded-full blur-2xl opacity-40 transition-all duration-75"></div>
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#FF2D55] to-[#7C3AED] flex items-center justify-center shadow-2xl border-4 border-white/20 z-10">
                    <Sparkles size={60} className="text-white animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#00E0C6] font-bold bg-white/10 py-2 px-6 rounded-full mx-auto w-fit backdrop-blur-sm border border-white/10">
                  <Activity size={18} className="animate-pulse" />
                  Live Connection (Demo)
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