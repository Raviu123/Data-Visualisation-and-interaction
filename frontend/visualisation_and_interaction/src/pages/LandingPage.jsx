import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import home from '../assets/img/home.png';
import report from '../assets/img/report.png';
import chat from '../assets/img/chat.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/home', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-6">
        <div className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          DataVizAI
        </div>
      </nav>

      {/* Hero Section */}
      <main className="text-center px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
          Transform Your Data into
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            {" "}Insights
          </span>
        </h1>
        
        <button 
          onClick={handleGetStarted}
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-base sm:text-lg font-medium"
        >
          Get Started
        </button>
        
        <div className="max-w-3xl mx-auto">
          <p className="pt-6 text-base sm:text-lg font-bold text-gray-300 mb-8">
            Upload your data and instantly generate stunning visualizations, perform AI-powered data analysis, create reports, and download charts—all your data analysis needs in one place.
          </p>
        </div>
        
        {/* Feature Preview Grid */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 mt-8 px-4">
          <div className="text-center max-w-sm">
            <h3 className="mb-4 text-lg sm:text-xl font-semibold">Home Page</h3>
            <img 
              src={home} 
              alt="homepage" 
              className="w-full max-w-[450px] h-auto object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105"
            />
          </div>
          
          <div className="text-center max-w-sm">
            <h3 className="mb-4 text-lg sm:text-xl font-semibold">Chat Page</h3>
            <img 
              src={chat} 
              alt="chatpage" 
              className="w-full max-w-[450px] h-auto object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105"
            />
          </div>
          
          <div className="text-center max-w-sm">
            <h3 className="mb-4 text-lg sm:text-xl font-semibold">Report Page</h3>
            <img 
              src={report} 
              alt="reportpage" 
              className="w-full max-w-[450px] h-auto object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;