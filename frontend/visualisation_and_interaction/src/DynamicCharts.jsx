import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, BarElement, ArcElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Card from './Card';
import { useNavigate } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = Cookies.get('userId');
  const fetchTimeoutRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cache management
  const cacheKey = useMemo(() => 
    `chartConfigs_${currentUserId}_${uploadedFileId}`,
    [currentUserId, uploadedFileId]
  );

  // Load chart configs from sessionStorage with user validation
  useEffect(() => {
    const loadConfigs = () => {
      if (!currentUserId || !uploadedFileId) {
        setChartConfigs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const savedConfigs = sessionStorage.getItem(cacheKey);

      if (savedConfigs) {
        try {
          const parsedData = JSON.parse(savedConfigs);
          // Validate that the stored data belongs to the current user
          if (parsedData.userId === currentUserId) {
            setChartConfigs(parsedData.charts);
            setIsLoading(false);
            return; // Don't fetch if we have valid cached data
          } else {
            // Clear invalid data
            sessionStorage.removeItem(cacheKey);
          }
        } catch (error) {
          console.error('Error parsing stored chartConfigs:', error);
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      // If we reach here, we need to fetch data
      fetchChartConfigs();
    };

    loadConfigs();

    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [uploadedFileId, currentUserId, cacheKey]);

  // Fetch chart configs from server
  const fetchChartConfigs = async () => {
    if (!uploadedFileId || !currentUserId) return;

    try {
      console.log('Fetching charts for file:', uploadedFileId);
      const response = await axios.post(
        'http://127.0.0.1:5000/visualizations/charts',
        { 
          file_id: uploadedFileId,
          user_id: currentUserId 
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`
          } 
        }
      );

      if (response.data.chart_configs) {
        const chartData = {
          userId: currentUserId,
          timestamp: new Date().toISOString(),
          charts: response.data.chart_configs
        };
        
        setChartConfigs(response.data.chart_configs);
        sessionStorage.setItem(cacheKey, JSON.stringify(chartData));
      } else {
        setError('No chart configurations received from server');
      }
    } catch (err) {
      console.error('Error fetching charts:', err);
      setError(`Failed to fetch chart configurations: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...options.plugins,
        backgroundColor: 'white',
        legend: {
          ...options.plugins?.legend,
          display: true,
          labels: {
            ...options.plugins?.legend?.labels,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        },
        title: {
          ...options.plugins?.title,
          font: {
            size: isMobile ? 14 : 16
          }
        },
        tooltip: {
          ...options.plugins?.tooltip,
          bodyFont: {
            size: isMobile ? 10 : 12
          },
          titleFont: {
            size: isMobile ? 12 : 14
          }
        }
      },
      layout: {
        padding: isMobile ? 10 : 20,
      },
      scales: options.scales ? {
        ...options.scales,
        x: {
          ...options.scales.x,
          ticks: {
            ...options.scales.x?.ticks,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        },
        y: {
          ...options.scales.y,
          ticks: {
            ...options.scales.y?.ticks,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        }
      } : undefined
    };

    const ChartWrapper = ({ children }) => (
      <Card key={index} insights={insights} className="relative">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>{`${chart_type} Chart`}</h3>
          <button
            onClick={() => handleDownload(chartRefs, index)}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold ${isMobile ? 'py-1 px-3 text-sm' : 'py-2 px-4'} rounded`}
          >
            Download Chart
          </button>
        </div>
        <div className={isMobile ? 'h-64' : 'h-80'}>
          {children}
        </div>
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
    [chartConfigs, isMobile]
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
    <div className="p-3 md:p-4">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>Dynamic Charts</h1>
        <button
          onClick={handleCreateReport}
          className={`${isMobile ? 'text-sm py-2' : 'py-2'} w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded`}
        >
          Create Report
        </button>
      </div>
      {error && <p className="text-red-500 mb-3 md:mb-4 text-sm md:text-base">{error}</p>}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : chartConfigs.length === 0 && !error ? (
        <p className="text-gray-400 text-center py-12">No charts available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {chartComponents}
        </div>
      )}
    </div>
  );
};

export default DynamicCharts;