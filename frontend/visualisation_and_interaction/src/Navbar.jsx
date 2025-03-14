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
    Cookies.remove("userToken");
    Cookies.remove("userEmail");
    Cookies.remove("userId");
    sessionStorage.clear();
    setUserbtntext("A");
    setIsloggedin(false);
    alert("Logged out successfully");
    window.location.reload();
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-gradient-to-r from-blue-800 to-blue-950 h-16 px-6 py-4 shadow-lg">
        <h1 className="text-3xl font-extrabold text-white tracking-wide transform transition duration-300 hover:scale-105">
          DataVisAI
        </h1>
        <div className="flex items-center text-white text-lg gap-3">
          {/* Show navigation links only when NOT logged in */}
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