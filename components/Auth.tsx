import React, { useState } from 'react';
import * as Db from '../services/mockDb';
import { UserProfile } from '../types';
import { ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        else setError('User not found.');
      } else {
        if (!username || !age) { setError("Fill all fields"); setLoading(false); return; }
        const user = await Db.registerUser(email, username, parseInt(age));
        onLogin(user);
      }
    } catch (err) { setError('Something went wrong'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF0E6]">
      <div className="bg-[#FFF0E6] w-full max-w-md flex flex-col items-center">
         
         <div className="mb-8 text-center">
             <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase tracking-wide">Login to<br/>Dive In!</h1>
             <p className="text-[#FF9F1C] font-bold">Tracking those days made easy</p>
         </div>

         <div className="mb-10 w-64 h-64 rounded-full bg-pink-100 flex items-center justify-center relative">
             {/* Simple visual placeholder for the illustration */}
             <div className="text-6xl">🌺</div>
             <div className="absolute top-0 right-0 text-4xl">❤️</div>
         </div>

         <form onSubmit={handleSubmit} className="w-full space-y-4 px-8">
            {!isLogin && (
                <>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-4 rounded-xl border-none bg-white shadow-sm font-bold placeholder-gray-300" />
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" className="w-full p-4 rounded-xl border-none bg-white shadow-sm font-bold placeholder-gray-300" />
                </>
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-4 rounded-xl border-none bg-white shadow-sm font-bold placeholder-gray-300" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-4 rounded-xl border-none bg-white shadow-sm font-bold placeholder-gray-300" />
            
            {error && <p className="text-red-500 font-bold text-center">{error}</p>}

            <button type="submit" className="w-full bg-[#FF9F1C] text-white py-4 rounded-full font-bold shadow-lg shadow-orange-200 mt-4 hover:scale-105 transition-transform">
                {isLogin ? 'Login' : 'Sign-UP'}
            </button>
         </form>

         <div className="mt-8 text-center">
             <p className="font-bold text-gray-600 mb-4">{isLogin ? 'Not a user?' : 'Already a user?'}</p>
             <button onClick={() => setIsLogin(!isLogin)} className="w-full bg-[#FF2D55] text-white py-4 rounded-full font-bold shadow-lg shadow-pink-200 hover:scale-105 transition-transform max-w-[200px]">
                 {isLogin ? 'Sign-UP' : 'Login'}
             </button>
         </div>
      </div>
    </div>
  );
};

export default Auth;