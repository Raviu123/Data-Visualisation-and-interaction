import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DynamicCharts from './DynamicCharts'
import LandingPage from './LandingPage'
import FileUpload from './FileUpload'
import './App.css'
import './index.css';

function App() {
  const [count, setCount] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState(null);

    const handleGenerateCharts = (filename) => {
        setUploadedFileName(filename);
    };

  return (
    <>
      <div className="flex h-full bg-blue-950">
        <div className='w-1/5 border-r-2'>
          <FileUpload onGenerateCharts={handleGenerateCharts}></FileUpload>
        </div>
        <div className="w-4/5">
          <DynamicCharts uploadedFileName={uploadedFileName}/>
        </div>
      </div>
      
    </>
  )
}

export default App
