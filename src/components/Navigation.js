import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const location = useLocation();

  const toggleDropdown = () => {
    setShowSportsDropdown(!showSportsDropdown);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sidebar-nav">
      <div className="logo">
        <Link to="/">
          <img src="https://variety.com/wp-content/uploads/2024/03/Fubo-logo.png?w=1000&h=667&crop=1" alt="Fubo Logo" className="logo-image" />
          <span className="logo-text">Content Management Portal</span>
        </Link>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Main Navigation</div>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              <i className="nav-icon">📅</i>
              <span>Sports Schedule</span>
            </Link>
          </li>
          <li>
            <Link to="/landing-pages" className={isActive('/landing-pages') ? 'active' : ''}>
              <i className="nav-icon">🚀</i>
              <span>Landing Pages</span>
            </Link>
          </li>
          <li>
            <Link to="/key-events" className={isActive('/key-events') ? 'active' : ''}>
              <i className="nav-icon">🔑</i>
              <span>Key Events</span>
            </Link>
          </li>
          <li>
            <Link to="/sheets-explorer" className={isActive('/sheets-explorer') ? 'active' : ''}>
              <i className="nav-icon">📊</i>
              <span>Sheets Explorer</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Sports Categories</div>
        <ul className="nav-links">
          <li className="dropdown">
            <button 
              className={`dropdown-button ${showSportsDropdown ? 'active' : ''}`}
              onClick={toggleDropdown}
              aria-expanded={showSportsDropdown}
            >
              <span>
                <i className="nav-icon">🏆</i>
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
        <div className="nav-section-title">Tools & Configuration</div>
        <ul className="nav-links">
          <li>
            <Link to="/partner-config" className={isActive('/partner-config') ? 'active' : ''}>
              <i className="nav-icon">⚙️</i>
              <span>Partner Config</span>
            </Link>
          </li>
          <li>
            <Link to="/networks" className={isActive('/networks') ? 'active' : ''}>
              <i className="nav-icon">🌐</i>
              <span>Network List</span>
            </Link>
          </li>
          <li>
            <Link to="/rsn-coverage" className={isActive('/rsn-coverage') ? 'active' : ''}>
              <i className="nav-icon">📺</i>
              <span>RSN Coverage</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="nav-section featured-section">
        <div className="nav-section-title">Featured</div>
        <ul className="nav-links">
          <li>
            <Link to="/fubo-matches" className="highlight-link">
              <i className="nav-icon">🎮</i>
              <span>Fubo TV Matches</span>
            </Link>
          </li>
          <li>
            <Link to="/entertainment" className="highlight-link secondary">
              <i className="nav-icon">🎬</i>
              <span>Entertainment</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="last-updated">
        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
    </nav>
  );
}

export default Navigation; 