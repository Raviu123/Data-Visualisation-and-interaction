import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, BarElement, ArcElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Card from './Card';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DynamicCharts = ({ uploadedFileId }) => {
  const navigate = useNavigate();
  const chartRefs = useRef([]);
  const [error, setError] = useState('');
  const [chartConfigs, setChartConfigs] = useState([]);

  
  // Log mount/unmount for debugging
  useEffect(() => {
    console.log('DynamicCharts mounted for file:', uploadedFileId);
    return () => console.log('DynamicCharts unmounted for file:', uploadedFileId);
  }, []);

 // Load chart configs from sessionStorage
useEffect(() => {
  const loadConfigs = () => {
    const userId = Cookies.get('userId');
    const storageKey = `chartConfigs_${userId}_${uploadedFileId}`;
    const savedConfigs = sessionStorage.getItem(storageKey);
    if (savedConfigs) {
      try {
        setChartConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error parsing stored chartConfigs:', error);
        setChartConfigs([]);
      }
    } else {
      setChartConfigs([]);
    }
  };
  loadConfigs();
}, [uploadedFileId]);

// Fetch chart configs from server if not already loaded
useEffect(() => {
  const fetchChartConfigs = async () => {
    // Only fetch if no configs are loaded
    if (!uploadedFileId || chartConfigs.length > 0) return;
    const userId = Cookies.get('userId');
    if (!userId) return; // Exit if no logged-in user

    try {
      console.log('Fetching charts for file:', uploadedFileId);
      const response = await axios.post(
        'http://127.0.0.1:5000/visualizations/charts',
        { file_id: uploadedFileId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.chart_configs) {
        setChartConfigs(response.data.chart_configs);
        const storageKey = `chartConfigs_${userId}_${uploadedFileId}`;
        sessionStorage.setItem(storageKey, JSON.stringify(response.data.chart_configs));
      } else {
        setError('No chart configurations received from server');
      }
    } catch (err) {
      console.error('Error fetching charts:', err);
      setError(`Failed to fetch chart configurations: ${err.message}`);
    }
  };
  fetchChartConfigs();
}, [uploadedFileId, chartConfigs]);

  // Handle chart download
  const handleDownload = (chartRef, index) => {
    const chartInstance = chartRef.current[index];
    if (chartInstance) {
      const canvas = chartInstance.canvas;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', 1.0);
      ctx.restore();
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-${index}.jpg`;
      link.click();
    }
  };

  // Render individual charts
  const renderChart = (config, index) => {
    const { chart_type, data, options, insights } = config;
    const chartOptions = {
      ...options,
      animation: false, // Disable animations for faster rendering
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...options.plugins,
        backgroundColor: 'white',
      },
      layout: {
        padding: 20,
      },
    };

    const ChartWrapper = ({ children }) => (
      <Card key={index} insights={insights} className="relative">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{`${chart_type} Chart`}</h3>
          <button
            onClick={() => handleDownload(chartRefs, index)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Chart
          </button>
        </div>
        {children}
      </Card>
    );

    switch (chart_type) {
      case 'Bar':
        return (
          <ChartWrapper>
            <Bar data={data} options={chartOptions} ref={(el) => (chartRefs.current[index] = el)} />
          </ChartWrapper>
        );
      case 'Pie':
        return (
          <ChartWrapper>
            <Pie data={data} options={chartOptions} ref={(el) => (chartRefs.current[index] = el)} />
          </ChartWrapper>
        );
      case 'Line':
        return (
          <ChartWrapper>
            <Line data={data} options={chartOptions} ref={(el) => (chartRefs.current[index] = el)} />
          </ChartWrapper>
        );
      default:
        return (
          <div key={index}>
            <p className="text-red-500">Unsupported chart type: {chart_type}</p>
          </div>
        );
    }
  };

  // Memoize chart components to prevent unnecessary re-renders
  const chartComponents = useMemo(() => 
    chartConfigs.map((config, index) => renderChart(config, index)),
    [chartConfigs]
  );

  // Handle report creation
  const handleCreateReport = () => {
    const chartImages = chartRefs.current
      .map((chartRef, index) => {
        if (chartRef) {
          const canvas = chartRef.canvas;
          const ctx = canvas.getContext('2d');
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return {
            index,
            imageUrl: canvas.toDataURL('image/jpeg', 1.0),
            config: chartConfigs[index],
          };
        }
        return null;
      })
      .filter(Boolean);
    navigate('/report', { state: { chartImages, fileId: uploadedFileId } });
  };

  return (
    <div className=" p-8 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <div className=" mb-6 flex justify-between items-center pl-10 pr-10">
        <h1 className="text-2xl font-bold text-white">Dynamic Charts</h1>
        <button
          onClick={handleCreateReport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Report
        </button>
      </div >
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {chartConfigs.length === 0 && !error && (
        <p className="text-gray-600">Loading charts...</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {chartComponents}
      </div>
    </div>
  );
};

export default DynamicCharts;