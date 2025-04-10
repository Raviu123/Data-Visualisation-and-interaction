import { useState, useEffect } from 'react';
import DynamicCharts from '../DynamicCharts';
import FileUpload from '../FileUpload';
import Navbar from '../Navbar';
import MobileFileUpload from '../MobileFileUpload';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import '../index.css';

function Homepage() {
  const [uploadedFileId, setUploadedFileId] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fileIdParam = params.get('file_id');

    if (fileIdParam && fileIdParam !== uploadedFileId) {
      setUploadedFileId(fileIdParam);
    }
    setIsLoading(false);
  }, [location, uploadedFileId]);

  const handleGenerateCharts = (file_id) => {
    if (uploadedFileId) {
      sessionStorage.removeItem(`chartConfigs_${uploadedFileId}`);
    }
    setUploadedFileId(file_id);
  };

  const handleViewAllUploads = () => {
    navigate('/uploads');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {isMobile ? (
        // Mobile Layout
        <div className="flex flex-col min-h-screen pt-16">
          {/* Mobile File Upload Component */}
          <div className="px-4 py-6 border-b border-gray-800">
            <MobileFileUpload 
              onGenerateCharts={handleGenerateCharts} 
              uploadedFileId={uploadedFileId} 
              onViewAllUploads={handleViewAllUploads}
            />
          </div>
          
          {/* Charts Section */}
          <div className="flex-1 p-4">
            {uploadedFileId ? (
              <DynamicCharts uploadedFileId={uploadedFileId} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-center p-4">
                <p className="text-lg">Upload a file to generate charts</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Desktop Layout - Keep original layout
        <div className="flex flex-row min-h-screen pt-16">
          <div className="w-1/5 border-r-2 border-gray-800 overflow-y-auto">
            <FileUpload 
              onGenerateCharts={handleGenerateCharts} 
              uploadedFileId={uploadedFileId} 
            />
          </div>
          <div className="w-4/5 p-4">
            {uploadedFileId ? (
              <DynamicCharts uploadedFileId={uploadedFileId} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Upload a file to generate charts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;