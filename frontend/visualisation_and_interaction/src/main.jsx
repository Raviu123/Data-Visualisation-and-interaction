import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ChartProvider } from './ChartContext';

createRoot(document.getElementById('root')).render(
  <ChartProvider>
    <StrictMode>
      <App />
    </StrictMode>,
  </ChartProvider>
  
)
