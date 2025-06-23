import React from 'react';
import PropTypes from 'prop-types';

// Helper function to determine badge for score
const getBadgeForScore = (score = 0) => {
  if (score >= 1000) return {
    name: "Cosmos Master",
    class: "bg-gradient-to-r from-yellow-400 to-yellow-700 text-gray-900 shadow-lg hover:scale-105 transition-transform"
  };
  if (score >= 500) return {
    name: "Galaxy Explorer",
    class: "bg-gradient-to-r from-blue-400 to-blue-700 text-white shadow-lg hover:scale-105 transition-transform"
  };
  if (score >= 300) return {
    name: "Star Navigator",
    class: "bg-gradient-to-r from-purple-400 to-purple-700 text-white shadow-lg hover:scale-105 transition-transform"
  };
  if (score >= 100) return {
    name: "Space Cadet",
    class: "bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg hover:scale-105 transition-transform"
  };
  return {
    name: "Rookie",
    class: "bg-gradient-to-r from-gray-400 to-gray-700 text-white shadow-lg hover:scale-105 transition-transform"
  };
};

const ProfileCardAdmin = ({ user }) => {
  const avatar = user?.avatar || 'https://api.dicebear.com/6.x/pixel-art/svg?seed=Felix';

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-500 border-red-600';
      case 'moderator':
        return 'bg-purple-500 border-purple-600';
      case 'user':
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  const formattedRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : 'User';

  const roleBadgeColor = getRoleBadgeColor(user?.role);

  // Get badge info for total_score
  const badge = getBadgeForScore(user?.total_score);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-w-3xl mx-auto animate-fade-in">
      {/* Profile Header with Background */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        <div className="stars-bg small absolute inset-0 opacity-30"></div>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 py-8 relative">
        {/* Avatar */}
        <div className="absolute -top-12 left-6 border-4 border-gray-800 rounded-full overflow-hidden shadow-xl">
          <img
            src={avatar}
            alt={`${user?.username || 'User'}'s avatar`}
            className="w-24 h-24 object-cover"
          />
        </div>

        {/* Role Badge */}
        <div className="absolute -top-4 left-36">
          <span className={`${roleBadgeColor} text-white text-sm font-bold px-3 py-1 rounded-full border-2 shadow-lg`}>
            {formattedRole}
          </span>
        </div>

        {/* User Name and Details */}
        <h1 className="text-2xl font-bold text-white mt-16">{user?.username}</h1>
        <p className="text-blue-400 mb-4">@{user?.username}</p>

        {/* User Bio */}
        <p className="text-gray-300 mb-6">
          {user?.bio || 'No bio provided yet. Tell us about yourself!'}
        </p>

        {/* Total Score & Rank */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <h3 className="text-xl font-bold text-yellow-400">{user?.total_score || 0}</h3>
            <p className="text-gray-300 text-sm">Total Score</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${badge.class}`}>
              {badge.name}
            </span>
            <p className="text-gray-300 text-sm mt-2">Rank</p>
          </div>
        </div>

        {/* Additional User Info */}
        <div className="bg-gray-700 p-5 rounded-lg mb-6">
          <h3 className="text-xl font-bold text-white mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="text-gray-400 w-24">Role:</div>
              <div className="text-white font-medium">{formattedRole}</div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-400 w-24">User ID:</div>
              <div className="text-white font-medium">{user?.id || 'N/A'}</div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-400 w-24">Joined:</div>
              <div className="text-white font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="border-t border-gray-700 pt-4">
          {user?.email && (
            <div className="flex items-center text-gray-300 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {user.email}
            </div>
          )}

          {user?.location && (
            <div className="flex items-center text-gray-300 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileCardAdmin.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    bio: PropTypes.string,
    location: PropTypes.string,
    total_score: PropTypes.number,
    role: PropTypes.string,
    id: PropTypes.number,
    created_at: PropTypes.string,
  }),
};

export default ProfileCardAdmin;