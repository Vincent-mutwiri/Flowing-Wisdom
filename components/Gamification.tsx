import React, { useEffect, useState } from 'react';
import { UserProfile, Badge, UserBadge } from '../types';
import * as Db from '../services/mockDb';
import { Lock } from 'lucide-react';

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
    <div className="space-y-8">
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-3xl p-8 text-white shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-2">My Achievements</h2>
            <p className="opacity-90">Level up your health journey! You have {user.points} points.</p>
            
            <div className="mt-8 flex justify-center gap-8 text-center">
                <div>
                    <div className="text-4xl font-bold">{unlocked.length}</div>
                    <div className="text-xs uppercase tracking-widest opacity-70">Badges</div>
                </div>
                <div className="w-px bg-white/30"></div>
                <div>
                    <div className="text-4xl font-bold">{user.currentStreak}</div>
                    <div className="text-xs uppercase tracking-widest opacity-70">Day Streak</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBadges.map(badge => {
                const isUnlocked = unlocked.some(u => u.badgeId === badge.id);
                return (
                    <div 
                        key={badge.id} 
                        className={`relative p-6 rounded-2xl border transition-all ${
                            isUnlocked 
                                ? 'bg-white border-primary-100 shadow-lg shadow-primary-50/50' 
                                : 'bg-gray-50 border-gray-100 opacity-70 grayscale'
                        }`}
                    >
                        {!isUnlocked && (
                            <div className="absolute top-4 right-4 text-gray-300">
                                <Lock size={16} />
                            </div>
                        )}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4 ${isUnlocked ? 'bg-accent-50' : 'bg-gray-200'}`}>
                            {badge.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{badge.name}</h3>
                        <p className="text-gray-500 text-sm">{badge.description}</p>
                        
                        {isUnlocked && (
                           <div className="mt-4 text-xs font-bold text-primary-500">
                               UNLOCKED
                           </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Gamification;