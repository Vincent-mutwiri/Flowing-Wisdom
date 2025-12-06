import React from 'react';
import { useHashLocation } from '../App';
import { UserProfile } from '../types';
import { LayoutDashboard, Calendar, Users, Trophy, Shield, Sparkles, HeartPulse, RefreshCw, Wand2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const { navigate, path } = useHashLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = path === to;
    return (
      <button
        onClick={() => navigate(to)}
        className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-2xl transition-all w-full mb-1
          ${isActive 
            ? 'bg-accent-800 text-white shadow-lg shadow-accent-200' 
            : 'text-gray-400 hover:bg-white hover:text-accent-600'
          }`}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] md:text-sm font-semibold mt-1 md:mt-0">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF0E6] flex flex-col md:flex-row font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 p-6 h-screen sticky top-0">
        <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-6 h-full shadow-xl border border-white/60 flex flex-col justify-between">
          <div>
            <div className="mb-10 px-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-800 rounded-full flex items-center justify-center text-white">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Flowing<br/>Wisdom</h1>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</div>
              <NavItem to="/" icon={Home} label="Dashboard" />
              <NavItem to="/tracker" icon={Calendar} label="Cycle Tracker" />
              <NavItem to="/health" icon={HeartPulse} label="Health Tools" />
              <NavItem to="/image-studio" icon={Wand2} label="Creative Studio" />
              
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Community</div>
              <NavItem to="/community" icon={Users} label="Social Space" />
              <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
              <NavItem to="/ai-assistant" icon={Sparkles} label="AI Assistant" />
              
              {user.role === 'admin' && (
                <>
                  <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Admin</div>
                  <NavItem to="/admin" icon={Shield} label="Admin Portal" />
                </>
              )}
            </nav>
          </div>

          <div className="pt-6 border-t border-gray-100">
             <button
              onClick={onLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 w-full transition-colors font-medium"
             >
               <RefreshCw size={20} />
               <span>Switch Role</span>
             </button>
             <div className="mt-4 px-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-200 flex items-center justify-center text-accent-800 font-bold">
                  {user.username.charAt(0)}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 p-2 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/tracker" icon={Calendar} label="Track" />
          <NavItem to="/ai-assistant" icon={Sparkles} label="AI" />
          <NavItem to="/health" icon={HeartPulse} label="Health" />
          <button onClick={onLogout} className="p-3 text-gray-400"><RefreshCw size={20}/></button>
      </div>
    </div>
  );
};

export default Layout;

export const useHashRouting = () => {
    const [loc, setLoc] = React.useState(window.location.hash.replace('#', '') || '/');
    
    React.useEffect(() => {
        const handleHashChange = () => {
            setLoc(window.location.hash.replace('#', '') || '/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (to: string) => {
        window.location.hash = to;
    };

    return { path: loc, navigate };
}