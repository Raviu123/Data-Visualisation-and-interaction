import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie ,Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale,BarElement,ArcElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register required Chart.js components
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

const DynamicCharts = () => {
  const [chartConfigs, setChartConfigs] = useState([]);
  const [error, setError] = useState('');

  // Fetch chart configurations from the API
  useEffect(() => {
    const fetchChartConfigs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/visualizations/charts');
        setChartConfigs(response.data.chart_configs);
      } catch (err) {
        setError('Failed to fetch chart configurations');
      }
    };

    fetchChartConfigs();
  }, []);

  // Render charts dynamically based on the configurations
  const renderChart = (config, index) => {
    const { chart_type, data, options, insights } = config;

    switch (chart_type) {
      case 'Bar':
        return (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h3>Bar Chart</h3>
            <Bar data={data} options={options} />
            <p>{insights}</p>
          </div>
        );
      case 'Pie':
        return (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h3>Pie Chart</h3>
            <Pie data={data} options={options} />
            <p>{insights}</p>
          </div>
        );
      case 'Line':
        return (
          <div key={index} style={{ height: '400px', width: '100%', position: 'relative' }}>
            <h3>Line Chart</h3>
            <Line data={data} options={options} />
            <p>{insights}</p>
          </div>
        );
      default:
        return (
          <div key={index}>
            <p>Unsupported chart type: {chart_type}</p>
          </div>
        );
    }
  };

  return (
    <div>
      <h1>Dynamic Charts</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {chartConfigs.length === 0 && !error && <p>Loading charts...</p>}
      {chartConfigs.map((config, index) => renderChart(config, index))}
    </div>
  );
};

export default DynamicCharts;
