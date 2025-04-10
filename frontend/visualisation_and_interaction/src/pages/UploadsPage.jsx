import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../Navbar';

const UploadsPage = () => {
  const [userFiles, setUserFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFiles = async () => {
      const userId = Cookies.get('userId');
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/upload/user-files/${userId}`);
        setUserFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching user files:', error);
        setError('Failed to load user files');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFiles();
  }, [navigate]);

  const handleFileSelect = (fileId, filename) => {
    navigate('/home', { state: { fileId, filename } });
  };

  const handleChatClick = (fileId, filename) => {
    navigate('/chat', { state: { uploadedFileId: fileId, filename } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Your Uploads</h1>
        
        {error && (
          <div className="text-red-400 mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {userFiles.length > 0 ? (
            userFiles.map((file) => (
              <div
                key={file.file_id}
                className="flex justify-between items-start p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">{file.filename}</p>
                    <p className="text-sm text-gray-400">{file.uploaded_at}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFileSelect(file.file_id, file.filename)}
                    className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Charts
                  </button>
                  <button
                    onClick={() => handleChatClick(file.file_id, file.filename)}
                    className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 col-span-2">
              <p>No uploaded files yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadsPage;