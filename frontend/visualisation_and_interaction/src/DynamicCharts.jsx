import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, BarElement, ArcElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Card from './Card'
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

const DynamicCharts = ({ uploadedFileName }) => {
  const [chartConfigs, setChartConfigs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartConfigs = async () => {
      try {
        console.log('Fetching charts for file:', uploadedFileName); // Debug log
        
        const response = await axios.post('http://127.0.0.1:5000/visualizations/charts', 
          { file_name: uploadedFileName },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        console.log('Received response:', response.data); // Debug log
        
        if (response.data.error) {
          setError(response.data.error);
          return;
        }
        
        if (!response.data.chart_configs) {
          setError('No chart configurations received from server');
          return;
        }
        
        setChartConfigs(response.data.chart_configs);
        setError('');
      } catch (err) {
        console.error('Error fetching charts:', err); // Debug log
        setError(`Failed to fetch chart configurations: ${err.message}`);
      }
    };

    if (uploadedFileName) {
      fetchChartConfigs();
    }
  }, [uploadedFileName]);

  const renderChart = (config, index) => {
    const { chart_type, data, options, insights } = config;
    
    console.log(`Rendering ${chart_type} chart with data:`, data); // Debug log

    switch (chart_type) {
      case 'Bar':
        return (
          <Card key={index} title="Bar Chart" insights={insights}>
            <Bar data={data} options={options} />
          </Card>
        );
      case 'Pie':
        return (
          <Card key={index} title="Pie Chart" insights={insights}>
            <Pie data={data} options={options} />
          </Card>
        );
      case 'Line':
        return (
          <Card key={index} title="Line Chart" insights={insights}>
            <Line data={data} options={options} />
          </Card>
        );
      default:
        return (
          <div key={index}>
            <p className="text-red-500">Unsupported chart type: {chart_type}</p>
          </div>
        );
    }
  };

  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Dynamic Charts</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {chartConfigs.length === 0 && !error && (
        <p className="text-gray-600">Loading charts...</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {chartConfigs.map((config, index) => renderChart(config, index))}
      </div>
    </div>
  );
};

export default DynamicCharts;