import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false); // For hero section animation

  // Animation on scroll effect
  useEffect(() => {
    // Trigger hero section fade-in animation on component mount
    setIsVisible(true);

    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const position = el.getBoundingClientRect();
        // Animate element when 80% of it is in the viewport
        if (position.top < window.innerHeight * 0.8 && position.bottom >= 0) {
          el.classList.add('animate-fade-in');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on initial load to check elements in view

    return () => window.removeEventListener('scroll', handleScroll); // Cleanup event listener
  }, []);

  const handleSubscribe = () => {
    // In a real application, send the email to your backend here
    console.log('Subscribing with email:', email);
    setEmail(''); // Clear the input field
    setIsModalOpen(true); // Show confirmation modal
    setTimeout(() => setIsModalOpen(false), 3000); // Hide modal after 3 seconds
  };

  return (
    <div className="max-w-screen-2xl mx-auto font-sans text-gray-100 bg-gray-900">
      {/* Hero Section: Dynamic Background & Engaging Call to Action */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 py-24 px-6 md:px-12 lg:px-20 min-h-[85vh] flex items-center justify-center">
        {/* Animated Particles for Background */}
        <div className="absolute inset-0 overflow-hidden opacity-75">
          {[...Array(25)].map((_, i) => ( // More particles for a richer background
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-10 blur-sm" // Added blur for a softer look
              style={{
                width: `${Math.random() * 80 + 30}px`, // Varied sizes
                height: `${Math.random() * 80 + 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 10}s`, // Slightly faster animations
                animationDelay: `${Math.random() * 4}s`,
                transform: 'scale(0)',
                animation: 'pulse 15s infinite ease-in-out alternate' // Smoother pulse
              }}
            />
          ))}
        </div>

        {/* Hero Content: Animated Entry */}
        <div className={`relative z-10 max-w-6xl mx-auto text-center transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h1 className="mb-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-xl">
            Challenge Your <span className="text-yellow-300">Knowledge</span> with QuizKi
          </h1>
          <p className="mb-12 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed opacity-90">
            Dive into thousands of interactive quizzes across diverse categories, track your progress, and join a global community of learners.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link to="/quizzes">
              <button
                className="px-10 py-5 bg-white text-blue-700 rounded-full font-bold text-xl transition-all duration-300 hover:bg-yellow-300 hover:text-blue-800 hover:scale-105 shadow-2xl flex items-center justify-center group transform-gpu"
              >
                <span>Browse Quizzes</span>
                <svg className="w-6 h-6 ml-3 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
            <Link to="/login">
              <button
                className="px-10 py-5 bg-blue-900 bg-opacity-60 text-white rounded-full font-bold text-xl border-2 border-white transition-all duration-300 hover:bg-blue-800 hover:border-yellow-300 hover:scale-105 shadow-2xl transform-gpu"
              >
                Login to Play
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for a smoother transition to the next section */}
      <div className="h-24 bg-gradient-to-b from-indigo-800 to-gray-900"></div>

      {/* Features Section: Highlight Key Benefits */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="inline-block px-5 py-2 bg-blue-100 text-blue-600 rounded-full text-base font-semibold mb-4 shadow-md">KEY FEATURES</span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-7 mt-6 leading-tight">Why QuizKi Stands Out?</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
            QuizKi is designed to make learning engaging and effective. Discover how our platform empowers your knowledge journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {/* Feature Card: Diverse Categories */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10 transition-all duration-300 hover:bg-gray-700 hover:-translate-y-3 shadow-xl group animate-on-scroll transform-gpu">
            <div className="w-20 h-20 mb-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center group-hover:bg-yellow-500 transition-colors transform group-hover:rotate-6 duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">Vast Quiz Library</h3>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Explore thousands of quizzes across a multitude of subjects, from STEM to arts and general knowledge. Always find something new to learn!
            </p>
            <Link to="/quizzes" className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300 transition-colors text-lg group">
              <span>Explore Topics</span>
              <svg className="w-5 h-5 ml-2.5 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Feature Card: Personalized Progress Tracking */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10 transition-all duration-300 hover:bg-gray-700 hover:-translate-y-3 shadow-xl group animate-on-scroll transform-gpu">
            <div className="w-20 h-20 mb-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center group-hover:bg-yellow-500 transition-colors transform group-hover:rotate-6 duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">Intelligent Progress</h3>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Gain deep insights into your learning patterns with detailed performance analytics. Pinpoint strengths and areas needing improvement.
            </p>
            <Link to="/login" className="inline-flex items-center font-medium text-purple-400 hover:text-purple-300 transition-colors text-lg group">
              <span>View Your Analytics</span>
              <svg className="w-5 h-5 ml-2.5 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Feature Card: Community & Competition */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10 transition-all duration-300 hover:bg-gray-700 hover:-translate-y-3 shadow-xl group animate-on-scroll transform-gpu">
            <div className="w-20 h-20 mb-8 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center group-hover:bg-yellow-500 transition-colors transform group-hover:rotate-6 duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">Compete & Connect</h3>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Challenge friends, join global leaderboards, and earn prestigious badges. Connect with a vibrant community of learners.
            </p>
            <Link to="/login" className="inline-flex items-center font-medium text-green-400 hover:text-green-300 transition-colors text-lg group">
              <span>Join Global Ranks</span>
              <svg className="w-5 h-5 ml-2.5 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Quiz Categories Section: Engaging Visuals and Filtering */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 animate-on-scroll">
            <span className="inline-block px-5 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-semibold mb-4 shadow-md">EXPLORE & DISCOVER</span>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-7 mt-6 leading-tight">Popular Quiz Categories</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Find your next challenge! Browse our most popular categories and test your expertise.
            </p>
          </div>

          {/* Category Tabs: Interactive Filtering */}
          <div className="flex flex-wrap justify-center gap-4 mb-14 animate-on-scroll">
            {['all', 'science', 'history', 'technology', 'arts', 'sports', 'literature', 'geography'].map((category) => ( // Added more categories
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white shadow-lg border border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-700 hover:border-blue-500'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Quiz Category Cards: Dynamic Content & Hover Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Adjusted grid for more cards */}
            {[
              {
                title: "Science Basics",
                description: "Fundamental scientific concepts across physics, chemistry, and biology.",
                image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                difficulty: "Beginner",
                questions: "No",
                category: "science",
                gradient: "from-green-500 to-teal-500" // Added gradient for card hover
              },
              {
                title: "World History",
                description: "Major global historical events, figures, and eras.",
                image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                difficulty: "Intermediate",
                questions: "No",
                category: "history",
                gradient: "from-amber-500 to-orange-500"
              },
              {
                title: "Programming Fundamentals",
                description: "Core concepts of coding, algorithms, and data structures.",
                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                difficulty: "Advanced",
                questions: "No",
                category: "technology",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                title: "Classical Art & Masters",
                description: "Iconic artworks, movements, and artists through history.",
                image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                difficulty: "Intermediate",
                questions: "No",
                category: "arts",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                title: "Olympic Games History",
                description: "Facts and events from ancient to modern Olympic games.",
                image: "https://plus.unsplash.com/premium_photo-1713102867179-467de3e1b0fb?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                difficulty: "Beginner",
                questions: "No",
                category: "sports",
                gradient: "from-lime-500 to-emerald-500"
              },
              {
                title: "Space Exploration Milestones",
                description: "Key achievements, missions, and figures in space travel.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                difficulty: "Advanced",
                questions: "No",
                category: "science",
                gradient: "from-sky-500 to-cyan-500"
              },
              {
                title: "Literary Classics",
                description: "Authors, plots, and themes from timeless novels and poems.",
                image: "https://images.unsplash.com/photo-1693627121296-809fc35e36b7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                difficulty: "Intermediate",
                questions: "No",
                category: "literature",
                gradient: "from-red-500 to-purple-500"
              },
              {
                title: "World Geography",
                description: "Capitals, countries, landmarks, and physical geography.",
                image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                difficulty: "Beginner",
                questions: "No",
                category: "geography",
                gradient: "from-teal-500 to-blue-500"
              },
            ].filter(item => activeCategory === 'all' || item.category === activeCategory)
              .map((quiz, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 animate-on-scroll group transform-gpu relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${quiz.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div> {/* Gradient overlay on hover */}
                  <div className="h-48 overflow-hidden relative z-10">
                    <img
                      src={quiz.image}
                      alt={quiz.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115" // Stronger scale on hover
                    />
                  </div>
                  {/* === START PERUBAHAN UTAMA DI SINI === */}
                  <div className="p-6 relative z-10 flex flex-col h-[calc(100%-12rem)]"> {/* Added flex flex-col and defined a height */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1.5 text-sm font-semibold rounded-full shadow-md ${ // Increased padding, rounded-full
                        quiz.difficulty === 'Beginner' ? 'bg-green-600 text-white' : // Solid colors for difficulty
                          quiz.difficulty === 'Intermediate' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                        }`}>
                        {quiz.difficulty}
                      </span>
                      <span className="text-gray-400 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9.247a4.25 4.25 0 00-1.579 3.093c0 2.378 1.517 4.437 3.731 5.22.404.14.81.25 1.213.333m.062-.063l1.92-5.762m-1.92 5.762A8.962 8.962 0 0112 18c2.115 0 4.127-.643 5.86-1.84M7.947 13.91l-1.603 1.603m1.603-1.603L12 10.963l-4.053 4.053m0 0a6.513 6.513 0 00-1.84-2.887" />
                        </svg>
                        {quiz.questions} Questions
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">{quiz.title}</h3>
                    <p className="text-gray-400 mb-6 text-base leading-relaxed flex-grow">{quiz.description}</p> {/* Added flex-grow */}
                    <Link to="/login" className="mt-auto"> {/* Added mt-auto to push button to bottom */}
                      <button
                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 transform group-hover:scale-105 shadow-md"
                        onClick={() => {
                          const user = localStorage.getItem('user');
                          if (user) {
                            // Sudah login, arahkan ke halaman quiz
                            window.location.href = '/quizzes';
                          } else {
                            // Belum login, arahkan ke halaman login
                            window.location.href = '/login';
                          }
                        }}
                      >
                        Start Quiz
                      </button>

                    </Link>
                  </div>
                  {/* === END PERUBAHAN UTAMA DI SINI === */}
                </div>
              ))
            }
          </div>

          <div className="mt-16 text-center">
            <Link to="/quizzes">
              <button className="px-10 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-bold text-xl transition-colors duration-300 shadow-lg transform hover:scale-105">
                View All Categories
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section: Clear Process Flow */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-white">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="inline-block px-5 py-2 bg-purple-100 text-purple-600 rounded-full text-base font-semibold mb-4 shadow-md">EASY STEPS</span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-7 mt-6 leading-tight">How QuizKi Works for You</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
            Getting started with QuizKi is straightforward. Follow these simple steps to begin your learning journey.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-700 transform -translate-x-1/2 z-0 rounded-full"></div>

          <div className="space-y-28"> {/* Increased spacing between steps */}
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center animate-on-scroll">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-16 text-center md:text-right"> {/* Increased padding */}
                <span className="inline-block text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600 mb-4 drop-shadow-lg">01</span>
                <h3 className="text-3xl font-bold text-white mb-4">Create Your Free Account</h3>
                <p className="text-gray-300 text-lg leading-relaxed">Sign up quickly and effortlessly. Your personalized profile tracks progress and saves all your quiz results.</p>
              </div>
              <div className="md:w-16 relative flex items-center justify-center"> {/* Larger circle */}
                <div className="w-16 h-16 rounded-full bg-blue-600 z-10 flex items-center justify-center border-5 border-gray-900 transition-transform duration-300 hover:scale-110 shadow-lg"> {/* Thicker border */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center animate-on-scroll">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-16"></div>
              <div className="md:w-16 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-600 z-10 flex items-center justify-center border-5 border-gray-900 transition-transform duration-300 hover:scale-110 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16 text-center md:text-left">
                <span className="inline-block text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-4 drop-shadow-lg">02</span>
                <h3 className="text-3xl font-bold text-white mb-4">Discover Your Perfect Quiz</h3>
                <p className="text-gray-300 text-lg leading-relaxed">Browse our vast library and use smart filters to quickly find quizzes tailored to your interests, skill level, and topics.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center animate-on-scroll">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-16 text-center md:text-right">
                <span className="inline-block text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-green-600 mb-4 drop-shadow-lg">03</span>
                <h3 className="text-3xl font-bold text-white mb-4">Engage & Conquer Quizzes</h3>
                <p className="text-gray-300 text-lg leading-relaxed">Challenge yourself with our highly interactive quizzes. Receive instant feedback and detailed explanations for every answer.</p>
              </div>
              <div className="md:w-16 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-600 z-10 flex items-center justify-center border-5 border-gray-900 transition-transform duration-300 hover:scale-110 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16"></div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center animate-on-scroll">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-16"></div>
              <div className="md:w-16 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500 z-10 flex items-center justify-center border-5 border-gray-900 transition-transform duration-300 hover:scale-110 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16 text-center md:text-left">
                <span className="inline-block text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 drop-shadow-lg">04</span>
                <h3 className="text-3xl font-bold text-white mb-4">Earn Rewards & Master Skills</h3>
                <p className="text-gray-300 text-lg leading-relaxed">Unlock achievements, earn unique badges, and climb the global leaderboards. Transform your learning into a rewarding adventure!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section: User Voices */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-block px-5 py-2 bg-teal-100 text-teal-600 rounded-full text-base font-semibold mb-4 shadow-md">TESTIMONIALS</span>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-7 mt-6 leading-tight">What Our Learners Say</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Hear directly from individuals who have boosted their knowledge and confidence with QuizKi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {[
              {
                name: "Jennifer K.",
                role: "High School Teacher",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                text: "QuizKi has revolutionized how I prepare my students for exams. The sheer variety and interactive nature of the quizzes keep them engaged and truly help concepts stick."
              },
              {
                name: "Michael T.",
                role: "University Student",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "My grades have seen a significant improvement since I started using QuizKi. The instant feedback and clear explanations are invaluable for identifying my weak spots."
              },
              {
                name: "Sarah L.",
                role: "Lifelong Learner",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "As someone who thrives on learning new things, QuizKi is my go-to platform. The competitive aspect and reward system genuinely motivate me to keep expanding my horizons!"
              },
              {
                name: "David R.",
                role: "Software Developer",
                image: "https://randomuser.me/api/portraits/men/8.jpg",
                text: "I use QuizKi to sharpen my technical skills. The programming quizzes are challenging yet fair, and the community features are a great way to learn from others."
              },
              {
                name: "Emily C.",
                role: "Parent & Educator",
                image: "https://randomuser.me/api/portraits/women/7.jpg",
                text: "QuizKi makes learning fun for my kids! It's a wonderful tool for supplemental education, and I love that they can track their progress and feel a sense of accomplishment."
              },
              {
                name: "Omar S.",
                role: "History Enthusiast",
                image: "https://randomuser.me/api/portraits/men/15.jpg",
                text: "As a history buff, I'm constantly impressed by the depth and breadth of quizzes available. It's a fantastic way to reinforce what I know and discover new historical facts."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl animate-on-scroll transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-start mb-5">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-5 object-cover border-3 border-blue-500 shadow-md group-hover:border-yellow-400 transition-colors duration-300"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{testimonial.name}</h3>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-5 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Section: Proof of Growth */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-10 md:p-14 shadow-2xl animate-on-scroll border border-blue-700">
            <h2 className="text-4xl font-extrabold text-center mb-12 leading-tight">Join Our Flourishing Community!</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "1000+", label: "Diverse Quizzes", color: "blue" },
                { number: "50K+", label: "Engaged Users", color: "purple" },
                { number: "30+", label: "Dynamic Categories", color: "green" }, // Increased category count
                { number: "4.9/5", label: "Average User Rating", color: "yellow" }
              ].map((stat, index) => (
                <div key={index} className="p-6 bg-gray-800 bg-opacity-60 rounded-2xl transform transition-transform hover:scale-105 shadow-inner border border-gray-700">
                  <p className={`text-6xl font-extrabold text-${stat.color}-400 mb-3 drop-shadow-lg`}>{stat.number}</p>
                  <p className="text-gray-300 text-lg font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section: Clarity and Accessibility */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="inline-block px-5 py-2 bg-orange-100 text-orange-600 rounded-full text-base font-semibold mb-4 shadow-md">COMMON QUESTIONS</span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-7 mt-6 leading-tight">Frequently Asked Questions</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
            Quick answers to the most common inquiries about QuizKi and its features.
          </p>
        </div>

        <div className="space-y-6"> {/* Increased spacing between FAQs */}
          {[
            {
              question: "Is QuizKi completely free?",
              answer: "QuizKi offers a robust free tier providing access to hundreds of quizzes and basic progress tracking. For advanced analytics, an ad-free experience, and exclusive content, consider our premium subscription."
            },
            {
              question: "How are the quizzes created and verified?",
              answer: "Our quizzes are meticulously crafted by a dedicated team of subject matter experts and seasoned educators. Every piece of content undergoes a rigorous multi-stage review process to ensure absolute accuracy and the highest quality."
            },
            {
              question: "Can I create and share my own quizzes?",
              answer: "Absolutely! Premium users gain access to our intuitive quiz builder tool, enabling them to create highly engaging and interactive custom quizzes for personal learning or to share with the QuizKi community. Share your knowledge!"
            },
            {
              question: "How does the scoring and ranking system work?",
              answer: "Scores are precisely calculated based on correct answers, response speed, and consistency. Bonus points are awarded for answering streaks and completing quizzes efficiently, influencing your position on our dynamic leaderboards."
            },
            {
              question: "Is QuizKi suitable for educational institutions?",
              answer: "Definitely! Many teachers and educational organizations successfully integrate QuizKi into their curricula to supplement teaching materials and foster interactive learning. We also provide specialized educational packages tailored for schools and institutions."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 animate-on-scroll overflow-hidden shadow-lg group">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer select-none">
                  <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                  <span className="text-gray-400 transform transition-transform duration-300 group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-300 bg-gray-700 bg-opacity-40 transition-all duration-300 ease-in-out group-open:py-4 border-t border-gray-700"> {/* Added border-t */}
                  <p className="text-lg leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section: Direct Engagement */}
      <div className="max-w-7xl mx-auto px-6 py-16 animate-on-scroll">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 md:p-14 border border-gray-700 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">Stay Connected & Updated!</h2>
            <p className="text-gray-300 max-w-3xl mx-auto text-xl leading-relaxed">
              Subscribe to our exclusive newsletter for timely updates on new quiz releases, exciting features, community challenges, and special events.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="mb-0 flex-grow">
                <input
                  type="email"
                  id="email-subscription"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-5 py-4 border rounded-xl shadow-inner text-lg
                  focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:placeholder-gray-300 transition-colors duration-200"
                />
              </div>
              <button
                className="py-4 px-8 bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                onClick={handleSubscribe}
              >
                Subscribe Now
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Your privacy is paramount. You can unsubscribe effortlessly at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl text-center border border-gray-700 transform scale-95 animate-scale-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto mb-6 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-3xl font-bold text-white mb-4">You're All Set!</h3>
            <p className="text-gray-300 text-lg">Thank you for subscribing! Get ready for fresh quizzes and exciting updates.</p>
          </div>
        </div>
      )}

      {/* Final Call To Action: Reinforce Value */}
      <div className="text-center py-20 animate-on-scroll">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-9 leading-tight">
            Ready to Elevate Your <span className="text-yellow-400">Knowledge</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our vibrant community of thousands of learners and begin expanding your horizons today with QuizKi's dynamic and interactive quizzes!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register">
              <button className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-xl shadow-lg transition-colors duration-300 transform hover:scale-105">
                Create My Free Account
              </button>
            </Link>
            <Link to="/quizzes">
              <button className="px-12 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-bold text-xl transition-colors duration-300 shadow-lg transform hover:scale-105">
                Explore All Quizzes
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global CSS for animations and custom styles */}
      <style jsx>{`
        /* Keyframe for a more subtle and continuous pulse effect */
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        /* Fade-in effect for elements on scroll */
        .animate-fade-in {
          animation: fadeIn 1s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(25px); } /* Slightly larger initial translateY */
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scale-in effect for modals */
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.85); } /* Starts smaller for more impact */
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;