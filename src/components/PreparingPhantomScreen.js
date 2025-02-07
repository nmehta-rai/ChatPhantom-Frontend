import React from 'react';
import './PreparingPhantomScreen.css';
import ChatPhantomLogo from '../assets/ChapPhantom Logo No Background.png';

const PreparingPhantomScreen = ({ phantomName }) => {
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
      <div className='loading-animation'>
        <div className='ghost-loader'></div>
      </div>
      <p className='status-message'>This may take a few minutes...</p>
    </div>
  );
};

export default PreparingPhantomScreen;
