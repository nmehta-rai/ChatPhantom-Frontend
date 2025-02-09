import React, { useEffect } from 'react';
import './PreparingPhantomScreen.css';
import ChatPhantomLogo from '../assets/ChapPhantom Logo No Background.png';

const PreparingPhantomScreen = ({
  phantomName,
  progress = 0,
  status = 'in_progress',
}) => {
  useEffect(() => {
    console.log('PreparingPhantomScreen received progress update:', progress);
    console.log('PreparingPhantomScreen status:', status);
  }, [progress, status]);

  return (
    <div className='preparing-phantom-screen'>
      <img
        src={ChatPhantomLogo}
        alt='ChatPhantom Logo'
        className='preparing-logo'
      />
      <h2>Preparing Your Phantom</h2>
      <p>
        We're crawling {phantomName}'s website to make it more knowledgeable.
      </p>
      <div className='progress-container'>
        <div className='progress-bar'>
          <div className='progress-fill' style={{ width: `${progress}%` }}>
            <div className='ghost-progress'>
              <div className='ghost-body'></div>
            </div>
          </div>
        </div>
        <div className='progress-text'>{progress.toFixed(1)}% complete</div>
      </div>
    </div>
  );
};

export default PreparingPhantomScreen;
