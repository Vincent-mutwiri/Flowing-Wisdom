import React, { useState } from 'react';
import * as Db from '../services/mockDb';
import { UserProfile } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mocked
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await Db.loginUser(email);
        if (user) onLogin(user);
        else setError('User not found. Try registering!');
      } else {
        if (!username || !age) {
            setError("Please fill all fields");
            setLoading(false);
            return;
        }
        const user = await Db.registerUser(email, username, parseInt(age));
        onLogin(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        
        {/* Decorative Side */}
        <div className="bg-primary-500 p-12 text-white flex flex-col justify-between md:w-5/12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 rounded-full bg-accent-400 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Flowing Wisdom</h1>
            <p className="opacity-90 leading-relaxed">
              Join a supportive community to track your health, understand your body, and earn rewards along the way.
            </p>
          </div>

          <div className="relative z-10 hidden md:block">
             <div className="flex -space-x-2 mb-4">
                 {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-primary-500"></div>
                 ))}
             </div>
             <p className="text-sm opacity-75">Join 1,000+ others today.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" required
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                {!isLogin && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input 
                                type="text" required
                                value={username} onChange={e => setUsername(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="StarGazer99"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input 
                                type="number" required min="10" max="99"
                                value={age} onChange={e => setAge(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="16"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" required
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2 group"
                >
                    {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
                {!isLogin && <p className="text-xs text-gray-400 mt-4">(Tip: Use 'admin@test.com' to create an admin)</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;