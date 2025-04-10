import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportPage = () => {
  const location = useLocation();
  const { chartImages, fileId } = location.state || {};
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [reportContent, setReportContent] = useState([]);
  const reportRef = useRef(null);
  
  // Load report content from localStorage on component mount
  useEffect(() => {
    const savedReportContent = localStorage.getItem(`report_content_${fileId}`);
    if (savedReportContent) {
      setReportContent(JSON.parse(savedReportContent));
    }
  }, [fileId]);
  
  // Save report content to localStorage whenever it changes
  useEffect(() => {
    if (reportContent.length > 0 && fileId) {
      localStorage.setItem(`report_content_${fileId}`, JSON.stringify(reportContent));
    }
  }, [reportContent, fileId]);

  // Clear report content if fileId changes (new data loaded)
  useEffect(() => {
    if (fileId) {
      const previousFileId = localStorage.getItem('current_file_id');
      if (previousFileId && previousFileId !== fileId) {
        setReportContent([]);
        localStorage.removeItem(`report_content_${previousFileId}`);
      }
      localStorage.setItem('current_file_id', fileId);
    }
  }, [fileId]);

  useEffect(() => {
    if (chartImages) {
      console.log('Received chartImages:', chartImages);
    }
  }, [chartImages]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const chartImage = JSON.parse(e.dataTransfer.getData('chartImage'));
    const chartIndex = e.dataTransfer.getData('chartIndex');
    setSelectedCharts((prev) => [...prev, { chartImage, chartIndex }]);
  };

  const handleChartDragStart = (chartImage, index) => (e) => {
    e.dataTransfer.setData('chartImage', JSON.stringify(chartImage));
    e.dataTransfer.setData('chartIndex', index);
  };

  const handleGenerate = async () => {
    if (selectedCharts.length === 0) {
      setError("Please drag and drop at least one chart first");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        'http://localhost:5000/report/generate',
        { images: selectedCharts.map(({ chartImage }) => chartImage.imageUrl) },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAnalysisResult(response.data.analysis);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    if (!analysisResult) {
      setError("Please generate analysis first");
      return;
    }
    const newItems = selectedCharts.map((chart, index) => ({
      chart: chart.chartImage,
      analysis: analysisResult[index],
    }));
    setReportContent((prev) => [...prev, ...newItems]);
    setSelectedCharts([]);
    setAnalysisResult(null);
    setError(null);
  };

  const handleDownload = () => {
    if (reportContent.length === 0) {
      setError("No content to download. Please add content to your report first.");
      return;
    }

    const input = reportRef.current;
    
    // Apply print-specific styling
    const originalStyle = input.style.cssText;
    
    // Set styles for PDF generation
    input.style.backgroundColor = "white";
    input.style.color = "black";
    input.style.padding = "20px";
    input.style.width = "210mm"; // A4 width
    input.style.height = "auto";
    input.style.overflow = "visible";
    
    // Create a clone for printing
    const reportTitle = document.createElement('h1');
    reportTitle.textContent = 'Data Analysis Report';
    reportTitle.style.textAlign = 'center';
    reportTitle.style.marginBottom = '20px';
    reportTitle.style.color = 'black';
    reportTitle.style.fontSize = '24px';
    
    // Clone the content for PDF generation
    const clone = input.cloneNode(true);
    clone.prepend(reportTitle);
    
    // Set body background to white for screenshots
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'white';
    
    // Append clone to body temporarily
    document.body.appendChild(clone);
    
    html2canvas(clone, { 
      scale: 2,
      backgroundColor: 'white',
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      // Remove clone and restore styles
      document.body.removeChild(clone);
      document.body.style.backgroundColor = originalBodyBg;
      input.style.cssText = originalStyle;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, 1.0);
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight * ratio / pdfHeight);
      
      for (let page = 0; page < totalPages; page++) {
        // Add a new page for pages after the first one
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate which portion of the image to use for this page
        const sourceY = page * pdfHeight / ratio;
        const sourceHeight = Math.min(pdfHeight / ratio, imgHeight - sourceY);
        
        pdf.addImage(
          imgData,
          'PNG',
          0, // x position
          0, // y position
          pdfWidth, // width
          sourceHeight * ratio, // height
          '', // alias
          'FAST', // compression
          0, // rotation
          sourceY // source y position in the image
        );
      }
      
      pdf.save('data-analysis-report.pdf');
    });
  };

  // Add a function to clear the report if needed
  const handleClearReport = () => {
    if (window.confirm('Are you sure you want to clear this report?')) {
      setReportContent([]);
      if (fileId) {
        localStorage.removeItem(`report_content_${fileId}`);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="fixed top-20 left-3 z-10">
        <Link to={`/home?file_id=${fileId}`}>
          <button className="bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm">
            Back to Home
          </button>
        </Link>
      </div>
      <div className="mt-14 flex flex-col lg:flex-row min-h-screen bg-gray-900">
        {/* Left Side - Report Creation */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col space-y-4 border-b lg:border-r lg:border-b-0 border-blue-800">
          <div className="bg-blue-900/50 rounded-lg p-4 lg:p-6 h-auto lg:h-32 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4">
              {chartImages &&
                chartImages.map((chartImage, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg"
                    draggable
                    onDragStart={handleChartDragStart(chartImage, index)}
                  >
                    <img
                      src={chartImage.imageUrl}
                      alt={`${chartImage.config.chart_type} Chart`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="bg-blue-900/30 flex-1 flex justify-center items-center text-blue-100 rounded-lg p-4 h-40 cursor-pointer hover:bg-blue-800/40 transition-colors text-center border border-blue-800/50 backdrop-blur-sm">
              <div
                className="text-blue-100/70 text-sm w-full h-full"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedCharts.length === 0 ? (
                  <p>Drag and drop chart for analysis</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCharts.map(({ chartImage, chartIndex }) => (
                      <div key={chartIndex} className="relative">
                        <img
                          src={chartImage.imageUrl}
                          alt={`${chartImage.config.chart_type} Chart`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              className="w-full lg:w-auto bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm"
            >
              Generate Analysis
            </button>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800/50 backdrop-blur-sm">
            <p className="text-blue-200 text-sm font-medium mb-2">AI Analysis</p>
            <div className="text-blue-100/70 text-sm">
              {isLoading ? (
                <p>Analyzing charts...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : analysisResult ? (
                <div className="max-h-60 overflow-y-auto">
                  {analysisResult.map((analysis, index) => (
                    <div key={index} className="mb-4">
                      <p className="font-medium mb-1">Analysis {index + 1}:</p>
                      <p>{analysis}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Drag and drop charts and click Generate to analyze them...</p>
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full lg:w-40 bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm self-end"
          >
            Add to Report
          </button>
        </div>

        {/* Right Side - Report Preview */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6">
          <div
            ref={reportRef}
            className="bg-white rounded-lg p-4 lg:p-6 min-h-[50vh] border border-blue-800/50 backdrop-blur-sm flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Data Analysis Report</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {reportContent.length > 0 ? (
                <div className="space-y-8">
                  {reportContent.map((item, index) => (
                    <div key={index} className="flex flex-col lg:flex-row gap-6 pb-6 border-b border-gray-200">
                      <div className="w-full lg:w-1/2">
                        <div className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                          <img
                            src={item.chart.imageUrl}
                            alt="Chart"
                            className="w-full h-auto"
                          />
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {item.chart.config.chart_type} Chart
                          </p>
                        </div>
                      </div>
                      <div className="w-full lg:w-1/2 text-gray-700">
                        <h3 className="font-medium text-md mb-2">Analysis:</h3>
                        <p className="text-sm">{item.analysis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Your report content will appear here...</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
            {error && <p className="text-red-400 text-sm mr-auto self-center">{error}</p>}
            <button
              onClick={handleClearReport}
              className="w-full sm:w-auto bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-500 transition-colors text-sm font-medium shadow-sm"
            >
              Clear Report
            </button>
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-500 transition-colors text-sm font-medium shadow-sm flex items-center justify-center"
            >
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportPage;