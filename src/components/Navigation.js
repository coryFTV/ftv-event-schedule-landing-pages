import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);

  return (
    <nav className="main-nav">
      <div className="logo">
        <Link to="/">
          <img src="https://variety.com/wp-content/uploads/2024/03/Fubo-logo.png?w=1000&h=667&crop=1" alt="Fubo Logo" className="logo-image" />
          <span className="logo-text">Events, Schedules and Landing Pages</span>
        </Link>
      </div>
      <div className="nav-section-title">DIRECTORY</div>
      <ul className="nav-links">
        <li><Link to="/key-events">Key Events on Fubo</Link></li>
        <li><Link to="/">Full Live Sports Schedule</Link></li>
        <li><Link to="/rsn-coverage">RSN Coverage by League</Link></li>
        <li><Link to="/networks">Master Network List</Link></li>
        <li><Link to="/sheets-explorer">Google Sheets Explorer</Link></li>
        <li className="highlight-link"><Link to="/landing-pages">Fubo Landing Pages</Link></li>
        <li className="highlight-link"><Link to="/fubo-matches">Fubo TV Matches</Link></li>
        
        <li className="dropdown">
          <button 
            className="dropdown-button" 
            onClick={() => setShowSportsDropdown(!showSportsDropdown)}
          >
            Sports Categories
          </button>
          {showSportsDropdown && (
            <ul className="dropdown-menu">
              <li><Link to="/sport/mlb">MLB</Link></li>
              <li><Link to="/sport/soccer">Soccer</Link></li>
              <li><Link to="/sport/nfl">NFL</Link></li>
              <li><Link to="/sport/nba">NBA & WNBA</Link></li>
              <li><Link to="/sport/nhl">NHL</Link></li>
              <li><Link to="/sport/college-basketball">College Basketball</Link></li>
              <li><Link to="/sport/college-football">College Football</Link></li>
              <li><Link to="/sport/canada">Canada - Sports</Link></li>
              <li><Link to="/sport/cricket">Cricket</Link></li>
              <li><Link to="/entertainment">US - Entertainment</Link></li>
              <li><Link to="/latino-sports">Latino - Sports</Link></li>
              <li><Link to="/latino-entertainment">Latino - Entertainment</Link></li>
            </ul>
          )}
        </li>
        <li><Link to="/partner-config">Partner Configuration</Link></li>
      </ul>
      <div className="last-updated">
        Last Updated: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'numeric', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
    </nav>
  );
}

export default Navigation; 