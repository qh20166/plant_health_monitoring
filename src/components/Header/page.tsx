import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style.css';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    avatarUrl: string;
    username: string;
  };
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const location = useLocation();

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      avatarRef.current &&
      !avatarRef.current.contains(event.target as Node)
    ) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen, handleClickOutside]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("avatarUrl");
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <nav className="header-nav-bar">
        <ul className="nav-links">
          <li><Link to="/home">Trang chủ</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/monitor">Bảng điều khiển</Link></li>
              <li><Link to="/prompt">Lịch sử</Link></li>
            </>
          )}
        </ul>

        <div className="nav-user">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              {location.pathname !== '/login' && (
                <Link to="/login" className="nav-button">Đăng nhập</Link>
              )}
              {location.pathname !== '/signup' && (
                <Link to="/signup" className="nav-button signup">Đăng ký</Link>
              )}
            </div>
          ) : (
            <div className="user-menu">
              <img 
                ref={avatarRef}
                src={user?.avatarUrl || "https://via.placeholder.com/40"} 
                alt="Avatar" 
                className="user-avatar"
                onClick={toggleMenu}
              />
              {menuOpen && (
                <div ref={dropdownRef} className="dropdown-menu">
                  <p className="user-info">{user?.username || "User Name"}</p>
                  <Link to="/profile" className="dropdown-item">Thông tin người dùng</Link>
                  <button onClick={handleLogout} className="dropdown-item logout">Đăng xuất</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
