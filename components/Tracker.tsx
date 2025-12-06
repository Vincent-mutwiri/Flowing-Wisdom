import React, { useState, useEffect } from 'react';
import { UserProfile, FlowLevel, Mood, SYMPTOMS_LIST } from '../types';
import * as Db from '../services/mockDb';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackerProps {
  user: UserProfile;
}

const Tracker: React.FC<TrackerProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    flowLevel: 'Medium',
    symptoms: [] as string[],
    clotting: 'No',
    spotting: 'No'
  });

  useEffect(() => {
    setLogs(Db.getLogs(user.id));
  }, [user.id]);

  const handleSave = async () => {
      await Db.addLog(user.id, {
          date: selectedDate,
          flowLevel: formData.flowLevel as FlowLevel,
          mood: 'Okay', // Default for this simplified UI
          symptoms: formData.symptoms,
          notes: `Clotting: ${formData.clotting}, Spotting: ${formData.spotting}`
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
  };

  // Render pills similar to screenshot
  const PillGroup = ({ label, options, selected, onChange }: any) => (
      <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3">{label}</h4>
          <div className="flex flex-wrap gap-3">
              {options.map((opt: string) => {
                  const isSelected = selected === opt || (Array.isArray(selected) && selected.includes(opt));
                  return (
                      <button
                          key={opt}
                          onClick={() => onChange(opt)}
                          className={`px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all transform hover:scale-105
                              ${isSelected 
                                  ? 'bg-[#FF2D55] text-white shadow-pink-300' 
                                  : 'bg-white text-gray-800 border border-gray-100'}`}
                      >
                          {opt}
                      </button>
                  );
              })}
          </div>
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-md mx-auto space-y-6 pb-20 relative"
    >
      <div className="flex items-center gap-4 mb-4">
         <button onClick={() => window.history.back()} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft /></button>
         <h2 className="text-2xl font-bold text-gray-900">Menstrual Health Prediction</h2>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-6">
         <div className="flex justify-between items-center mb-2">
             <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))}><ChevronLeft size={16}/></button>
             <span className="font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
             <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))}><ChevronRight size={16}/></button>
         </div>
         <div className="flex justify-between text-center">
             {[...Array(7)].map((_, i) => {
                 const d = new Date(currentDate);
                 d.setDate(currentDate.getDate() - currentDate.getDay() + i);
                 const dateStr = d.toISOString().split('T')[0];
                 const isSelected = selectedDate === dateStr;
                 return (
                     <button 
                        key={i} 
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center justify-center w-10 h-14 rounded-full transition-colors ${isSelected ? 'bg-teal-400 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                     >
                         <span className="text-[10px] font-bold mb-1">{d.toLocaleString('default', { weekday: 'narrow' })}</span>
                         <span className="text-sm font-bold">{d.getDate()}</span>
                     </button>
                 );
             })}
         </div>
      </div>

      {/* Form Sections */}
      <PillGroup 
         label="How is your pain?" 
         options={['Severe', 'Moderate', 'Mild']} 
         selected={formData.symptoms.find(s => ['Severe', 'Moderate', 'Mild'].includes(s))} 
         onChange={(val: string) => setFormData(prev => ({ ...prev, symptoms: [...prev.symptoms.filter(s => !['Severe', 'Moderate', 'Mild'].includes(s)), val] }))}
      />

      <PillGroup 
         label="What is the Flow Amount" 
         options={['Heavy', 'Moderate', 'Light']} 
         selected={formData.flowLevel} 
         onChange={(val: string) => setFormData(prev => ({ ...prev, flowLevel: val }))}
      />

      <PillGroup 
         label="Do you see Clotting?" 
         options={['Yes', 'No']} 
         selected={formData.clotting} 
         onChange={(val: string) => setFormData(prev => ({ ...prev, clotting: val }))}
      />

      <PillGroup 
         label="Do you see Spotting?" 
         options={['Yes', 'No']} 
         selected={formData.spotting} 
         onChange={(val: string) => setFormData(prev => ({ ...prev, spotting: val }))}
      />

      <button 
        onClick={handleSave}
        className="w-full bg-[#FF9F1C] text-white py-4 rounded-full text-lg font-bold shadow-lg shadow-orange-200 hover:scale-[1.02] transition-transform mt-8"
      >
          Predict
      </button>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 w-max"
          >
            <div className="bg-green-500 rounded-full p-1 text-gray-900">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="font-bold text-sm">Prediction Updated! +10 Points</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Tracker;