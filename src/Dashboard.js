import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import './Dashboard.css';
import SidebarIcon from './assets/sidebar.svg';
import ChatPhantomLogo from './assets/ChapPhantom Logo No Background.png';
import AddPhantomIcon from './assets/AddPhantomIcon.png';
import { ChatScreen } from './ChatScreen';

function Dashboard() {
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const { user } = useUser();
  const { signOut } = useClerk();
  const [phantoms, setPhantoms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPhantom, setSelectedPhantom] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User:', user.id);
      getPhantoms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getPhantoms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/phantoms`, {
        params: { user_id: user.id },
      });
      console.log('Phantoms List:', response.data);
      setPhantoms(response.data);
      if (response.data.length > 0 && !selectedPhantom) {
        setSelectedPhantom(response.data[0]);
      }
    } catch (error) {
      console.error(
        'Error fetching phantoms:',
        error.response?.data || error.message
      );
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePhantomSelect = (phantom) => {
    setSelectedPhantom(phantom);
  };

  const handleCreatePhantom = () => {
    // TODO: Implement phantom creation
    console.log('Create new phantom');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className='dashboard-container'>
      <div className='dashboard-layout'>
        {/* Profile Dropdown */}
        <div className='profile-section'>
          <button
            className='profile-button'
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt='Profile'
                className='profile-image'
              />
            ) : (
              <div className='default-profile-image'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' />
                </svg>
              </div>
            )}
          </button>
          {isProfileOpen && (
            <div className='profile-dropdown'>
              <div
                className='dropdown-item'
                onClick={() => console.log('Manage Profile')}
              >
                Manage Profile
              </div>
              <div className='dropdown-item' onClick={handleSignOut}>
                Log out
              </div>
            </div>
          )}
        </div>

        {!sidebarOpen && (
          <button onClick={toggleSidebar} className='sidebar-toggle'>
            <img src={SidebarIcon} alt='Toggle Sidebar' />
          </button>
        )}

        <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className='sidebar-header'>
            <div className='header-buttons'>
              <button onClick={toggleSidebar} className='sidebar-icon'>
                <img src={SidebarIcon} alt='Toggle Sidebar' />
              </button>
              <button
                onClick={handleCreatePhantom}
                className='new-phantom-button'
                title='New Phantom'
              >
                <svg
                  className='plus-icon'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z'
                    fill='currentColor'
                  />
                </svg>
                <img
                  src={AddPhantomIcon}
                  alt='Add Phantom'
                  className='phantom-icon'
                />
              </button>
            </div>
          </div>
          <div className='sidebar-content'>
            <div className='sidebar-section'>
              <h3 className='section-title'>Phantoms</h3>
              <ul className='phantom-list'>
                {phantoms.map((phantom) => (
                  <li
                    key={phantom.phantom_id}
                    className={`phantom-item ${
                      selectedPhantom?.phantom_id === phantom.phantom_id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handlePhantomSelect(phantom)}
                  >
                    {phantom.phantom_name}
                  </li>
                ))}
              </ul>
            </div>
            {phantoms.length === 0 && (
              <div className='create-phantom-section'>
                <button className='create-button'>Create a Phantom</button>
              </div>
            )}
          </div>
        </div>
        <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <div className='chat-container'>
            {selectedPhantom ? (
              <ChatScreen phantomName={selectedPhantom.phantom_name} />
            ) : (
              <div className='welcome-screen'>
                <img
                  src={ChatPhantomLogo}
                  alt='ChatPhantom Logo'
                  className='welcome-logo'
                />
                <h1>Welcome to ChatPhantom!</h1>
                <p>
                  Select or create a phantom from the sidebar to start chatting
                </p>
                <button
                  onClick={handleCreatePhantom}
                  className='welcome-create-button'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z'
                      fill='currentColor'
                    />
                  </svg>
                  Create a Phantom
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
