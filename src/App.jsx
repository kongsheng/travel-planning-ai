import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripResultPage from './pages/TripResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip-result" element={<TripResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
