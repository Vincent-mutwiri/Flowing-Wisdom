import React, { useState, useEffect } from 'react';
import { UserProfile, Course } from '../types';
import { Calculator, BookOpen, ArrowRight, Activity } from 'lucide-react';
import * as Db from '../services/mockDb';

interface HealthToolsProps {
  user: UserProfile;
}

const HealthTools: React.FC<HealthToolsProps> = ({ user }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(Db.getCourses());
  }, []);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
        const bmi = w / (h * h);
        setBmiResult(parseFloat(bmi.toFixed(1)));
    }
  };

  const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
      if (bmi < 25) return { label: 'Healthy Weight', color: 'text-green-500' };
      if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
      return { label: 'Obese', color: 'text-red-500' };
  };

  return (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Health Tools & Education</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* BMI Calculator */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                        <Calculator size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">BMI Calculator</h3>
                </div>
                
                <form onSubmit={calculateBMI} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Weight (kg)</label>
                            <input 
                                type="number" 
                                value={weight} onChange={e => setWeight(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none font-medium"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Height (cm)</label>
                            <input 
                                type="number" 
                                value={height} onChange={e => setHeight(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none font-medium"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                        Calculate
                    </button>
                </form>

                {bmiResult && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500 mb-1">Your BMI</p>
                        <p className="text-4xl font-extrabold text-gray-800 mb-2">{bmiResult}</p>
                        <p className={`font-bold ${getBMICategory(bmiResult).color}`}>
                            {getBMICategory(bmiResult).label}
                        </p>
                    </div>
                )}
            </div>

            {/* Courses / Education */}
            <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-accent-100 p-2 rounded-lg text-accent-600">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Learn More</h3>
                </div>
                
                {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="text-3xl bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center">
                                    {course.thumbnail}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{course.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default HealthTools;