import React, { useState, useEffect } from 'react';
import { useHashRouting } from './components/Layout';
import Auth from './components/Auth';
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
    const storedUser = Db.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    Db.logoutUser();
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary-500 font-bold">Loading Flowing Wisdom...</div>;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

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
    <Layout user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;