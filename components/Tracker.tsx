import React, { useState, useEffect } from 'react';
import { UserProfile, FlowLevel, Mood, SYMPTOMS_LIST, MOODS_LIST, DailyLog } from '../types';
import * as Db from '../services/mockDb';
import { ChevronLeft, ChevronRight, Save, Flower2 } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

interface TrackerProps {
  user: UserProfile;
}

const Tracker: React.FC<TrackerProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [formData, setFormData] = useState<Partial<DailyLog>>({
    flowLevel: 'Medium',
    mood: 'Okay',
    symptoms: [],
    notes: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLogs(Db.getLogs(user.id));
  }, [user.id, saved]);

  useEffect(() => {
     const log = logs.find(l => l.date === selectedDate);
     if (log) {
         setFormData({
             flowLevel: log.flowLevel,
             mood: log.mood,
             symptoms: log.symptoms,
             notes: log.notes
         });
     } else {
         setFormData({
             flowLevel: 'Medium',
             mood: 'Okay',
             symptoms: [],
             notes: ''
         });
     }
  }, [selectedDate, logs]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleSave = async () => {
      await Db.addLog(user.id, {
          date: selectedDate,
          flowLevel: formData.flowLevel as FlowLevel,
          mood: formData.mood as Mood,
          symptoms: formData.symptoms || [],
          notes: formData.notes
      });
      setSaved(prev => !prev);
      alert("Entry saved! +10 Points earned.");
  };

  const toggleSymptom = (sym: string) => {
      setFormData(prev => {
          const exists = prev.symptoms?.includes(sym);
          const newSyms = exists 
            ? prev.symptoms?.filter(s => s !== sym)
            : [...(prev.symptoms || []), sym];
          return { ...prev, symptoms: newSyms };
      });
  };

  // Mock Fertility Logic: Assume cycle starts on day 1 of stored log, ovulation around day 14
  // For demo, just showing days 12-16 after the first logged day of the month as fertile
  // In production, this needs complex algorithm
  const getFertileStatus = (dateStr: string) => {
      // Very simple mock: If day of month is 12-16, it's fertile window
      const day = parseInt(dateStr.split('-')[2]);
      return day >= 12 && day <= 16;
  };

  const renderCalendarDays = () => {
      const days = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(<div key={`empty-${i}`} className="h-10 md:h-14"></div>);
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const log = logs.find(l => l.date === dateStr);
          const isSelected = selectedDate === dateStr;
          const isFertile = getFertileStatus(dateStr);
          
          let bgClass = "bg-white hover:bg-gray-50 border border-transparent";
          if (log) {
             if (log.flowLevel === 'Heavy') bgClass = "bg-primary-500 text-white border-primary-600";
             else if (log.flowLevel === 'Medium') bgClass = "bg-primary-400 text-white border-primary-500";
             else if (log.flowLevel === 'Light') bgClass = "bg-primary-300 text-gray-900 border-primary-400"; // Dark text for contrast
             else bgClass = "bg-primary-200 text-primary-900 border-primary-300";
          }
          
          if (isSelected) {
              bgClass = "ring-2 ring-accent-500 z-10 " + (log ? bgClass : "bg-white border-accent-200");
          }

          days.push(
              <button 
                key={d} 
                onClick={() => setSelectedDate(dateStr)}
                className={`relative h-12 md:h-16 rounded-xl flex flex-col items-center justify-center transition-all text-sm ${bgClass}`}
              >
                  <span className="font-bold">{d}</span>
                  {log && <span className="text-[10px] opacity-90">{log.mood && MOODS_LIST.find(m => m.label === log.mood)?.emoji}</span>}
                  
                  {isFertile && !log && (
                      <div className="absolute top-1 right-1">
                          <Flower2 size={10} className="text-green-500" />
                      </div>
                  )}
              </button>
          );
      }
      return days;
  };

  const chartData = logs.slice(0, 14).reverse().map(l => ({
      name: l.date.split('-').slice(1).join('/'),
      moodScore: MOODS_LIST.findIndex(m => m.label === l.mood) + 1
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Calendar Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                    {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}
                </h2>
                <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ChevronRight size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-gray-500 font-bold uppercase tracking-wide">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-600 font-medium justify-center">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-200 border border-primary-300"></div> Spotting</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-300 border border-primary-400"></div> Light</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-400 border border-primary-500"></div> Medium</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-500 border border-primary-600"></div> Heavy</div>
                <div className="flex items-center gap-1"><Flower2 size={12} className="text-green-500" /> Fertile Window</div>
            </div>
        </div>

        {/* Mood Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hidden md:block">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mood Trends</h3>
            <div className="h-64">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} />
                            <YAxis hide domain={[0, 6]} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Area type="monotone" dataKey="moodScore" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMood)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium">Not enough data yet</div>
                )}
            </div>
        </div>
      </div>

      {/* Logging Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-8 h-fit">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Log Details</h3>
              <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{new Date(selectedDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
          </div>

          <div className="space-y-6">
              {/* Flow */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Flow Intensity</label>
                  <div className="grid grid-cols-4 gap-2">
                      {['Spotting', 'Light', 'Medium', 'Heavy'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setFormData({...formData, flowLevel: level as FlowLevel})}
                            className={`py-2 px-1 rounded-lg text-xs font-bold transition-colors border
                                ${formData.flowLevel === level 
                                    ? 'bg-primary-100 border-primary-500 text-primary-800' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                              {level}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Mood */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mood Diary</label>
                  <div className="flex justify-between">
                      {MOODS_LIST.map((m) => (
                          <button
                            key={m.label}
                            onClick={() => setFormData({...formData, mood: m.label})}
                            className={`flex flex-col items-center p-2 rounded-xl transition-all
                                ${formData.mood === m.label 
                                    ? 'bg-accent-100 scale-110 ring-2 ring-accent-200' 
                                    : 'hover:bg-gray-50 opacity-70 hover:opacity-100'}`}
                          >
                              <span className="text-2xl">{m.emoji}</span>
                              <span className="text-[10px] mt-1 font-medium text-gray-600">{m.label}</span>
                          </button>
                      ))}
                  </div>
              </div>

              {/* Symptoms */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                      {SYMPTOMS_LIST.map(sym => (
                          <button
                            key={sym}
                            onClick={() => toggleSymptom(sym)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                                ${formData.symptoms?.includes(sym)
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                              {sym}
                          </button>
                      ))}
                  </div>
              </div>

               {/* Notes */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-300 focus:border-transparent outline-none text-sm h-24 resize-none bg-gray-50 text-gray-800"
                    placeholder="How are you feeling today?"
                  />
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
              >
                  <Save size={18} />
                  Save Daily Log
              </button>
          </div>
      </div>
    </div>
  );
};

export default Tracker;