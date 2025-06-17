// components/dashboard/UserManagement.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const UserManagement = ({ users, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No users found.</p>
      </div>
    );
  }
  
  // Display top 5 users based on total score
  const topUsers = [...users]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 5);
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-gray-400 font-medium">Username</th>
              <th className="p-3 text-gray-400 font-medium">Total Score</th>
              <th className="p-3 text-gray-400 font-medium">Role</th>
              <th className="p-3 text-gray-400 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-3 text-white">{user.username}</td>
                <td className="p-3 text-white">{user.total_score || 0}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500 bg-opacity-20 text-red-400' : 'bg-blue-500 bg-opacity-20 text-blue-400'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="p-3">
                  <Link 
                    to={`/admin/users/${user.id}`} 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          to="/admin/users" 
          className="text-blue-400 hover:text-blue-300"
        >
          View all users →
        </Link>
      </div>
    </div>
  );
};

UserManagement.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

export default UserManagement;