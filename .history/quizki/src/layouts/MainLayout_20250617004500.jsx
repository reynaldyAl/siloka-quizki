<<<<<<< HEAD
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar/Navbar';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Tambahkan pt-16 atau pt-20 di sini untuk padding-top yang lebih besar */}
      <main className="flex-grow pt-16"> {/* pt-16 = 64px padding, sesuai tinggi navbar */}
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-800 py-4 text-center text-gray-400">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} QuizKi. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
=======
// layouts/MainLayout.jsx - Main application layout with navbar
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a
