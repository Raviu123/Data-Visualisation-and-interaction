import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Homepage from './pages/Homepage';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import ReportPage from './pages/ReportPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="scrollable-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;