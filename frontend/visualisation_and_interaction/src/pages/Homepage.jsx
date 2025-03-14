import { useState, useEffect } from 'react';
import { KeepAlive } from 'react-activation';
import DynamicCharts from '../DynamicCharts';
import FileUpload from '../FileUpload';
import Navbar from '../Navbar';
import { useLocation } from 'react-router-dom';
import '../App.css';
import '../index.css';

function Homepage() {
  const [uploadedFileId, setUploadedFileId] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fileIdParam = params.get('file_id');

    


    if (fileIdParam && fileIdParam !== uploadedFileId) {
      setUploadedFileId(fileIdParam);
     
    }
    setIsLoading(false);
  }, [location]);

  const handleGenerateCharts = (file_id) => {
    if (uploadedFileId) {
      sessionStorage.removeItem(`chartConfigs_${uploadedFileId}`);
    }
    setUploadedFileId(file_id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <div className="w-1/5 border-r-2 border-gray-800">
          <FileUpload 
            onGenerateCharts={handleGenerateCharts} 
            uploadedFileId={uploadedFileId} 
          />
        </div>
        <div className="w-4/5">
          {uploadedFileId ? (
            <DynamicCharts uploadedFileId={uploadedFileId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Upload a file to generate charts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;