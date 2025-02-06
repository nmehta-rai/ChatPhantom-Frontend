import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/chat');
  };

  return (
    <div className='home-container'>
      <div className='home-content'>
        <h1>ChatPhantom</h1>
        <p>Data Refined, Deeper Insights Defined</p>
        <button className='cta-button' onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;
