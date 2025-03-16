import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import iconImg from '../../assets/icon.png';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <img src={iconImg} alt="Plant Icon" className="landing-plant-icon" />
      <h1 className="landing-title">
        Welcome to<br />
        <span className="title-part">Plant Health Monitoring</span>
      </h1>
      <Link to="/home">
        <button className="landing-start-button">
          <span className="start-text">START THE EXPERIENCE</span>
        </button>
      </Link>
    </div>
  );
};
export default LandingPage;
