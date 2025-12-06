import React, { useEffect, useState } from 'react';
import { UserProfile, DailyLog, MOODS_LIST } from '../types';
import * as Db from '../services/mockDb';
import { Flame, Droplet, Star, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react';
import { useHashLocation } from '../App';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { navigate } = useHashLocation();
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    setLogs(Db.getLogs(user.id));
  }, [user.id]);

  const lastLog = logs[0];
  const today = new Date().toISOString().split('T')[0];
  const isLoggedToday = lastLog?.date === today;

  const getLastCycleLength = () => {
    if (logs.length < 2) return 28;
    return 29; 
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hi, {user.username}! 👋</h2>
          <p className="text-gray-600 font-medium">Here's your cycle snapshot for today.</p>
        </div>
        {!isLoggedToday && (
          <button 
            onClick={() => navigate('/tracker')}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-lg shadow-primary-200 transition-all transform hover:scale-105 font-semibold"
          >
            <PlusCircle size={20} />
            <span>Log Today</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
                <Flame size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{user.currentStreak}</span>
            <span className="text-xs text-gray-600 uppercase tracking-wide font-bold">Day Streak</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                <Star size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{user.points}</span>
            <span className="text-xs text-gray-600 uppercase tracking-wide font-bold">Total Points</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-2">
                <Droplet size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{isLoggedToday ? lastLog?.flowLevel || '-' : 'Not Logged'}</span>
            <span className="text-xs text-gray-600 uppercase tracking-wide font-bold">Today's Flow</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-2">
                <TrendingUp size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{getLastCycleLength()} Days</span>
            <span className="text-xs text-gray-600 uppercase tracking-wide font-bold">Avg Cycle</span>
        </div>
      </div>

      {/* AI Assistant Promo */}
      <div className="bg-gradient-to-r from-accent-600 to-primary-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
             <Star size={200} fill="white" />
          </div>
          <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-bold mb-2">Have questions about your health?</h3>
              <p className="text-accent-50 opacity-95 text-lg">
                  Chat with our safe, AI-powered assistant to learn more about your body.
              </p>
          </div>
          <button 
            onClick={() => navigate('/ai-assistant')}
            className="relative z-10 bg-white text-primary-700 px-6 py-3 rounded-xl font-bold hover:bg-opacity-95 transition-all flex items-center gap-2 shadow-lg"
          >
              <span>Ask AI Assistant</span>
              <ArrowRight size={18} />
          </button>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Recent Logs</h3>
            <button onClick={() => navigate('/tracker')} className="text-primary-600 text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
              {logs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl border border-gray-100">
                          {MOODS_LIST.find(m => m.label === log.mood)?.emoji || '😐'}
                      </div>
                      <div className="ml-4 flex-1">
                          <div className="flex justify-between items-center">
                             <p className="font-bold text-gray-900">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}</p>
                             {log.flowLevel && (
                                <span className="text-xs font-bold text-primary-700 bg-primary-100 px-3 py-1 rounded-full border border-primary-200">
                                    {log.flowLevel}
                                </span>
                             )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                              {log.symptoms.length > 0 ? log.symptoms.join(', ') : 'No symptoms recorded'}
                          </p>
                      </div>
                  </div>
              ))}
              {logs.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                      No logs yet. Start your journey today!
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;