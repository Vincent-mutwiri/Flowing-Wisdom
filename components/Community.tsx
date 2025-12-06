import React, { useState, useEffect } from 'react';
import { UserProfile, Post } from '../types';
import * as Db from '../services/mockDb';
import { Heart, MessageCircle, Send, Plus, Lock } from 'lucide-react';

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
    // Simulate real-time poll
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
    <div className="max-w-2xl mx-auto space-y-6">
        {/* Header & Tabs */}
        <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <div className="flex space-x-2">
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'feed' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Global Feed
                </button>
                <button 
                    onClick={() => setActiveTab('my-posts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'my-posts' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    My Posts
                </button>
            </div>
        </div>

        {/* Create Post Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Plus size={18} className="text-primary-500" />
                Share with the Community
            </h3>
            <form onSubmit={handleCreatePost}>
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share a tip, ask a question, or vent safely..."
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary-100 resize-none text-sm mb-3"
                    rows={3}
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">All posts are moderated for safety.</span>
                    <button 
                        type="submit"
                        disabled={isPosting || !newPostContent.trim()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {isPosting ? 'Sending...' : (
                            <>
                                <span>Post</span>
                                <Send size={14} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>

        {/* Feed */}
        <div className="space-y-4">
            {filteredPosts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-200 to-primary-200 flex items-center justify-center font-bold text-primary-700">
                                {post.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{post.username}</p>
                                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {activeTab === 'my-posts' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                post.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                post.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {post.status.toUpperCase()}
                            </span>
                        )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.likedBy.includes(user.id) ? 'text-primary-500' : 'text-gray-400 hover:text-primary-400'}`}
                        >
                            <Heart size={18} fill={post.likedBy.includes(user.id) ? "currentColor" : "none"} />
                            <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600">
                            <MessageCircle size={18} />
                            <span>Comment</span>
                        </button>
                    </div>
                </div>
            ))}

            {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={24} />
                    </div>
                    <p>No posts found here yet.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Community;