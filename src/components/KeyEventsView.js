import React, { useState, useEffect } from 'react';
import { fetchGoogleSheetsData, queryGoogleSheetsData, convertToEasternTime } from '../utils/helpers';
import URLBuilder from './URLBuilder';
import './ScheduleView.css'; // Reuse the same styling

function KeyEventsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Google Sheets configuration
  const SHEET_ID = "1yVXd40qGy8IVXe-LS79gFAiAFv476RPVQVY6whMR_hs";
  const SHEET_NAME = "Highlights";
  const RANGE = "A9:E";
  
  useEffect(() => {
    async function loadGoogleSheetsData() {
      try {
        setLoading(true);
        
        // Fetch data from Google Sheets
        const sheetsData = await fetchGoogleSheetsData(SHEET_ID, SHEET_NAME, RANGE);
        
        // Get yesterday's date for filtering
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Query the data similar to your QUERY formula
        const filteredData = queryGoogleSheetsData(sheetsData, {
          dateColumn: 'Date', // Assuming 'Date' is the column name
          minDate: yesterday.toISOString().split('T')[0], // Format as YYYY-MM-DD
        });
        
        // Transform the data to match the format expected by the app
        const transformedData = filteredData.map((item, index) => ({
          id: `sheet-${index}`,
          title: item.Event || item.Title || 'Unknown Event',
          starttime: item.Date ? new Date(item.Date).toISOString() : null,
          sport: item.Sport || 'Unknown',
          league: item.League || '',
          network: item.Network || '',
          url: item.URL || '',
          isHighlight: true
        }));
        
        setData(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading Google Sheets data:', err);
        setError(`Failed to load key events: ${err.message}`);
        setLoading(false);
      }
    }
    
    loadGoogleSheetsData();
  }, []);
  
  const openUrlBuilder = (match) => {
    setSelectedMatch(match);
  };
  
  const closeUrlBuilder = () => {
    setSelectedMatch(null);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Loading key events...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="schedule-container">
      <div className="content-card">
        <h1>Key Events on Fubo</h1>
        <p>Showing the most important upcoming sports events and highlights on Fubo TV.</p>
      </div>
      
      <div className="content-card">
        {data.length === 0 ? (
          <div className="no-results">
            No key events found for the upcoming period. Check back later.
          </div>
        ) : (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Time</th>
                <th>Sport</th>
                <th>League</th>
                <th>Network</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((event, index) => {
                const { datePart, timePart } = convertToEasternTime(event.starttime);
                return (
                  <tr key={index}>
                    <td>{event.title}</td>
                    <td>{datePart}</td>
                    <td>{timePart}</td>
                    <td>{event.sport}</td>
                    <td>{event.league}</td>
                    <td>{event.network}</td>
                    <td>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => openUrlBuilder(event)}
                      >
                        Create URL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {selectedMatch && (
        <URLBuilder 
          match={selectedMatch} 
          onClose={closeUrlBuilder} 
        />
      )}
    </div>
  );
}

export default KeyEventsView; 