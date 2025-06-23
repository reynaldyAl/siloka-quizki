import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProfileCardAdmin from '../../components/profile/ProfileCardAdmin';
import api from '../../services/api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate user rank based on total score only
  const getUserRank = (totalScore) => {
    if (totalScore >= 1000) return "Quiz Master";
    if (totalScore >= 500) return "Quiz Expert";
    if (totalScore >= 200) return "Quiz Enthusiast";
    if (totalScore > 0) return "Quiz Apprentice";
    return "Novice";
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get user data from API
        const response = await api.get(`/users/${userId}`);
        const userData = response.data;

        // Calculate rank based on total_score
        const totalScore = userData.total_score || 0;
        const rank = getUserRank(totalScore);

        setUser({
          ...userData,
          rank
        });
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors duration-200"
        style={{ textDecoration: 'none', width: 'fit-content' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>
      <ProfileCardAdmin user={user} />
    </div>
  );
};

export default UserProfilePage;