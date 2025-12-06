import React, { useEffect, useState } from 'react';
import { UserProfile, Course } from '../types';
import * as Db from '../services/mockDb';
import { ChevronLeft, Plus, Sparkles, Loader2, Save } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion } from 'framer-motion';

interface AdminProps {
  user: UserProfile;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', content: '' });
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setCourses(Db.getCourses());
  }, []);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title) return;
    Db.addCourse({
        title: newCourse.title,
        description: newCourse.description,
        content: newCourse.content,
        thumbnail: '📚'
    });
    setNewCourse({ title: '', description: '', content: '' });
    setCourses(Db.getCourses());
    alert("Course Created!");
  };

  const handleGenerateCourse = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a course about: ${aiTopic}. Keep language simple.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        content: { type: Type.STRING }
                    },
                    required: ["title", "description", "content"]
                }
            }
        });
        const generated = JSON.parse(response.text || '{}');
        if (generated.title) {
            setNewCourse({
                title: generated.title,
                description: generated.description || '',
                content: generated.content || ''
            });
        }
    } catch (error) {
        console.error(error);
        alert("AI Generation Failed");
    } finally {
        setIsGenerating(false);
    }
  };

  if (user.role !== 'admin') return <div>Access Denied</div>;

  const InputField = ({ label, value, onChange, placeholder }: any) => (
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <label className="text-gray-700 font-medium">{label}</label>
          <input 
              value={value} 
              onChange={onChange} 
              placeholder={placeholder}
              className="text-right outline-none text-gray-500 w-1/2 bg-transparent"
          />
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto bg-[#FFF0E6] min-h-screen"
    >
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => window.history.back()}><ChevronLeft /></button>
            <h2 className="text-2xl font-bold">Add Course</h2>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Course Details</h3>
            
            <form onSubmit={handleCreateCourse}>
                <InputField 
                    label="Course Title" 
                    value={newCourse.title} 
                    onChange={(e: any) => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="e.g. Yoga 101"
                />
                
                <div className="py-4 border-b border-gray-100">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea 
                        value={newCourse.description} 
                        onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none resize-none h-20"
                        placeholder="Brief summary..."
                    />
                </div>

                <div className="py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-medium">Content</label>
                        {/* AI Trigger */}
                        <div className="flex items-center gap-2">
                            <input 
                                className="w-24 text-xs bg-gray-100 rounded px-2 py-1"
                                placeholder="AI Topic..."
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                            />
                            <button type="button" onClick={handleGenerateCourse} disabled={isGenerating}>
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-accent-500" />}
                            </button>
                        </div>
                    </div>
                    <textarea 
                        value={newCourse.content} 
                        onChange={(e) => setNewCourse({...newCourse, content: e.target.value})}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none resize-none h-32"
                        placeholder="Full course content..."
                    />
                </div>

                <div className="flex items-center justify-between py-4">
                     <span className="text-gray-700 font-medium">Publish Immediately</span>
                     <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center">
                         {/* Checkbox visual */}
                     </div>
                </div>

                <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold mt-4 shadow-lg flex justify-center items-center gap-2">
                    <Save size={18} /> Save Course
                </button>
            </form>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-gray-600 px-4">Existing Courses</h3>
            {courses.map(c => (
                <div key={c.id} className="bg-white p-4 mx-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <span className="font-bold text-gray-800">{c.title}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                </div>
            ))}
        </div>

    </motion.div>
  );
};

export default Admin;