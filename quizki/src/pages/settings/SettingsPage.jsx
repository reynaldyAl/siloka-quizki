// src/pages/settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const SettingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    soundEffects: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // You could load user settings from API here
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Example API call, uncomment when API endpoint is available
        // const response = await api.get('/user/settings');
        // setSettings(response.data);
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Example API call, uncomment when API endpoint is available
      // await api.put('/user/settings', settings);
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page p-6 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
            {message.text}
          </div>
        )}
        
        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-xl text-white mb-4">Profile</h2>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-4">
                <div className="text-lg text-white font-medium">{user?.username || 'Username'}</div>
                <div className="text-gray-400">{user?.email || 'email@example.com'}</div>
              </div>
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
              Edit Profile
            </button>
          </div>
          
          {/* Preferences Section */}
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-xl text-white mb-4">Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Dark Mode</div>
                  <div className="text-sm text-gray-400">Use dark theme for the application</div>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-600'}`}
                  onClick={() => handleToggle('darkMode')}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Notifications</div>
                  <div className="text-sm text-gray-400">Receive quiz and update notifications</div>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer ${settings.notifications ? 'bg-blue-600' : 'bg-gray-600'}`}
                  onClick={() => handleToggle('notifications')}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${settings.notifications ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Sound Effects</div>
                  <div className="text-sm text-gray-400">Play sounds on quiz actions</div>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer ${settings.soundEffects ? 'bg-blue-600' : 'bg-gray-600'}`}
                  onClick={() => handleToggle('soundEffects')}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${settings.soundEffects ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Actions Section */}
          <div>
            <h2 className="text-xl text-white mb-4">Account</h2>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
                Change Password
              </button>
              <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition">
                Delete Account
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={saveSettings}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;