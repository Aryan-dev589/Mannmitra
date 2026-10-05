import { useState } from 'react'
import './App.css'
import OnboardingScreen from './Onboard.jsx'
import AuthPage from './Auth.jsx';
import { MainLayout }  from './MainLayout.jsx';
import { supabase } from './supabaseClient';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleGetStarted = () => {
    setShowOnboarding(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out error:', error);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (showOnboarding) {
    return <OnboardingScreen onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <MainLayout user={user} onLogout={handleLogout} />;
}

export default App
