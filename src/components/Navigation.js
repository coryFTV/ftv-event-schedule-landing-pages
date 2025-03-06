import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

// SVG Icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 16C14 14.8954 14.8954 14 16 14H18C19.1046 14 20 14.8954 20 16V18C20 19.1046 19.1046 20 18 20H16C14.8954 20 14 19.1046 14 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 11H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 11H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 11H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 15H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 15H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 15H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NewsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 13H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 17H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ResultsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 15L16 11L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 11H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DriversIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TeamsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 11C20.6569 11 22 9.65685 22 8C22 6.34315 20.6569 5 19 5C17.3431 5 16 6.34315 16 8C16 9.65685 17.3431 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 11C3.34315 11 2 9.65685 2 8C2 6.34315 3.34315 5 5 5C6.65685 5 8 6.34315 8 8C8 9.65685 6.65685 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 12L17 8.5V15.5L22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2295 9.63587 19.6295 9 19.4C8.38293 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23577 20.3766 5.705 20.3766C5.17423 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.77052 10.0642 4.37052 9.63587 4.6 9C4.87235 8.38293 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23577 3.62343 5.705C3.62343 5.17423 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09423 3.70343 5.625 3.70343C6.15577 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30293 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09423 20.2966 5.625C20.2966 6.15577 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30293 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 6V6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12V12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CoverageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PremiumIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Navigation() {
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleDropdown = () => {
    setShowSportsDropdown(!showSportsDropdown);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <button className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
        <span className="menu-icon"></span>
      </button>
      
      <nav className={`sidebar-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="logo">
          <Link to="/">
            <img src="https://variety.com/wp-content/uploads/2024/03/Fubo-logo.png?w=1000&h=667&crop=1" alt="Fubo Logo" className="logo-image" />
            <span className="logo-text">Fubo</span>
          </Link>
        </div>
        
        <div className="nav-section">
          <div className="nav-section-title">MAIN</div>
          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                <span className="nav-icon"><ScheduleIcon /></span>
                <span>Sports Schedule</span>
              </Link>
            </li>
            <li>
              <Link to="/landing-pages" className={isActive('/landing-pages') ? 'active' : ''}>
                <span className="nav-icon"><DashboardIcon /></span>
                <span>Landing Pages</span>
              </Link>
            </li>
            <li>
              <Link to="/key-events" className={isActive('/key-events') ? 'active' : ''}>
                <span className="nav-icon"><ResultsIcon /></span>
                <span>Key Events</span>
              </Link>
            </li>
            <li>
              <Link to="/sheets-explorer" className={isActive('/sheets-explorer') ? 'active' : ''}>
                <span className="nav-icon"><NewsIcon /></span>
                <span>Sheets Explorer</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="nav-section">
          <div className="nav-section-title">SPORTS CATEGORIES</div>
          <ul className="nav-links">
            <li className="dropdown">
              <button 
                className={`dropdown-button ${showSportsDropdown ? 'active' : ''}`}
                onClick={toggleDropdown}
                aria-expanded={showSportsDropdown}
              >
                <span>
                  <span className="nav-icon"><TeamsIcon /></span>
                  <span>Browse Sports</span>
                </span>
              </button>
              <ul className={`dropdown-menu ${showSportsDropdown ? 'open' : ''}`}>
                <li><Link to="/sport/mlb" className={isActive('/sport/mlb') ? 'active' : ''}>MLB</Link></li>
                <li><Link to="/sport/soccer" className={isActive('/sport/soccer') ? 'active' : ''}>Soccer</Link></li>
                <li><Link to="/sport/nfl" className={isActive('/sport/nfl') ? 'active' : ''}>NFL</Link></li>
                <li><Link to="/sport/nba" className={isActive('/sport/nba') ? 'active' : ''}>NBA & WNBA</Link></li>
                <li><Link to="/sport/nhl" className={isActive('/sport/nhl') ? 'active' : ''}>NHL</Link></li>
                <li><Link to="/sport/college-basketball" className={isActive('/sport/college-basketball') ? 'active' : ''}>College Basketball</Link></li>
                <li><Link to="/sport/college-football" className={isActive('/sport/college-football') ? 'active' : ''}>College Football</Link></li>
                <li><Link to="/sport/canada" className={isActive('/sport/canada') ? 'active' : ''}>Canada - Sports</Link></li>
                <li><Link to="/sport/cricket" className={isActive('/sport/cricket') ? 'active' : ''}>Cricket</Link></li>
              </ul>
            </li>
          </ul>
        </div>
        
        <div className="nav-section">
          <div className="nav-section-title">TOOLS & CONFIGURATION</div>
          <ul className="nav-links">
            <li>
              <Link to="/networks" className={isActive('/networks') ? 'active' : ''}>
                <span className="nav-icon"><NetworkIcon /></span>
                <span>Network List</span>
              </Link>
            </li>
            <li>
              <Link to="/rsn-coverage" className={isActive('/rsn-coverage') ? 'active' : ''}>
                <span className="nav-icon"><CoverageIcon /></span>
                <span>RSN Coverage</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Premium-style featured section for Partner Settings */}
        <div className="premium-section">
          <div className="premium-section-title">
            <PremiumIcon />
            <span>Partner Settings</span>
          </div>
          <div className="premium-section-content">
            Configure your partner settings and default parameters
          </div>
          <Link to="/partner-config" className="premium-button">
            Configure Settings
          </Link>
        </div>
        
        {/* User section with test account */}
        <div className="user-section">
          <div className="user-avatar">T</div>
          <div className="user-info">
            <div className="user-name">Test Account</div>
            <div className="user-email">test@fubo.tv</div>
          </div>
          <button className="user-settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navigation; 