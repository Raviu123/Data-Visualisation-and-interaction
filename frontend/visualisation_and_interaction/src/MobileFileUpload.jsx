import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const MobileFileUpload = ({ onGenerateCharts, uploadedFileId: initialUploadedFileId, onViewAllUploads }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recentFile, setRecentFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(initialUploadedFileId);
  const navigate = useNavigate();

  // Fetch most recent file on component mount
  useEffect(() => {
    const fetchRecentFile = async () => {
      const userId = Cookies.get('userId');
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/upload/user-files/${userId}?limit=1`);
        if (response.data.files && response.data.files.length > 0) {
          setRecentFile(response.data.files[0]);
        }
      } catch (error) {
        console.error('Error fetching recent file:', error);
      }
    };

    fetchRecentFile();
  }, [uploadedFileId]);

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
        const newFileId = response.data.file_id;
        setUploadedFileId(newFileId);
        onGenerateCharts(newFileId);
        setIsUploading(false);
        setFile(null); // Reset file after successful upload
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleChatClick = (fileId, filename) => {
    navigate('/chat', { state: { uploadedFileId: fileId, filename } });
  };

  return (
    <div className="w-full text-gray-100">
      {/* Upload Section - Optimized for mobile */}
      <div className="mb-6">
        <div
          className={`w-full border-2 border-dashed rounded-lg p-4
            ${file ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-blue-500'} 
            transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="text-base font-medium">Drop your file here</p>
              <label className="mt-2 inline-block">
                <span className="px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors">
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
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-full">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-2 text-base rounded-md font-medium transition-colors mt-3
            ${!file || isUploading 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isUploading ? 'Uploading...' : 'Upload & Generate Charts'}
        </button>
      </div>

      {/* Recent Upload - Mobile optimized */}
      <div className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Recent Upload</h2>
          <button 
            onClick={onViewAllUploads}
            className="text-blue-400 flex items-center text-sm"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {recentFile ? (
          <div className="flex flex-col space-y-2 p-3 rounded-lg bg-gray-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{recentFile.filename}</p>
                <p className="text-xs text-gray-400">{recentFile.uploaded_at}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => onGenerateCharts(recentFile.file_id)}
                className="flex-1 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 font-medium transition-colors"
              >
                Charts
              </button>
              <button
                onClick={() => handleChatClick(recentFile.file_id, recentFile.filename)}
                className="flex-1 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
              >
                Chat
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            <p className="text-sm">No uploaded files yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFileUpload;