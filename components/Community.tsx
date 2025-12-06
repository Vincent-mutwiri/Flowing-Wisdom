import React, { useState, useEffect } from 'react';
import { UserProfile, Post } from '../types';
import * as Db from '../services/mockDb';
import { Heart, MessageCircle, Send, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityProps {
  user: UserProfile;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts'>('feed');

  const fetchPosts = () => {
    setPosts(Db.getPosts());
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPostContent.trim()) return;

      setIsPosting(true);
      await Db.createPost(user.id, user.username, newPostContent);
      setNewPostContent('');
      setIsPosting(false);
      fetchPosts();
      alert('Post submitted for moderation! +5 points when approved.');
  };

  const handleLike = (postId: string) => {
      Db.toggleLike(postId, user.id);
      fetchPosts();
  };

  const filteredPosts = activeTab === 'feed' 
    ? posts.filter(p => p.status === 'approved')
    : posts.filter(p => p.userId === user.id);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
        {/* Header & Tabs */}
        <div className="flex justify-between items-center bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex space-x-2 w-full">
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-[#FF2D55] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Global Feed
                </button>
                <button 
                    onClick={() => setActiveTab('my-posts')}
                    className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'my-posts' ? 'bg-[#FF2D55] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    My Posts
                </button>
            </div>
        </div>

        {/* Create Post Input */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Plus size={24} className="text-[#FF2D55]" />
                Share with the Community
            </h3>
            <form onSubmit={handleCreatePost}>
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share a tip, ask a question, or vent safely..."
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-100 resize-none text-sm mb-3"
                    rows={3}
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">All posts are moderated.</span>
                    <button 
                        type="submit"
                        disabled={isPosting || !newPostContent.trim()}
                        className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isPosting ? 'Sending...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>

        {/* Feed */}
        <div className="space-y-4">
            {filteredPosts.map(post => (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={post.id} 
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:shadow-md"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center font-bold text-gray-700">
                                {post.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{post.username}</p>
                                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {activeTab === 'my-posts' && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                post.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                post.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {post.status.toUpperCase()}
                            </span>
                        )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed pl-13">{post.content}</p>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.likedBy.includes(user.id) ? 'text-[#FF2D55]' : 'text-gray-400 hover:text-pink-400'}`}
                        >
                            <Heart size={20} fill={post.likedBy.includes(user.id) ? "currentColor" : "none"} />
                            <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600">
                            <MessageCircle size={20} />
                            <span>Comment</span>
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );
};

export default Community;