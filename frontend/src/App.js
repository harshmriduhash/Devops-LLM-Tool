import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import { UserContext } from './Utils/UserContext';
import Login from './Components/Login/Login';
import SideNavbar from './Components/SideNavbar/SideNavbar';

import Profile from './Components/Profile/Profile';
import RepositoryList from './Components/Repository/RepositoryList';
import RepoDetail from './Components/Repository/RepoDetail';
import CodeViewer from './Components/CodeViewer/CodeViewer'; // Import CodeViewer

import GeminiChat from './Components/Chat/Chat'; // import your new Gemini page

function App() {
  const { user, setUser } = useContext(UserContext);

  // Fetch user on mount
  useEffect(() => {
    axios
      .get('http://localhost:4000/auth/user', { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => {
        // Not logged in or error
      });
  }, [setUser]);

  // If not logged in, show Login
  if (!user) {
    return <Login />;
  }

  // If logged in, show Navbar + routes
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <SideNavbar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<RepositoryList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/repositories" element={<RepositoryList />} />
            <Route path="/repositories/:username/:repoName" element={<RepoDetail />} />
            <Route path="/repositories/:username/:repoName/blob/*" element={<CodeViewer />} /> {/* Add this route */}
            {/* Fallback if needed */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;