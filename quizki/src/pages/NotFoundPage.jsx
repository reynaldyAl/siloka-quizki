import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar/Navbar';
import Button from '../components/common/Button/Button';
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
          <div className="lost-astronaut">
            <div className="astronaut-helmet"></div>
            <div className="astronaut-body"></div>
            <div className="astronaut-jetpack"></div>
            <div className="astronaut-arms left"></div>
            <div className="astronaut-arms right"></div>
            <div className="astronaut-legs left"></div>
            <div className="astronaut-legs right"></div>
          </div>
          
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
              <Button
                variant="primary"
                theme="space"
                size="large"
              >
                Return to Home Base
              </Button>
            </Link>
            <Link to="/quizzes">
              <Button
                variant="secondary"
                theme="space"
              >
                Explore Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;