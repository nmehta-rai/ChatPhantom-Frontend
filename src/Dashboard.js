import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import './Dashboard.css';
import SidebarIcon from './assets/sidebar.svg';

function Dashboard() {
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const { user } = useUser();
  const { signOut } = useClerk();
  const [phantoms, setPhantoms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('User:', user.id);
      getPhantoms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    signOut().then(() => {
      window.location.href = '/';
    });
  };

  const getPhantoms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/phantoms`, {
        params: { user_id: user.id },
      });
      console.log('Phantoms List:', response.data);
      setPhantoms(response.data);
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

  return (
    <div className='dashboard-container'>
      <div className='top-bar'>
        <div className='left-section'>
          <button onClick={handleLogout} className='logout-button'>
            Logout
          </button>
        </div>
        <div className='right-section'>
          {!sidebarOpen && (
            <button onClick={toggleSidebar} className='sidebar-icon'>
              <img src={SidebarIcon} alt='Toggle Sidebar' />
            </button>
          )}
        </div>
      </div>
      {phantoms.length > 0 ? (
        <div className='dashboard-content'>
          {sidebarOpen && (
            <div className='sidebar'>
              <button onClick={toggleSidebar} className='sidebar-icon'>
                <img src={SidebarIcon} alt='Toggle Sidebar' />
              </button>
              <ul>
                {phantoms.map((phantom) => (
                  <li key={phantom.phantom_id}>{phantom.phantom_name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className='main-content'>
            <h1>Welcome to your Dashboard</h1>
            <p>
              This is your dashboard where you can manage your account and view
              your data.
            </p>
          </div>
        </div>
      ) : (
        <div className='landing-page'>
          <h1>No Phantoms Found</h1>
          <button className='create-button'>Create a Phantom</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
