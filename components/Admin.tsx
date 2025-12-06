import React, { useEffect, useState } from 'react';
import { UserProfile, Post, Course } from '../types';
import * as Db from '../services/mockDb';
import { Check, X, Trash2, BookOpen, Plus, Save, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminProps {
  user: UserProfile;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'moderation' | 'courses'>('moderation');

  // Course Form
  const [newCourse, setNewCourse] = useState({ title: '', description: '', content: '' });
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const refreshData = () => {
    setUsers(Db.getAllUsers());
    const posts = Db.getPosts();
    setPendingPosts(posts.filter(p => p.status === 'pending'));
    setCourses(Db.getCourses());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleModerate = (postId: string, status: 'approved' | 'rejected') => {
      Db.moderatePost(postId, status);
      refreshData();
  };

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
    refreshData();
  };

  // --- AI Course Generation ---
  const handleGenerateCourse = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a short educational course about: ${aiTopic}. Keep language simple, youth-friendly, and empowering.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        content: { type: Type.STRING, description: "HTML formatted content for the course body" },
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
        console.error("AI Generation Error:", error);
        alert("Failed to generate course content.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (user.role !== 'admin') {
      return <div className="p-8 text-center text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
                <button 
                  onClick={() => setActiveTab('moderation')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'moderation' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}
                >
                    Moderation
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}
                >
                    Users
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}
                >
                    Courses
                </button>
            </div>
        </div>

        {/* Content Moderation Queue */}
        {activeTab === 'moderation' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Moderation Queue</h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{pendingPosts.length} Pending</span>
                </div>
                
                {pendingPosts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-medium">All caught up! No pending posts.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {pendingPosts.map(post => (
                            <div key={post.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-sm text-gray-900">{post.username}</span>
                                        <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-800">{post.content}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleModerate(post.id, 'approved')}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                        title="Approve"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleModerate(post.id, 'rejected')}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Reject"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">User Management</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Age</th>
                                <th className="p-4">Points</th>
                                <th className="p-4">Streak</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className="text-gray-800">
                                    <td className="p-4 font-bold">{u.username}</td>
                                    <td className="p-4 text-gray-600">{u.email}</td>
                                    <td className="p-4">{u.age}</td>
                                    <td className="p-4 font-bold text-primary-600">{u.points}</td>
                                    <td className="p-4">{u.currentStreak} 🔥</td>
                                    <td className="p-4">
                                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Course Management */}
        {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* AI Generator Box */}
                    <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl shadow-sm border border-primary-100">
                        <h3 className="font-bold text-primary-800 mb-2 flex items-center gap-2">
                            <Sparkles size={18} />
                            AI Course Creator
                        </h3>
                        <p className="text-xs text-gray-600 mb-4">
                            Enter a topic and let AI draft the course content for you.
                        </p>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-white"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="Topic (e.g. Iron deficiency)"
                            />
                            <button 
                                onClick={handleGenerateCourse}
                                disabled={isGenerating || !aiTopic}
                                className="bg-primary-600 text-white p-2 rounded-lg disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Manual Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus size={18} /> Add New Course
                        </h3>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                <input 
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                                    placeholder="e.g., Menstrual Health 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <input 
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                                    placeholder="Short summary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Content (HTML)</label>
                                <textarea 
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm h-32"
                                    value={newCourse.content}
                                    onChange={e => setNewCourse({...newCourse, content: e.target.value})}
                                    placeholder="<p>Course content...</p>"
                                />
                            </div>
                            <button className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors">
                                Create Course
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center text-2xl">
                                    {course.thumbnail}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                                    <p className="text-sm text-gray-600">{course.description}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { Db.deleteCourse(course.id); refreshData(); }}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="text-center text-gray-500 py-10">No courses created yet.</div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Admin;