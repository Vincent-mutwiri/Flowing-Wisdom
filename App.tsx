import React, { useState, useEffect } from 'react';
import { useHashRouting } from './components/Layout';
// Auth component removed
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Community from './components/Community';
import Leaderboard from './components/Leaderboard';
import Admin from './components/Admin';
import AiAssistant from './components/AiAssistant';
import HealthTools from './components/HealthTools';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import * as Db from './services/mockDb';
import { UserProfile } from './types';
import { AnimatePresence } from 'framer-motion';

export const useHashLocation = useHashRouting;

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { path } = useHashRouting();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding is done
    const onboarded = localStorage.getItem('fw_onboarded');
    if (onboarded) {
        setShowOnboarding(false);
    }

    // Auto-login logic
    const initUser = async () => {
        let storedUser = Db.getCurrentUser();
        
        if (!storedUser) {
            // Auto-login as default user 'u1' (Alice)
            localStorage.setItem('fw_session', JSON.stringify('u1')); 
            
            // Wait a tick for storage to settle
            storedUser = Db.getCurrentUser();
            
            // Fallback if DB is completely empty
            if (!storedUser) {
                const defaultUser: UserProfile = { 
                  id: 'u1', 
                  email: 'alice@test.com', 
                  username: 'MoonChild', 
                  age: 14, 
                  role: 'user', 
                  points: 450, 
                  currentStreak: 12, 
                  joinedAt: new Date().toISOString() 
                };
                setUser(defaultUser);
                setLoading(false);
                return;
            }
        }
        setUser(storedUser);
        setLoading(false);
    };

    initUser();
  }, []);

  const handleRoleSwitch = () => {
    if (!user) return;
    
    // Toggle between user and admin for demo purposes
    if (user.role === 'user') {
        const adminProfile: UserProfile = {
            ...user,
            id: 'admin_demo',
            username: 'AdminUser',
            role: 'admin',
            email: 'admin@flow.com'
        };
        setUser(adminProfile);
        alert("Switched to Admin Mode");
    } else {
        localStorage.setItem('fw_session', JSON.stringify('u1'));
        const defaultUser = Db.getCurrentUser();
        if (defaultUser) {
            setUser(defaultUser);
            alert("Switched to User Mode");
        } else {
             window.location.reload();
        }
    }
  };

  const handleOnboardingComplete = () => {
      localStorage.setItem('fw_onboarded', 'true');
      setShowOnboarding(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary-500 font-bold">Loading Flowing Wisdom...</div>;
  
  if (showOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!user) return <div className="p-4">Initializing...</div>;

  const renderContent = () => {
    switch (path) {
      case '/':
        return <Dashboard key="dashboard" user={user} />;
      case '/tracker':
        return <Tracker key="tracker" user={user} />;
      case '/community':
        return <Community key="community" user={user} />;
      case '/leaderboard':
        return <Leaderboard key="leaderboard" user={user} />;
      case '/ai-assistant':
        return <AiAssistant key="ai" user={user} />;
      case '/health':
        return <HealthTools key="health" user={user} />;
      case '/admin':
        return <Admin key="admin" user={user} />;
      case '/settings':
        return <Settings key="settings" user={user} onLogout={handleRoleSwitch} />;
      default:
        return <Dashboard key="default" user={user} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleRoleSwitch}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </Layout>
  );
};

export default App;