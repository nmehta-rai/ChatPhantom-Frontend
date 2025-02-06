import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Dashboard from './Dashboard';
import './App.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { ChatScreen } from './ChatScreen';

function App() {
  console.log(
    'Clerk Publishable Key:',
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY
  );

  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <div className='App'>
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/chat' element={<ChatScreen />} />
            {/* Add more routes here as needed */}
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
