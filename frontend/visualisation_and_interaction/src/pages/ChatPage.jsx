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
    <div className="bg-gray-850 rounded-lg shadow-md shadow-slate-800">
      <table className="w-full table-auto">
        <thead className="bg-gray-800">
          <tr>
            {Object.keys(data[0] || {}).map((key, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-600">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
              {Object.values(row).map((value, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 text-sm text-gray-300">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden'>
        <Navbar />
        {/* Add Back Button */}
        <div className="fixed top-20 left-4 z-10">
          <Link 
            to={`/home${uploadedFileId ? `?file_id=${uploadedFileId}` : ''}`}
            className="bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Charts
          </Link>
        </div>
        {/* Rest of the chat page content */}
        <div className="flex h-screen overflow-hidden p-4 gap-4">
          {/* Table Display Section */}
          <div className="mt-16 w-1/2 bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col">
            <div className="bg-gray-800 p-6 border-b border-gray-700">
              <h2 className="text-2xl mt-2 font-bold text-white">{filename}</h2>
              <p className="text-gray-400 text-sm mt-1">First 100 rows of your data</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {tableData.length > 0 ? (
                <TableComponent data={tableData} />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Loading table data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="mt-16 w-1/2 bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col">
            <div className="bg-gray-800 p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Chat Assistant</h2>
              <p className="text-gray-400 text-sm mt-1">Ask questions about your data</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => (
                <div key={index} 
                  className={`chat-message ${
                    msg.sender === "user" 
                      ? "ml-auto bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-xs shadow-lg" 
                      : "mr-auto bg-gray-700 text-gray-100 rounded-2xl rounded-tl-sm p-4 w-fit shadow-lg"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>

                  {msg.tableData && (
                    <div className="mt-4">
                      <TableComponent data={msg.tableData} />
                    </div>
                  )}

                  {msg.imageUrl && (
                    <div className="mt-4 bg-gray-750 rounded-lg p-2">
                      <img src={msg.imageUrl} alt="Generated Chart" 
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-800 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-4 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  type="submit" 
                  className="p-4 bg-blue-600 rounded-xl hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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