import React, { useEffect, useState } from 'react';
import { UserProfile, Badge, UserBadge } from '../types';
import * as Db from '../services/mockDb';
import { Lock, Trophy, Crown, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  user: UserProfile;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [unlocked, setUnlocked] = useState<UserBadge[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    setAllBadges(Db.getBadges());
    setUnlocked(Db.getUserBadges(user.id));
    setTopUsers(Db.getLeaderboard());
  }, [user.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
        <div className="bg-[#5A00C8] rounded-[2.5rem] p-8 text-white shadow-xl text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-2">Hall of Fame</h2>
                <p className="opacity-90 font-medium">Keep tracking to climb the ranks!</p>
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden p-4">
            <div className="flex items-center gap-3 mb-4 px-4">
                <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                    <Trophy size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Top Users</h3>
            </div>
            
            <div className="space-y-2">
                {topUsers.map((u, index) => (
                    <div key={u.id} className={`p-4 rounded-2xl flex items-center gap-4 ${u.id === user.id ? 'bg-[#FFF0E6] border border-pink-100' : 'hover:bg-gray-50'}`}>
                        <div className="w-8 flex justify-center font-bold text-gray-400 text-lg font-mono">
                            {index === 0 ? <Crown size={28} className="text-yellow-500" /> : 
                             index === 1 ? <Medal size={28} className="text-gray-400" /> : 
                             index === 2 ? <Medal size={28} className="text-orange-400" /> : 
                             `#${index + 1}`}
                        </div>
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm text-lg">
                            {u.username.substring(0, 1)}
                        </div>
                        <div className="flex-1">
                            <p className={`font-bold text-lg ${u.id === user.id ? 'text-[#FF2D55]' : 'text-gray-900'}`}>
                                {u.username} {u.id === user.id && '(You)'}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{u.currentStreak} day streak</p>
                        </div>
                        <div className="font-bold text-[#5A00C8] flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                            {u.points} <Star size={14} fill="currentColor" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
  );
};

export default Leaderboard;