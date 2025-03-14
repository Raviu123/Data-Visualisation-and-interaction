import React, { createContext, useState, useEffect } from 'react';

export const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  const [chartConfigs, setChartConfigs] = useState(() => {
    const savedConfigs = localStorage.getItem('chartConfigs');
    return savedConfigs ? JSON.parse(savedConfigs) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('chartConfigs', JSON.stringify(chartConfigs));
    } catch (error) {
      console.error('Error saving chart configurations to local storage:', error);
    }
  }, [chartConfigs]);

  const clearChartConfigs = () => {
    setChartConfigs([]);
    try {
      localStorage.removeItem('chartConfigs');
    } catch (error) {
      console.error('Error clearing chart configurations from local storage:', error);
    }
  };

  return (
    <ChartContext.Provider value={{ chartConfigs, setChartConfigs, clearChartConfigs }}>
      {children}
    </ChartContext.Provider>
  );
};