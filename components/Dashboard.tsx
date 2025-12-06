import React, { useEffect, useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import * as Db from '../services/mockDb';
import { Play, ArrowRight, Plus } from 'lucide-react';
import { useHashLocation } from '../App';
import { motion } from 'framer-motion';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { navigate } = useHashLocation();
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    setLogs(Db.getLogs(user.id));
  }, [user.id]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">My Diet Plan</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Meals Section - Matching the colorful gradients */}
      <section>
         <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-600">Meals today</h3>
             <ArrowRight className="text-gray-400" size={20} />
         </div>
         
         <div className="grid grid-cols-3 gap-4">
             {/* Breakfast - Pink/Orange Gradient */}
             <div className="bg-gradient-to-b from-[#FFA7A7] to-[#FF6B8B] rounded-[2rem] p-4 text-white shadow-lg shadow-pink-200 relative overflow-hidden h-64 flex flex-col justify-end">
                 <div className="absolute top-4 left-0 w-full flex justify-center">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <span className="text-4xl">🍳</span>
                    </div>
                 </div>
                 <h4 className="font-bold text-xl mb-1">Breakfast</h4>
                 <p className="text-xs opacity-90 mb-2 font-medium">Bread, Peanut butter, Apple</p>
                 <div className="text-3xl font-bold">525 <span className="text-sm font-normal">kcal</span></div>
             </div>

             {/* Lunch - Purple Gradient */}
             <div className="bg-gradient-to-b from-[#A78BFA] to-[#7C3AED] rounded-[2rem] p-4 text-white shadow-lg shadow-purple-200 relative overflow-hidden h-64 flex flex-col justify-end">
                 <div className="absolute top-4 left-0 w-full flex justify-center">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <span className="text-4xl">🥗</span>
                    </div>
                 </div>
                 <h4 className="font-bold text-xl mb-1">Lunch</h4>
                 <p className="text-xs opacity-90 mb-2 font-medium">Salmon, Mixed veggies, Avocado</p>
                 <div className="text-3xl font-bold">602 <span className="text-sm font-normal">kcal</span></div>
             </div>

             {/* Snack - Pink Gradient with Plus Button */}
             <div className="bg-gradient-to-b from-[#FF8E53] to-[#FF2D55] rounded-[2rem] p-4 text-white shadow-lg shadow-red-200 relative overflow-hidden h-64 flex flex-col justify-end">
                 <div className="absolute top-4 left-0 w-full flex justify-center">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <span className="text-4xl">🍉</span>
                    </div>
                 </div>
                 <h4 className="font-bold text-xl mb-1">Snack</h4>
                 <p className="text-xs opacity-90 mb-2 font-medium">Recommended: 800 kcal</p>
                 <button className="bg-white text-[#FF2D55] w-10 h-10 rounded-full flex items-center justify-center shadow-md mx-auto mt-2 hover:scale-110 transition-transform">
                     <Plus size={24} />
                 </button>
             </div>
         </div>
      </section>

      {/* Doctor Consultancy - Wide Purple Card */}
      <section>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-600">Doctor Consultancy</h3>
             <ArrowRight className="text-gray-400" size={20} />
         </div>
         <div className="bg-gradient-to-r from-[#5A00C8] to-[#9D50BB] rounded-[2.5rem] p-8 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
             <div className="relative z-10 max-w-xs">
                 <p className="text-sm font-medium opacity-80 mb-1">For Professional Medical Advice..</p>
                 <h3 className="text-2xl font-bold mb-6">Consult Now</h3>
                 <button className="border-2 border-white rounded-xl px-6 py-2 font-bold text-sm hover:bg-white hover:text-purple-800 transition-colors">
                     Consult Now
                 </button>
             </div>
             {/* Decorative circles */}
             <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
         </div>
      </section>

       {/* Training Card */}
       <section>
         <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-600">Training</h3>
             <ArrowRight className="text-gray-400" size={20} />
         </div>
         <div className="bg-[#5A00C8] rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Next workout</p>
                <h3 className="text-xl font-bold leading-tight max-w-[70%]">8 Exercises to ease menstrual period</h3>
            </div>

            <div className="relative mt-4">
                <div className="aspect-video w-full rounded-2xl bg-gray-800 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&q=80&w=1000" alt="Yoga" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-bold bg-black/50 px-2 py-1 rounded-md">
                        <span>⏱ 68 min</span>
                    </div>
                </div>
                <button className="absolute -top-6 right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#5A00C8] shadow-lg hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" />
                </button>
            </div>
         </div>
       </section>

       {/* BMI Banner */}
       <motion.div 
         className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm"
         whileHover={{ scale: 1.02 }}
         onClick={() => navigate('/health')}
       >
           <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
               <img src="https://cdn-icons-png.flaticon.com/512/3076/3076841.png" alt="Run" className="w-10 h-10" />
           </div>
           <div>
               <h4 className="font-bold text-[#5A00C8]">You're doing great!</h4>
               <p className="text-xs text-gray-500">To check Body Mass Index, Click!</p>
           </div>
       </motion.div>

    </motion.div>
  );
};

export default Dashboard;