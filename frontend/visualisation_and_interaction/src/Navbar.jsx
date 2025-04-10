import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [loginform, setLoginform] = useState(false);
  const [logintype, setLogintype] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userbtntext, setUserbtntext] = useState("A");
  const [isloggedin, setIsloggedin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if a user is logged in on page load
  useEffect(() => {
    const userToken = Cookies.get("userToken");
    const userEmail = Cookies.get("userEmail");
    if (userToken && userEmail) {
      setUserbtntext(userEmail.charAt(0).toUpperCase());
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
    }
  }, []);

  const toggleloginBox = () => {
    setLoginform((prev) => !prev);
  };

  const toggleFormType = () => {
    setLogintype((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (logintype) {
      // Handle login
      try {
        const response = await axios.post("http://localhost:5000/user/signin", {
          email,
          password,
        });
        alert(response.data.message);

        // Store user token and email in cookies
        Cookies.set("userToken", response.data.token, { expires: 7 });
        Cookies.set("userEmail", email, { expires: 7 });
        Cookies.set("userId", response.data.user_id, { expires: 7 });
        sessionStorage.clear();
        setUserbtntext(email.charAt(0).toUpperCase());
        setLoginform(false); // Close modal
        setIsloggedin(true);
        window.location.reload();
      } catch (error) {
        alert(error.response?.data?.message || "Login failed");
      }
    } else {
      // Handle signup
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      try {
        const response = await axios.post("http://localhost:5000/user/signup", {
          email,
          password,
        });
        alert(response.data.message);

        // Store user token and email in cookies
        Cookies.set("userToken", response.data.token, { expires: 7 });
        Cookies.set("userEmail", email, { expires: 7 });
        Cookies.set("userId", response.data.user_id, { expires: 7 });
        sessionStorage.clear();
        setUserbtntext(email.charAt(0).toUpperCase());
        setLoginform(false);
        setIsloggedin(true);
        window.location.reload();
      } catch (error) {
        alert(error.response?.data?.message || "Signup failed");
      }
    }
  };

  const handleLogout = () => {
    // Clear all chart-related session storage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('chartConfigs_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear cookies
    Cookies.remove("userToken");
    Cookies.remove("userEmail");
    Cookies.remove("userId");
    
    // Clear any remaining session storage
    sessionStorage.clear();
    
    setUserbtntext("A");
    setIsloggedin(false);
    alert("Logged out successfully");
    window.location.reload();
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-800 to-blue-950 shadow-lg">
        <div className="flex justify-between items-center h-16 px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide transform transition duration-300 hover:scale-105">
            DataVisAI
          </h1>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center text-white text-lg gap-3">
            {!isloggedin && (
              <>
                <Link to="/home" className="text-gray-400 hover:text-white mr-8">
                  Home
                </Link>
                <Link to="/chat" className="text-gray-400 hover:text-white mr-8">
                  Chat
                </Link>
                <Link to="/report" className="text-gray-400 hover:text-white mr-8">
                  Reports
                </Link>
              </>
            )}
            <div
              onClick={toggleloginBox}
              className="bg-white h-10 w-10 rounded-full flex justify-center items-center shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
            >
              <button className="text-sm font-semibold text-blue-950 hover:text-blue-600">
                {userbtntext}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-blue-900`}>
          {!isloggedin && (
            <div className="px-4 pt-2 pb-3 space-y-2">
              <Link
                to="/home"
                className="block text-gray-300 hover:text-white hover:bg-blue-800 px-3 py-2 rounded-md text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/chat"
                className="block text-gray-300 hover:text-white hover:bg-blue-800 px-3 py-2 rounded-md text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chat
              </Link>
              <Link
                to="/report"
                className="block text-gray-300 hover:text-white hover:bg-blue-800 px-3 py-2 rounded-md text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reports
              </Link>
            </div>
          )}
          <div className="px-4 py-3 border-t border-blue-800">
            <div
              onClick={() => {
                toggleloginBox();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center"
            >
              <div className="bg-white h-8 w-8 rounded-full flex justify-center items-center">
                <span className="text-sm font-semibold text-blue-950">{userbtntext}</span>
              </div>
              <span className="ml-3 text-white text-sm">{isloggedin ? 'Account' : 'Login/Signup'}</span>
            </div>
          </div>
        </div>
      </div>

      {loginform && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 backdrop-blur-lg bg-black bg-opacity-50 z-40"
            onClick={toggleloginBox}
          ></div>

          {/* Form Box */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-96 p-6">
            {isloggedin ? (
              // If user is logged in, display their credentials and a logout button
              <div>
                <h1 className="font-bold text-lg mb-4">User Details</h1>
                <p className="mb-4 text-gray-700">
                  Logged in as: {Cookies.get("userEmail")}
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              // If not logged in, show the login/signup form
              <>
                <h1 className="font-bold text-lg mb-4">
                  {logintype ? "Sign In" : "Sign Up"}
                </h1>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email:
                    <input
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">
                    Password:
                    <input
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </label>

                  {/* Show confirm password field for Sign Up */}
                  {!logintype && (
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mt-4">
                      Confirm Password:
                      <input
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="password"
                        name="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </label>
                  )}

                  <button
                    type="submit"
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {logintype ? "Login" : "Sign Up"}
                  </button>
                </form>
                <p className="mt-4 text-center">
                  {logintype ? "Don't have an account? " : "Already have an account? "}
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={toggleFormType}
                  >
                    {logintype ? "Sign Up" : "Sign In"}
                  </span>
                </p>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;