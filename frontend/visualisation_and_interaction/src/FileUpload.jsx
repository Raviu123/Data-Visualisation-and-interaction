import React from 'react'
import { useState,useEffect } from 'react'
import axios from 'axios';

const FileUpload = ({ onGenerateCharts }) => {

    const [file, setFile] = useState(null);
    const[uploadedFileName, setUploadedFileName] = useState(null) //to dynamically render a button to generate the visualisations,

    const handleDragOver = (event)=>{
        event.preventDefault();
    }

    const handleDrop = (event)=>{
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const droppedFile = event.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
              setFile(droppedFile);
            } else {
              alert('Invalid file type. Please upload a .csv or .xlsx file.');
            }
        }
    }

    const handleUpload =async ()=>{
        if(!file){
            console.log("No file selected");
            return;
        }

        const formData =  new FormData();
        formData.append("file",file);

        try{
            const response = await axios.post('http://localhost:5000/upload/files', formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            }); 

            if(response.data.success){
                setUploadedFileName(response.data.filename)//set the uploaded filename
                console.log("File uploaded:",response.data.filename);
            }
        }
        catch(error){
            console.log(error);
        }

    }

    const handleGenerateCharts = () => {
        if (uploadedFileName) {
            onGenerateCharts(uploadedFileName);
        }
    };

    
  return (
    <div className='flex flex-col justify-center items-center text-center h-screen bg-blue-950 text-white font-bold'>
        <div className='border-2 border-dotted overflow-hidden rounded p-10 w-80 h-60 hover:bg-sky-900' onDragOver={handleDragOver} onDrop={handleDrop}>
            <h1 className='mt-5'>Drag and Drop</h1>
            <h1>or</h1>
            <input type="file" accept=".csv, .xlsx" className='overflow-hidden' onChange={(e)=>{ setFile(e.target.files[0])}}/>
        </div>
        <button className=' w-80 rounded p-3 border-2 border-white hover:bg-blue-700' onClick={handleUpload}>Upload</button>
        {uploadedFileName && (
            <button className='mt-5 w-80 rounded p-3 border-2 border-white hover:bg-green-700' onClick={handleGenerateCharts}>Generate Charts</button>
        )}
    </div>
  )
}

export default FileUpload