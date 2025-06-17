// pages/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileForm from '../../components/profile/EditProfileForm';
import api from '../../services/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading state
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Get user data from API
        const response = await api.get('/me');
        console.log('Profile API response:', response.data);
        
        // Get user's quiz statistics (if your API has this endpoint)
        let quizStats = {
          quizzesTaken: 0,
          averageScore: 0,
          rank: 'Novice'
        };
        
        try {
          // If you have a quiz statistics endpoint
          const statsResponse = await api.get('/my-statistics');
          quizStats = statsResponse.data;
        } catch (statsErr) {
          console.warn('Could not fetch quiz statistics:', statsErr);
          // Use demo statistics
          quizStats = {
            quizzesTaken: 12,
            averageScore: 85,
            rank: 'Quiz Master'
          };
        }
        
        // Combine API response with additional data
        const userData = {
          ...response.data,
          ...quizStats
        };
        
        setUser(userData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        setError('Failed to load profile data');
        
        // Try to use localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser({
              ...userData,
              quizzesTaken: 12,
              averageScore: 85,
              rank: 'Quiz Master'
            });
          } catch (parseErr) {
            console.error('Failed to parse stored user data:', parseErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveProfile = async (formData) => {
    setLoading(true);
    
    try {
      // In a real implementation, send profile update to API
      // const response = await api.put('/users/profile', formData);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user data
      const updatedUser = {
        ...user,
        ...formData
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing ? (
        <EditProfileForm 
          user={user}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          loading={loading}
        />
      ) : (
        <ProfileCard 
          user={user} 
          onEditClick={handleEditClick}
        />
      )}
    </div>
  );
};

export default ProfilePage;
