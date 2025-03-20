import React from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userToken'); 

  const handleArrowDoubleClick = () => {
    if (isLoggedIn) {
      navigate('/monitor');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-contain" onDoubleClick={handleArrowDoubleClick}>
    </div>
  );
};

export default HomePage;
