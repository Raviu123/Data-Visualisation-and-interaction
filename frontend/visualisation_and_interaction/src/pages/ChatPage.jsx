import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatPage = () => {
  const location = useLocation();
  const { uploadedFileId, filename } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tableData, setTableData] = useState([]);
  const [viewMode, setViewMode] = useState("chat"); // For mobile: "chat" or "data"

  useEffect(() => {
    const datatable = async () => {
      try {
        const response = await axios.post("http://localhost:5000/insights/datatable", {
          data_id: uploadedFileId,
        }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
        setTableData(response.data.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (uploadedFileId) {
      datatable();
    }

    const savedMessages = localStorage.getItem(`chatMessages_${uploadedFileId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [uploadedFileId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { message: input, sender: "user" };
    setMessages([...messages, newMessage]);
    
    // On mobile, switch to chat view after sending a message
    setViewMode("chat");

    try {
      const response = await axios.post("http://localhost:5000/insights/chat", {
        data_id: uploadedFileId,
        message: input,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });
      console.log(response.data); 
      const data = response.data;
      let aiResponse;
      if (data.type === "text") {
        aiResponse = { message: data.content, sender: "ai" };
      } else if (data.type === "table") {
        aiResponse = { message: "Received a table response. Rendering...", sender: "ai", tableData: data.data };
      } else if (data.type === "chart") {
        aiResponse = { message: "Generated a chart. See below:", sender: "ai", imageUrl: data.image_url };
      } else if (data.type === "number") {
        aiResponse = { message: data.content.toString(), sender: "ai" };
      } else {
        aiResponse = { message: data.content, sender: "ai" };
      }
      setMessages((prev) => {
        const updatedMessages = [...prev, aiResponse];
        localStorage.setItem(`chatMessages_${uploadedFileId}`, JSON.stringify(updatedMessages)); // Save to localStorage
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message", error);
      setMessages((prev) => [...prev, { message: "Error processing request.", sender: "ai" }]);
    }
    setInput("");
  };

  // Shared table component for consistent styling
  const TableComponent = ({ data }) => (
    <div className="bg-gray-850 rounded-lg shadow-md shadow-slate-800 overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-800">
          <tr>
            {Object.keys(data[0] || {}).map((key, idx) => (
              <th key={idx} className="px-3 py-2 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-600">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
              {Object.values(row).map((value, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-sm text-gray-300">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Tab Control Component
  const MobileTabControl = () => (
    <div className="flex w-full bg-gray-700 rounded-t-lg mb-2 lg:hidden">
      <button 
        onClick={() => setViewMode("data")}
        className={`flex-1 py-3 text-center text-sm font-medium ${
          viewMode === "data" 
            ? "bg-gray-800 text-white" 
            : "bg-gray-700 text-gray-300"
        } rounded-tl-lg transition-colors`}
      >
        Data View
      </button>
      <button 
        onClick={() => setViewMode("chat")}
        className={`flex-1 py-3 text-center text-sm font-medium ${
          viewMode === "chat" 
            ? "bg-gray-800 text-white" 
            : "bg-gray-700 text-gray-300"
        } rounded-tr-lg transition-colors`}
      >
        Chat Assistant
      </button>
    </div>
  );

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden'>
        <Navbar />
        {/* Back Button - Fixed position for both mobile and desktop */}
        <div className="fixed top-20 left-4 z-10">
          <Link 
            to={`/home${uploadedFileId ? `?file_id=${uploadedFileId}` : ''}`}
            className="bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Charts
          </Link>
        </div>

        {/* Main content area with responsive layout */}
        <div className="flex flex-col lg:flex-row h-screen pt-24 px-2 sm:p-4 lg:gap-4 lg:pt-28">
          {/* Mobile Mode Tabs */}
          <MobileTabControl />

          {/* Table Display Section */}
          <div className={`w-full lg:w-1/2 bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col mb-3 
            ${viewMode === "data" || window.innerWidth >= 1024 ? "block" : "hidden lg:block"}`}>
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">{filename}</h2>
              <p className="text-gray-400 text-xs mt-1">First 100 rows of your data</p>
            </div>
            <div className="p-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxHeight: "calc(100vh - 240px)" }}>
              <div className="overflow-x-auto">
                {tableData.length > 0 ? (
                  <TableComponent data={tableData} />
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>Loading table data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className={`w-full lg:w-1/2 bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col
            ${viewMode === "chat" || window.innerWidth >= 1024 ? "block" : "hidden lg:block"}`}>
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Chat Assistant</h2>
              <p className="text-gray-400 text-xs mt-1">Ask questions about your data</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: "calc(100vh - 240px)" }}>
              {messages.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <p>No messages yet. Start by asking a question about your data.</p>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div key={index} 
                  className={`chat-message ${
                    msg.sender === "user" 
                      ? "ml-auto bg-blue-600 text-white rounded-2xl rounded-tr-sm p-2.5 max-w-[85%] shadow-lg" 
                      : "mr-auto bg-gray-700 text-gray-100 rounded-2xl rounded-tl-sm p-2.5 max-w-[85%] shadow-lg"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.message}</p>

                  {msg.tableData && (
                    <div className="mt-3 overflow-x-auto">
                      <TableComponent data={msg.tableData} />
                    </div>
                  )}

                  {msg.imageUrl && (
                    <div className="mt-3 bg-gray-750 rounded-lg p-1">
                      <img src={msg.imageUrl} alt="Generated Chart" className="w-full h-auto rounded" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-2.5 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
                <button 
                  type="submit" 
                  className="p-2.5 bg-blue-600 rounded-xl hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;