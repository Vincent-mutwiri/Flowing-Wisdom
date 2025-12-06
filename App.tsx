import React, { useState, useEffect } from 'react';
import { useHashRouting } from './components/Layout';
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
import * as Api from './services/api';
import { UserProfile } from './types';
import { AnimatePresence } from 'framer-motion';

export const useHashLocation = useHashRouting;

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { path } = useHashRouting();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const storedUser = await Api.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setShowOnboarding(false);
        } else {
          // If no user, show onboarding to register/login
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  const handleOnboardingComplete = async (userData?: any) => {
    // Assuming Onboarding now handles registration/login and returns user data
    // Or we just re-fetch the user
    const currentUser = await Api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setShowOnboarding(false);
    } else {
      // Fallback for demo if backend not fully ready or connected
      // Create a temp user via API
      try {
        const newUser = await Api.registerUser(`user${Date.now()}@test.com`, 'NewUser', 18);
        setUser(newUser);
        setShowOnboarding(false);
      } catch (e) {
        alert("Failed to create user. Please check backend connection.");
      }
    }
  };

  const handleLogout = () => {
    Api.logoutUser();
    setUser(null);
    setShowOnboarding(true);
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
        return <Settings key="settings" user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard key="default" user={user} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </Layout>
  );
};

export default App;