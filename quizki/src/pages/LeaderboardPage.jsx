import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from "../components/common/Navbar/Navbar";
import LoadingSpinner from '../components/common/LoadingSpinner';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const podiumRef = useRef(null);
  
  const navigate = useNavigate();

  // Generate random sparkles effect for the trophy animation
  useEffect(() => {
    if (!loading && users.length > 0) {
      const newSparkles = Array(15).fill().map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: `${Math.random() * 2}s`,
        size: 3 + Math.random() * 6
      }));
      setSparkles(newSparkles);
      
      // Create podium animation
      if (podiumRef.current) {
        podiumRef.current.classList.add('show-podium');
      }
    }
  }, [loading, users.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all users (sorted by score)
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data);
        
        // Try to get current user info (but don't redirect if not logged in)
        try {
          const currentUserResponse = await api.get('/me');
          setCurrentUser(currentUserResponse.data);
        } catch (userError) {
          // If 401, user not logged in - that's okay for leaderboard
          if (userError.response?.status !== 401) {
            console.error('Error getting current user:', userError);
          }
        }
        
      } catch (err) {
        console.error('Error loading leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]); // Re-fetch when time filter changes

  // Find current user's rank in the leaderboard
  const getCurrentUserRank = () => {
    if (!currentUser || !users.length) return null;
    
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const currentUserRank = getCurrentUserRank();
  
  // Calculate stats
  const getStats = () => {
    if (!users.length) return {};
    
    const topScore = users[0]?.total_score || 0;
    const avgScore = users.reduce((sum, user) => sum + user.total_score, 0) / users.length;
    
    return {
      totalUsers: users.length,
      topScore: topScore,
      avgScore: avgScore.toFixed(1)
    };
  };
  
  const stats = getStats();
  
  // Helper function to determine badge for score
  const getBadgeForScore = (score) => {
    if (score >= 1000) return { name: "Cosmos Master", class: "badge-cosmic" };
    if (score >= 500) return { name: "Galaxy Explorer", class: "badge-galaxy" };
    if (score >= 300) return { name: "Star Navigator", class: "badge-star" };
    if (score >= 100) return { name: "Space Cadet", class: "badge-cadet" };
    return { name: "Rookie", class: "badge-rookie" };
  };

  if (loading) {
    return (
      <>
        <div className="cosmic-leaderboard-container auto">
          <div className="stars-background">
            <div className="stars small"></div>
            <div className="stars medium"></div>
            <div className="stars large"></div>
          </div>
          <div className="container mx-auto max-w-6xl px-4 py-20">
            <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-12">
              Cosmic Leaderboard
            </h1>
            <div className="flex justify-center items-center h-64">
              <div className="cosmos-loader">
                <div className="planet"></div>
                <div className="orbit">
                  <div className="satellite"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="cosmic-leaderboard-container">
          <div className="stars-background">
            <div className="stars small"></div>
            <div className="stars medium"></div>
          </div>
          <div className="container mx-auto max-w-4xl px-4 py-10">
            <div className="error-meteor">
              <div className="bg-red-900/30 border border-red-700 p-6 rounded-xl backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                <p className="text-red-200">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cosmic-leaderboard-container">
        <div className="stars-background">
          <div className="stars small"></div>
          <div className="stars medium"></div>
          <div className="stars large"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star delay-2"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 mb-12 glow-text">
            Cosmic Leaderboard
          </h1>
          
          {/* Time period filter */}
          <div className="flex justify-center mb-8">
            <div className="cosmic-tabs-container backdrop-blur-sm">
              <button 
                className={`cosmic-tab ${timeFilter === 'all-time' ? 'active' : ''}`}
                onClick={() => setTimeFilter('all-time')}
              >
                All Time
              </button>
              <button 
                className={`cosmic-tab ${timeFilter === 'monthly' ? 'active' : ''}`}
                onClick={() => setTimeFilter('monthly')}
              >
                This Month
              </button>
              <button 
                className={`cosmic-tab ${timeFilter === 'weekly' ? 'active' : ''}`}
                onClick={() => setTimeFilter('weekly')}
              >
                This Week
              </button>
            </div>
          </div>
          
          {/* Top 3 Users - Podium */}
          {users.length >= 3 && (
            <div className="cosmic-podium mb-10" ref={podiumRef}>
              <div className="sparkles-container">
                {sparkles.map(spark => (
                  <div 
                    key={spark.id}
                    className="sparkle"
                    style={{
                      left: `${spark.left}%`,
                      top: `${spark.top}%`,
                      animationDelay: spark.animationDelay,
                      width: `${spark.size}px`,
                      height: `${spark.size}px`
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="podium-container">
                {/* Second Place */}
                <div className="podium-place second-place">
                  <div className="medal silver">2</div>
                  <div className="user-avatar" style={{ backgroundImage: `linear-gradient(135deg, #d1d1d1, #f2f2f2)` }}>
                    {users[1].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="username">{users[1].username}</div>
                  <div className="score">{users[1].total_score}</div>
                  <div className="podium-block"></div>
                </div>
                
                {/* First Place */}
                <div className="podium-place first-place">
                  <div className="crown">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1l3.22 6.52 7.28.96-5.34 5.2 1.28 7.32L12 17.77l-6.44 3.23 1.28-7.32-5.34-5.2 7.28-.96L12 1z" />
                    </svg>
                  </div>
                  <div className="medal gold">1</div>
                  <div className="user-avatar" style={{ backgroundImage: `linear-gradient(135deg, #f4c141, #ffdd78)` }}>
                    {users[0].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="username">{users[0].username}</div>
                  <div className="score">{users[0].total_score}</div>
                  <div className="podium-block"></div>
                </div>
                
                {/* Third Place */}
                <div className="podium-place third-place">
                  <div className="medal bronze">3</div>
                  <div className="user-avatar" style={{ backgroundImage: `linear-gradient(135deg, #b56f50, #e0905a)` }}>
                    {users[2].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="username">{users[2].username}</div>
                  <div className="score">{users[2].total_score}</div>
                  <div className="podium-block"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats and Info */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Leaderboard Stats
              </h2>
              <button 
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="cosmic-button-small"
              >
                {showMoreInfo ? 'Hide Info' : 'Show Info'}
              </button>
            </div>
            
            {showMoreInfo && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 mb-6 fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Total Players</div>
                    <div className="stat-value">{stats.totalUsers}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Highest Score</div>
                    <div className="stat-value">{stats.topScore}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Average Score</div>
                    <div className="stat-value">{stats.avgScore}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-300">
                  <p>Complete quizzes to earn points and climb the leaderboard!</p>
                  <p>Rankings are updated in real-time as users complete quizzes.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Display user's rank if logged in */}
          {currentUser && currentUserRank && (
            <div className="cosmic-user-card mb-8">
              <div className="cosmic-user-heading">Your Ranking</div>
              <div className="cosmic-user-content">
                <div className="flex flex-col md:flex-row justify-between items-center w-full">
                  <div className="flex items-center">
                    <div className="cosmic-avatar your-avatar">
                      {currentUser.username.charAt(0).toUpperCase()}
                      <div className="cosmic-avatar-glow"></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-xl font-bold text-white">{currentUser.username}</div>
                      <div className="badge-container">
                        <span className={`badge ${getBadgeForScore(currentUser.total_score).class}`}>
                          {getBadgeForScore(currentUser.total_score).name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-8 mt-4 md:mt-0">
                    <div className="stat">
                      <div className="text-lg text-blue-300">Position</div>
                      <div className="text-3xl font-bold">{currentUserRank}</div>
                    </div>
                    <div className="stat">
                      <div className="text-lg text-blue-300">Score</div>
                      <div className="text-3xl font-bold">{currentUser.total_score}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Login prompt for guests */}
          {!currentUser && (
            <div className="cosmic-login-prompt mb-8">
              <div className="login-prompt-content">
                <div className="text-xl font-bold text-white mb-2">Want to track your progress?</div>
                <p className="text-blue-200 mb-4">
                  Sign in to see your personal ranking and track your quiz performance!
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="cosmic-button-primary"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="cosmic-button-secondary"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Full Leaderboard Table */}
          <div className="cosmic-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="cosmic-table-header">
                    <th className="cosmic-th">Rank</th>
                    <th className="cosmic-th">Player</th>
                    <th className="cosmic-th">Badge</th>
                    <th className="cosmic-th text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30">
                  {users.map((user, index) => {
                    const badge = getBadgeForScore(user.total_score);
                    return (
                      <tr 
                        key={user.id} 
                        className={`
                          cosmic-table-row
                          ${currentUser && user.id === currentUser.id ? 'cosmic-table-row-highlight' : ''}
                          ${index < 10 ? 'top-ten' : ''}
                        `}
                      >
                        <td className="cosmic-td">
                          {/* Top 3 ranks get special styling */}
                          {index === 0 && (
                            <div className="rank-badge gold">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                                <path fillRule="evenodd" d="M12 1l3.22 6.52 7.28.96-5.34 5.2 1.28 7.32L12 17.77l-6.44 3.23 1.28-7.32-5.34-5.2 7.28-.96L12 1z"/>
                              </svg>
                              <span>1</span>
                            </div>
                          )}
                          {index === 1 && (
                            <div className="rank-badge silver">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                                <path fillRule="evenodd" d="M12 1l3.22 6.52 7.28.96-5.34 5.2 1.28 7.32L12 17.77l-6.44 3.23 1.28-7.32-5.34-5.2 7.28-.96L12 1z"/>
                              </svg>
                              <span>2</span>
                            </div>
                          )}
                          {index === 2 && (
                            <div className="rank-badge bronze">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                                <path fillRule="evenodd" d="M12 1l3.22 6.52 7.28.96-5.34 5.2 1.28 7.32L12 17.77l-6.44 3.23 1.28-7.32-5.34-5.2 7.28-.96L12 1z"/>
                              </svg>
                              <span>3</span>
                            </div>
                          )}
                          {index > 2 && (
                            <span className="rank-number">{index + 1}</span>
                          )}
                        </td>
                        <td className="cosmic-td">
                          <div className="flex items-center">
                            <div className={`cosmic-avatar ${index < 3 ? `top-${index+1}` : ''}`}>
                              {user.username.charAt(0).toUpperCase()}
                              <div className="cosmic-avatar-glow"></div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{user.username}</div>
                              {currentUser && user.id === currentUser.id && (
                                <span className="text-xs text-blue-400">(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="cosmic-td">
                          <span className={`badge ${badge.class}`}>
                            {badge.name}
                          </span>
                        </td>
                        <td className="cosmic-td text-right">
                          <div className="score-display">
                            <span className="score-value">{user.total_score}</span>
                            {index < 10 && <span className="score-sparkle"></span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;