import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import Homepage from './pages/Homepage';
import ReportPage from './pages/ReportPage';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';

const App = () => {
  return (
    <Router>
      <AliveScope>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Homepage key="home" />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AliveScope>
    </Router>
  );
};

export default App;