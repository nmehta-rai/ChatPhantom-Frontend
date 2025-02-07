import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className='home-container'>
      <div className='hero-section'>
        <div className='logo-container'>
          <div className='logo-animation'></div>
        </div>
        <h1>ChatPhantom</h1>
        <p className='tagline'>Data Refined, Deeper Insights Defined</p>
        <button className='cta-button' onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;
