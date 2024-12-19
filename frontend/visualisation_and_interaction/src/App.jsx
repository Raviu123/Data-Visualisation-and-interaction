import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DynamicCharts from './DynamicCharts'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DynamicCharts></DynamicCharts>
    </>
  )
}

export default App
