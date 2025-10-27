import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripResult from '../components/TripResult';
import Footer from '../components/Footer';

const TripResultPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 确保页面从顶部开始
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="trip-result-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#f7fafc' }}>
      <TripResult onBack={handleBackToHome} />
      <Footer />
    </div>
  );
};

export default TripResultPage;
