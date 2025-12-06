import React, { useState, useEffect } from 'react';
import { UserProfile, Course } from '../types';
import * as Db from '../services/mockDb';
import { motion } from 'framer-motion';
import { Search, ChevronLeft } from 'lucide-react';

interface HealthToolsProps {
  user: UserProfile;
}

const HealthTools: React.FC<HealthToolsProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(Db.getCourses());
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20 max-w-md mx-auto"
    >
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                 <button onClick={() => window.history.back()}><ChevronLeft /></button>
                 <h2 className="text-xl font-bold">Diagnoses & Tips</h2>
             </div>
        </div>

        {/* Menorrhagia Card Style */}
        <div className="bg-[#FF2D55] rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
            <div className="flex justify-center mb-4">
                 <img src="https://cdn-icons-png.flaticon.com/512/2763/2763444.png" alt="Cup" className="w-24 h-24 drop-shadow-lg" />
            </div>
            <h3 className="text-xl font-extrabold mb-2 text-center">What is Menorrhagia?</h3>
            <p className="text-sm opacity-90 leading-relaxed text-center mb-4">
                Menorrhagia is heavy or prolonged menstrual bleeding. Many women have this type of abnormal uterine bleeding. It can be related to a number of conditions...
            </p>
        </div>

         <div className="bg-[#FF2D55] rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
            <h3 className="text-xl font-extrabold mb-2 text-center">What causes menorrhagia?</h3>
            <p className="text-sm opacity-90 leading-relaxed text-center">
                During your menstrual cycle, if an egg is not fertilized, the uterine lining breaks down and bleeds...
            </p>
        </div>

        {/* Anemia Card Style */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
            <div className="bg-orange-50 rounded-2xl p-4 mb-4">
                <img src="https://image.shutterstock.com/image-vector/anemia-symptoms-vector-illustration-infographic-260nw-1496454248.jpg" alt="Anemia Info" className="w-full rounded-xl mix-blend-multiply" />
            </div>
            <div className="bg-[#FF6B8B] p-4 rounded-2xl text-white">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">All About Anemia</h3>
                    <Search size={18} />
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                    It often develops as a result of other health issues that interfere with the body's production of healthy red blood cells...
                </p>
            </div>
        </div>
        
        {/* Dynamic Courses */}
        {courses.map(course => (
             <div key={course.id} className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100 flex gap-4 items-center">
                 <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center text-2xl">
                     {course.thumbnail}
                 </div>
                 <div>
                     <h4 className="font-bold text-gray-800">{course.title}</h4>
                     <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                 </div>
             </div>
        ))}

    </motion.div>
  );
};

export default HealthTools;