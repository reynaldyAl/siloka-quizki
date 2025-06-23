import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar/Navbar';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <Navbar />
      
      {/* Star background */}
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>
      
      {/* Floating planets */}
      <div className="planet planet1"></div>
      <div className="planet planet2"></div>
      <div className="planet planet3"></div>
      
      <div className="not-found-content">
        <div className="not-found-card">
          {/* Astronaut removed */}
          <h1 className="not-found-title">
            <span className="gradient-text">404</span>
          </h1>
          
          <h2 className="not-found-subtitle">
            Houston, We Have a Problem
          </h2>
          
          <p className="not-found-message">
            The cosmic coordinates you're looking for seem to be in another universe.
            This page has drifted into a black hole or doesn't exist.
          </p>
          
          <div className="not-found-actions">
            <Link to="/">
              <button className="notfound-btn">
                Return to Home Base
              </button>
            </Link>
            <Link to="/quizzes">
              <button className="notfound-btn">
                Explore Quizzes
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;