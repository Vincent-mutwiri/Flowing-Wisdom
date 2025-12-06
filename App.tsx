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
import * as Db from './services/mockDb';
import { UserProfile } from './types';

export const useHashLocation = useHashRouting;

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { path } = useHashRouting();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login logic
    const initUser = async () => {
        let storedUser = Db.getCurrentUser();
        
        if (!storedUser) {
            // Auto-login as default user 'u1' (Alice)
            // accessing internal storage key from service would be cleaner but direct is fine for mock
            localStorage.setItem('fw_session', JSON.stringify('u1')); 
            
            // Wait a tick for storage to settle or retry get
            storedUser = Db.getCurrentUser();
            
            // Fallback if DB is completely empty (shouldn't happen due to mockDb init)
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
        // Create or switch to admin
        const adminProfile: UserProfile = {
            ...user,
            id: 'admin_demo',
            username: 'AdminUser',
            role: 'admin',
            email: 'admin@flow.com'
        };
        // In a real app we'd save this to DB, here just local state for the session
        setUser(adminProfile);
        alert("Switched to Admin Mode");
    } else {
        // Switch back to default user
        localStorage.setItem('fw_session', JSON.stringify('u1'));
        const defaultUser = Db.getCurrentUser();
        if (defaultUser) {
            setUser(defaultUser);
            alert("Switched to User Mode");
        } else {
             // Reload to reset
             window.location.reload();
        }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary-500 font-bold">Loading Flowing Wisdom...</div>;

  if (!user) return <div className="p-4">Initializing...</div>;

  const renderContent = () => {
    switch (path) {
      case '/':
        return <Dashboard user={user} />;
      case '/tracker':
        return <Tracker user={user} />;
      case '/community':
        return <Community user={user} />;
      case '/leaderboard':
        return <Leaderboard user={user} />;
      case '/ai-assistant':
        return <AiAssistant user={user} />;
      case '/health':
        return <HealthTools user={user} />;
      case '/admin':
        return <Admin user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleRoleSwitch}>
      {renderContent()}
    </Layout>
  );
};

export default App;