import React, { useEffect, useState } from 'react';
import { UserProfile, Badge, UserBadge } from '../types';
import * as Db from '../services/mockDb';
import { Lock, Trophy, Crown, Medal, Star } from 'lucide-react';

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
    <div className="space-y-8">
        {/* User Stats Hero */}
        <div className="bg-gradient-to-r from-accent-600 to-primary-600 rounded-3xl p-8 text-white shadow-xl text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">My Hall of Fame</h2>
                <p className="opacity-90 font-medium">Keep tracking to climb the ranks!</p>
                
                <div className="mt-8 flex justify-center gap-12 text-center">
                    <div>
                        <div className="text-4xl font-extrabold">{unlocked.length}</div>
                        <div className="text-xs uppercase tracking-widest opacity-80 font-bold mt-1">Badges</div>
                    </div>
                    <div className="w-px bg-white/30"></div>
                    <div>
                        <div className="text-4xl font-extrabold">{user.currentStreak}</div>
                        <div className="text-xs uppercase tracking-widest opacity-80 font-bold mt-1">Streak</div>
                    </div>
                    <div className="w-px bg-white/30"></div>
                    <div>
                        <div className="text-4xl font-extrabold">{user.points}</div>
                        <div className="text-xs uppercase tracking-widest opacity-80 font-bold mt-1">Points</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <Trophy className="text-yellow-500" />
                    <h3 className="text-xl font-bold text-gray-900">Top Users</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {topUsers.map((u, index) => (
                        <div key={u.id} className={`p-4 flex items-center gap-4 ${u.id === user.id ? 'bg-primary-50' : ''}`}>
                            <div className="w-8 flex justify-center font-bold text-gray-500">
                                {index === 0 ? <Crown size={24} className="text-yellow-500" /> : 
                                 index === 1 ? <Medal size={24} className="text-gray-400" /> : 
                                 index === 2 ? <Medal size={24} className="text-orange-400" /> : 
                                 `#${index + 1}`}
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                                {u.username.substring(0, 1)}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold ${u.id === user.id ? 'text-primary-700' : 'text-gray-900'}`}>
                                    {u.username} {u.id === user.id && '(You)'}
                                </p>
                                <p className="text-xs text-gray-500">{u.currentStreak} day streak</p>
                            </div>
                            <div className="font-bold text-accent-600 flex items-center gap-1">
                                {u.points} <Star size={14} fill="currentColor" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges Grid */}
            <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4 ml-1">Achievements</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allBadges.map(badge => {
                        const isUnlocked = unlocked.some(u => u.badgeId === badge.id);
                        return (
                            <div 
                                key={badge.id} 
                                className={`relative p-5 rounded-2xl border transition-all ${
                                    isUnlocked 
                                        ? 'bg-white border-primary-100 shadow-lg shadow-primary-50/50' 
                                        : 'bg-gray-100 border-gray-100 opacity-60'
                                }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute top-4 right-4 text-gray-400">
                                        <Lock size={16} />
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${isUnlocked ? 'bg-accent-50' : 'bg-gray-200 grayscale'}`}>
                                    {badge.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">{badge.name}</h3>
                                <p className="text-gray-600 text-xs leading-snug">{badge.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Leaderboard;