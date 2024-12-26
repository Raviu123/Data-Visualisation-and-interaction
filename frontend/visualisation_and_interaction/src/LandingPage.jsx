import React from "react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          DataVizAI
        </div>
        <div className="flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-blue-400 cursor-pointer">
            Features
          </a>
          <a href="#about" className="text-white hover:text-blue-400 cursor-pointer">
            About
          </a>
          <button className="px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors font-medium">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="text-center px-6 py-20 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Transform Your Data into
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            {" "}Insights
          </span>
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Upload your data and generate beautiful visualizations instantly.
        </p>
        <button className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-lg font-medium">
          Try Demo
        </button>

      </main>
    </div>
  );
};

export default LandingPage;
