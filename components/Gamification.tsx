import React, { useEffect, useState } from 'react';
import { UserProfile, Badge, UserBadge } from '../types';
import * as Db from '../services/mockDb';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface GamificationProps {
  user: UserProfile;
}

const Gamification: React.FC<GamificationProps> = ({ user }) => {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [unlocked, setUnlocked] = useState<UserBadge[]>([]);

  useEffect(() => {
    setAllBadges(Db.getBadges());
    setUnlocked(Db.getUserBadges(user.id));
  }, [user.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-[2.5rem] p-8 text-white shadow-xl text-center">
            <h2 className="text-3xl font-extrabold mb-2">My Achievements</h2>
            <p className="opacity-90 font-medium">Level up your health journey! You have {user.points} points.</p>
            
            <div className="mt-8 flex justify-center gap-8 text-center">
                <div>
                    <div className="text-4xl font-extrabold">{unlocked.length}</div>
                    <div className="text-xs uppercase tracking-widest opacity-80 font-bold mt-2">Badges</div>
                </div>
                <div className="w-px bg-white/30"></div>
                <div>
                    <div className="text-4xl font-extrabold">{user.currentStreak}</div>
                    <div className="text-xs uppercase tracking-widest opacity-80 font-bold mt-2">Day Streak</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allBadges.map((badge, i) => {
                const isUnlocked = unlocked.some(u => u.badgeId === badge.id);
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={badge.id} 
                        className={`relative p-6 rounded-[2rem] border transition-all flex flex-col items-center text-center ${
                            isUnlocked 
                                ? 'bg-white border-white shadow-lg shadow-pink-100' 
                                : 'bg-gray-100 border-transparent opacity-70 grayscale'
                        }`}
                    >
                        {!isUnlocked && (
                            <div className="absolute top-4 right-4 text-gray-300">
                                <Lock size={16} />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm ${isUnlocked ? 'bg-gradient-to-br from-pink-100 to-white' : 'bg-gray-200'}`}>
                            {badge.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{badge.name}</h3>
                        <p className="text-gray-500 text-xs">{badge.description}</p>
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
  );
};

export default Gamification;