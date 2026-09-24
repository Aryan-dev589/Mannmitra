import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    passphrase: '',
    confirmPassphrase: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    if (!isLogin && formData.passphrase !== formData.confirmPassphrase) {
      setErrorMessage("Passphrases don't match!");
      return;
    }

    if (formData.passphrase.length < 6) {
      setErrorMessage("Passphrase should be at least 6 characters long");
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const syntheticEmail = `${cleanUsername}@mannmitra.local`;

    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password: formData.passphrase
        });

        if (error) {
          setErrorMessage(error.message.includes('Invalid login credentials')
            ? 'Incorrect username or passphrase.'
            : error.message);
          return;
        }

        onAuthSuccess({
          username: data.user.user_metadata?.username || formData.username,
          user: data.user
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: syntheticEmail,
          password: formData.passphrase,
          options: {
            data: { username: formData.username.trim() }
          }
        });

        if (error) {
          setErrorMessage(error.message.includes('User already registered')
            ? 'This username is already taken. Please pick another.'
            : error.message);
          return;
        }

        onAuthSuccess({ username: formData.username.trim(), user: data.user });
      }
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGuestAccess = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      onAuthSuccess({ username: 'Guest', user: data.user, isGuest: true });
    } catch (error) {
      onAuthSuccess({
        username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
        isGuest: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">MannMitra</h1>
            <p className="text-gray-400">Your Mental Wellness Companion</p>
          </div>
          
          {/* Form title */}
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isLogin ? 'Welcome Back' : 'Create Your Safe Space'}
          </h2>
          
          {/* Auth form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Enter Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                placeholder="e.g., quiet_wanderer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Your username will always remain anonymous.</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="passphrase" className="block text-sm font-medium text-gray-300">
                  Secure Passphrase
                </label>
                <span className="text-xs text-gray-500">A memorable phrase</span>
              </div>
              <div className="relative">
                <input
                  id="passphrase"
                  name="passphrase"
                  type={showPassword ? "text" : "password"}
                  value={formData.passphrase}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                  placeholder="6+ characters"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassphrase" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Passphrase
                </label>
                <input
                  id="confirmPassphrase"
                  name="confirmPassphrase"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassphrase}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                  placeholder="Re-enter your passphrase"
                  required={!isLogin}
                />
              </div>
            )}

            {errorMessage && (
              <p className="text-sm text-red-400" role="alert">{errorMessage}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors duration-300 shadow-lg shadow-indigo-600/30 mt-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          {/* Guest access */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button 
              onClick={handleGuestAccess}
              disabled={loading}
              className="w-full py-3 px-4 border border-gray-600 bg-gray-700/50 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;