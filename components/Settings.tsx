import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';
import { Bell, Moon, Volume2, LogOut, Trash2, ChevronRight, User, Shield, ChevronLeft } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
  <button 
    onClick={onToggle}
    className={`w-12 h-7 rounded-full transition-colors relative flex items-center ${active ? 'bg-[#FF2D55]' : 'bg-gray-200'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6">
    <h3 className="font-bold text-gray-900 text-lg mb-4">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const Row = ({ icon: Icon, label, action, color = "text-gray-500" }: any) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <span className="font-bold text-gray-700 text-sm">{label}</span>
    </div>
    {action}
  </div>
);

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState({
    period: true,
    logs: false,
    community: true,
    tips: true
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    sound: true,
    haptics: true
  });

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="max-w-md mx-auto pb-20"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => window.history.back()}><ChevronLeft /></button>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-[#FF2D55] to-[#FF6B8B] rounded-[2.5rem] p-6 text-white shadow-xl shadow-pink-200 mb-8 relative overflow-hidden">
         <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-14 h-14 rounded-full" />
            </div>
            <div>
               <h3 className="font-bold text-xl">{user.username}</h3>
               <p className="opacity-90 text-sm font-medium">{user.email}</p>
               <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user.role} Account
               </span>
            </div>
         </div>
         {/* Decorative blob */}
         <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <Section title="Notifications">
         <Row 
           icon={Bell} 
           label="Period Reminders" 
           color="text-[#FF2D55]"
           action={<Toggle active={notifications.period} onToggle={() => toggleNotif('period')} />} 
         />
         <Row 
           icon={User} 
           label="Daily Log Prompts" 
           action={<Toggle active={notifications.logs} onToggle={() => toggleNotif('logs')} />} 
         />
         <Row 
           icon={User} 
           label="Community Updates" 
           action={<Toggle active={notifications.community} onToggle={() => toggleNotif('community')} />} 
         />
      </Section>

      <Section title="Preferences">
         <Row 
           icon={Moon} 
           label="Dark Mode" 
           color="text-[#7C3AED]"
           action={<Toggle active={preferences.darkMode} onToggle={() => togglePref('darkMode')} />} 
         />
         <Row 
           icon={Volume2} 
           label="Sound Effects" 
           action={<Toggle active={preferences.sound} onToggle={() => togglePref('sound')} />} 
         />
      </Section>

      <Section title="Account">
         <div onClick={handleResetData} className="cursor-pointer">
            <Row 
              icon={Trash2} 
              label="Reset All Data" 
              color="text-red-500"
              action={<ChevronRight size={20} className="text-gray-300" />} 
            />
         </div>
         <div className="h-px bg-gray-50 my-2"></div>
         <div onClick={onLogout} className="cursor-pointer">
            <Row 
              icon={LogOut} 
              label="Switch Role / Logout" 
              color="text-gray-900"
              action={<ChevronRight size={20} className="text-gray-300" />} 
            />
         </div>
      </Section>

      <div className="text-center text-xs font-bold text-gray-300 mt-8">
        Flowing Wisdom v1.0.0
      </div>

    </motion.div>
  );
};

export default Settings;