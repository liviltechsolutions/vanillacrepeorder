import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/merchantdash/*" element={<App />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
);
