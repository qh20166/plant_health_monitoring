import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './apps/Home/page';
import IntroPage from './apps/Intro/page';
import LandingPage from './apps/Landing/page';
import MonitorPage from './apps/Monitor/page';
import PromptPage from './apps/Prompt/page';
import LoginPage from './apps/Login/page';
import SignupPage from './apps/Signup/page';
import Header from './components/Header/page';
import ProfilePage from './apps/Profile/page';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserType {
  username: string;
  avatarUrl: string;
}

const AppRoutes: React.FC<{ isAuthenticated: boolean; user: UserType | null }> = ({ isAuthenticated, user }) => {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/" && <Header isAuthenticated={isAuthenticated} user={user || undefined} />}
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/prompt" element={<PromptPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsAuthenticated(true);
      setUser({
        username: storedUsername,
        avatarUrl: localStorage.getItem('avatarUrl') || '',
      });
    }
  }, []);

  return (
    <Router>
      <AppRoutes isAuthenticated={isAuthenticated} user={user} />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </Router>
    
  );
};

export default App;
