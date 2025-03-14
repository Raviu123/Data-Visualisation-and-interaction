import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { format } from 'date-fns';

const FileUpload = ({ onGenerateCharts }) => {
  const [file, setFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chat', { state: { uploadedFileId, filename: file.name } });
  };

  useEffect(() => {
    const fetchUserFiles = async () => {
      const userId = Cookies.get('userId');
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/upload/user-files/${userId}`);
        setUserFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching user files:', error);
        setError('Failed to load user files');
      }
    };

    fetchUserFiles();
  }, []);

  const validateFile = (file) => {
    const validTypes = ['.csv', '.xlsx'];
    return validTypes.some(type => file.name.toLowerCase().endsWith(type));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setError('');

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setError('Please upload a .csv or .xlsx file');
      }
    }
  };

  const handleFileChange = (event) => {
    setError('');
    const selectedFile = event.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    } else if (selectedFile) {
      setError('Please upload a .csv or .xlsx file');
    }
  };

  const handleUpload = async () => {
    // Check if the user is logged in
    const userId = Cookies.get('userId');
    if (!userId) {
      alert('Please log in to upload files.');
      return;
    }

    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:5000/upload/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'user-id': userId 
        },
        maxContentLength: 20 * 1024 * 1024,
        maxBodyLength: 20 * 1024 * 1024
      });

      if (response.data.success) {
        setUploadedFileId(response.data.file_id);
        setIsUploading(false);
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (fileId) => {
    setUploadedFileId(fileId);
    onGenerateCharts(fileId);
  };

  return (
    <div className=" overflow-y-auto h-screen bg-gray-900 text-gray-100 p-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Upload Section */}
        <div className="flex flex-col items-center space-y-6">
          <div
            className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 
              ${file ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-blue-500'} 
              transition-colors duration-200 cursor-pointer`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-lg font-medium">Drag and drop your file here</p>
                <p className="text-sm text-gray-400">or</p>
                <label className="mt-2 inline-block">
                  <span className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <div className="flex items-center space-x-2 text-green-400">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full max-w-md py-3 rounded-md font-medium transition-colors duration-200
              ${!file || isUploading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>

          {uploadedFileId && (
            <button
              onClick={() => onGenerateCharts(uploadedFileId)}
              className="w-full max-w-md py-3 rounded-md bg-green-600 hover:bg-green-700 font-medium transition-colors duration-200"
            >
              Generate Charts
            </button>
          )}
        </div>

        {/* Chat with AI Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleChatClick}
            className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-200"
          >
            Chat with AI
          </button>
        </div>

        {/* History Section */}
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">User Uploads</h2>
          <div className="space-y-3">
            {userFiles.length > 0 ? (
              userFiles.map((file, index) => (
                <div
                  key={file.file_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-gray-400">{file.uploaded_at}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFileSelect(file.file_id)}
                      className="p-2 hover:bg-gray-600 rounded-md transition-colors duration-200 text-blue-400 hover:text-blue-300"
                      title="Generate Charts"
                    >
                      Charts
                    </button>
                    <button
                      onClick={() => navigate('/chat', { 
                        state: { 
                          uploadedFileId: file.file_id, 
                          filename: file.filename 
                        } 
                      })}
                      className="p-2 hover:bg-gray-600 rounded-md transition-colors duration-200 text-green-400 hover:text-green-300"
                      title="Chat with AI"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No uploaded files yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;