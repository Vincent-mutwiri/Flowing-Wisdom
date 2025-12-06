import React from 'react';
import { useHashLocation } from '../App';
import { UserProfile } from '../types';
import { LayoutDashboard, Calendar, Users, Trophy, LogOut, Shield, Sparkles, Activity, HeartPulse } from 'lucide-react';

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
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all w-full mb-1
          ${isActive 
            ? 'bg-primary-100 text-primary-800 font-bold' 
            : 'text-gray-700 hover:bg-gray-100 font-medium'
          }`}
      >
        <Icon size={20} className={isActive ? "text-primary-600" : "text-gray-500"} />
        <span className="hidden md:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className="fixed bottom-0 w-full md:relative md:w-64 md:h-screen bg-white border-t md:border-t-0 md:border-r border-gray-200 z-50 flex md:flex-col justify-between p-2 md:p-6 shadow-sm">
        <div className="flex md:flex-col justify-around w-full md:w-auto overflow-x-auto md:overflow-visible no-scrollbar">
          
          <div className="hidden md:block mb-8 px-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Flowing Wisdom
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Hello, {user.username}</p>
          </div>

          <div className="flex md:block md:space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/tracker" icon={Calendar} label="Cycle Tracker" />
            <NavItem to="/health" icon={HeartPulse} label="Health Tools" />
            <NavItem to="/community" icon={Users} label="Social Space" />
            <NavItem to="/ai-assistant" icon={Sparkles} label="AI Assistant" />
            <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
            
            {user.role === 'admin' && (
               <NavItem to="/admin" icon={Shield} label="Admin Portal" />
            )}
          </div>

          <div className="hidden md:block pt-4 border-t border-gray-100 mt-auto">
             <button
              onClick={onLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors font-medium"
             >
               <LogOut size={20} />
               <span>Logout</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-[#fff5f6]">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

       {/* Mobile Header */}
       <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 z-40 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-primary-700">Flowing Wisdom</h1>
          <button onClick={onLogout} className="text-gray-500 hover:text-red-500">
            <LogOut size={20} />
          </button>
       </div>
       <div className="md:hidden h-16"></div> {/* Spacer */}
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