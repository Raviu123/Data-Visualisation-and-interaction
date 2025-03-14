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
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          DataVizAI
        </div>
        <div className="flex items-center space-x-8">
          {/* Add any additional navigation items here */}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="text-center px-6 py-20">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Transform Your Data into
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            {" "}Insights
          </span>
        </h1>
        
        <button 
          onClick={handleGetStarted}
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-lg font-medium"
        >
          Get Started
        </button>
        <div>
          <p className="pt-6 text-lg font-bold text-gray-300 mb-8">
            Upload your data and instantly generate stunning visualizations, perform AI-powered data analysis, create reports, and download charts—all your data analysis needs in one place.
          </p>
        </div>
        
        <div className="flex justify-center items-center gap-10">
          <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold">Home Page</h3>
            <img src={home} alt="homepage" className="w-[450px]  object-cover rounded-lg shadow-lg" />
            
          </div>
          <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold">Chat Page</h3>
            <img src={chat} alt="chatpage" className="w-[450px] object-cover rounded-lg shadow-lg" />
            
          </div>
          <div className="text-center">
            <h3 className=" mb-4 text-xl font-semibold">Report Page</h3>
            <img src={report} alt="reportpage" className="w-[450px] object-cover rounded-lg shadow-lg" />
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;