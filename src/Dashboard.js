import React, { useEffect, useState, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import SidebarIcon from './assets/sidebar.svg';
import ChatPhantomLogo from './assets/ChapPhantom Logo No Background.png';
import AddPhantomIcon from './assets/AddPhantomIcon.png';
import { ChatScreen } from './ChatScreen';
import CreatePhantomForm from './components/CreatePhantomForm';
import PreparingPhantomScreen from './components/PreparingPhantomScreen';

function Dashboard() {
  const API_BASE_URL = 'http://127.0.0.1:8000';
  const WS_BASE_URL = 'ws://127.0.0.1:8000';

  const { user } = useUser();
  const { signOut } = useClerk();
  const [phantoms, setPhantoms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPhantom, setSelectedPhantom] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [phantomStatuses, setPhantomStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialStatusReceived, setIsInitialStatusReceived] = useState(false);
  const websocketRefs = useRef({});

  useEffect(() => {
    if (user) {
      console.log('User:', user.id);
      getPhantoms();
    }
    return () => {
      // Cleanup WebSocket connections
      Object.values(websocketRefs.current).forEach((ws) => ws.close());
    };
  }, [user]);

  const connectWebSocket = (phantomId) => {
    // Close existing connection if any
    if (websocketRefs.current[phantomId]) {
      websocketRefs.current[phantomId].close();
    }

    const ws = new WebSocket(`${WS_BASE_URL}/ws/phantom/${phantomId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPhantomStatuses((prev) => ({
        ...prev,
        [phantomId]: data.status,
      }));
      setIsInitialStatusReceived(true);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsInitialStatusReceived(true); // Ensure we don't get stuck loading on error
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      delete websocketRefs.current[phantomId];
    };

    websocketRefs.current[phantomId] = ws;
  };

  const getPhantoms = async () => {
    setIsLoading(true);
    setIsInitialStatusReceived(false);
    try {
      const response = await axios.get(`${API_BASE_URL}/phantoms`, {
        params: { user_id: user.id },
      });
      console.log('Phantoms List:', response.data);
      setPhantoms(response.data);

      // Connect WebSocket for each phantom
      response.data.forEach((phantom) => {
        connectWebSocket(phantom.phantom_id);
      });

      if (response.data.length > 0 && !selectedPhantom) {
        setSelectedPhantom(response.data[0]);
      }
    } catch (error) {
      console.error(
        'Error fetching phantoms:',
        error.response?.data || error.message
      );
      setIsInitialStatusReceived(true); // Ensure we don't get stuck loading on error
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePhantomSelect = (phantom) => {
    setSelectedPhantom(phantom);
  };

  const handleCreatePhantom = () => {
    setShowCreateForm(true);
    setSelectedPhantom(null);
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleSubmitPhantom = async (formData) => {
    try {
      console.log('Submitting phantom:', formData);
      const response = await axios.post(`${API_BASE_URL}/phantoms`, {
        phantom_name: formData.phantomName,
        website_url: formData.websiteUrl,
        owner_id: user.id,
      });

      console.log('Create phantom response:', response.data);

      if (response.data.status === 'success') {
        const newPhantom = response.data.data;
        console.log('New phantom created:', newPhantom);

        if (newPhantom.phantom_id) {
          // Connect WebSocket for the new phantom
          connectWebSocket(newPhantom.phantom_id);
          console.log('WebSocket connected for:', newPhantom.phantom_id);

          // Update phantoms list
          setPhantoms((prev) => [...prev, newPhantom]);

          // Set initial status for the new phantom
          setPhantomStatuses((prev) => ({
            ...prev,
            [newPhantom.phantom_id]: 'crawling',
          }));

          // Close the create form and select the new phantom
          setShowCreateForm(false);
          setSelectedPhantom(newPhantom);
          console.log('States updated, navigation should occur');
        } else {
          console.error('Created phantom is missing phantom_id:', newPhantom);
          throw new Error('Our phantom got lost in the void! 👻');
        }
      } else {
        console.error('Failed to create phantom:', response.data);
        throw new Error(
          response.data.message || 'Our phantom vanished mysteriously...'
        );
      }
    } catch (error) {
      console.error(
        'Error creating phantom:',
        error.response?.data || error.message
      );

      // Handle validation errors (400 status)
      if (error.response?.status === 400) {
        if (
          error.response.data.detail ===
          'No sitemap found for this website. ChatPhantom requires websites to have a sitemap for optimal functionality.'
        ) {
          throw new Error(
            `👻 Oops! We couldn't find a sitemap for this website!\n\nA sitemap helps our phantoms navigate your website and is also great for your SEO. Think of it as a treasure map that guides our ghostly friends through your digital realm! ✨\n\nAsk your web developer to add one - it's like leaving breadcrumbs for our phantoms to follow. 🗺️\n\nNeed help? Check out https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview`
          );
        }
        // For other validation errors
        throw new Error(
          "Oh no! Our phantom couldn't materialize! The website seems to be protected by some mysterious force field. 👻✨"
        );
      }
      // For unexpected errors
      throw new Error(
        "Looks like there's a disturbance in the phantom realm! 👻\n\nOur ghostly friends are taking a short break. Try summoning again in a moment! ✨"
      );
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className='loading-screen'>
          <img
            src={ChatPhantomLogo}
            alt='ChatPhantom Logo'
            className='loading-logo'
          />
          <div className='loading-text'>Summoning your phantoms...</div>
        </div>
      );
    }

    if (showCreateForm) {
      return (
        <CreatePhantomForm
          onSubmit={handleSubmitPhantom}
          onCancel={handleCancelCreate}
        />
      );
    }

    if (selectedPhantom) {
      // Show loading screen while waiting for initial status
      if (!isInitialStatusReceived) {
        return (
          <div className='loading-screen'>
            <img
              src={ChatPhantomLogo}
              alt='ChatPhantom Logo'
              className='loading-logo'
            />
            <div className='loading-text'>Summoning your phantoms...</div>
          </div>
        );
      }

      return (
        <>
          {phantomStatuses[selectedPhantom.phantom_id] === 'completed' ? (
            <ChatScreen phantom={selectedPhantom} />
          ) : (
            <PreparingPhantomScreen
              phantomName={selectedPhantom.phantom_name}
            />
          )}
        </>
      );
    }

    return (
      <div className='welcome-screen'>
        <img
          src={ChatPhantomLogo}
          alt='ChatPhantom Logo'
          className='welcome-logo'
        />
        <h1>Welcome to ChatPhantom!</h1>
        <p>Select or create a phantom from the sidebar to start chatting</p>
        <button onClick={handleCreatePhantom} className='welcome-create-button'>
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
    );
  };

  return (
    <div className='dashboard-container'>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        theme='dark'
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
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
              <>
                <div className='empty-phantoms-message'>
                  <p>No phantoms lurking around yet!</p>
                  <p className='create-hint'>
                    Create your first phantom and find them all here when you
                    want to chat again.
                  </p>
                </div>
                <div className='create-phantom-section'>
                  <button
                    className='create-button'
                    onClick={handleCreatePhantom}
                  >
                    Create a Phantom
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <div className='chat-container'>{renderMainContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
