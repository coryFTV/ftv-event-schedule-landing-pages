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
        setError('Failed to load key events from Google Sheets. Please try again later.');
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
  
  if (loading) return <div className="loading">Loading key events data...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="schedule-container">
      <h1>Key Events on Fubo</h1>
      
      <div className="schedule-controls">
        <div className="results-count">
          Showing {data.length} key {data.length === 1 ? 'event' : 'events'}
        </div>
      </div>
      
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Event</th>
            <th>Sport</th>
            <th>Network</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((match, index) => {
              const { datePart, timePart } = convertToEasternTime(match.starttime);
              return (
                <tr key={index}>
                  <td>{datePart}</td>
                  <td>{timePart}</td>
                  <td>{match.title}</td>
                  <td>{match.sport}</td>
                  <td>{match.network}</td>
                  <td>
                    <button 
                      className="url-builder-button"
                      onClick={() => openUrlBuilder(match)}
                    >
                      Create URL
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="no-results">
                No key events found for the upcoming period
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {selectedMatch && (
        <URLBuilder 
          match={selectedMatch} 
          onClose={closeUrlBuilder} 
        />
      )}
      
      <div className="data-source-info">
        <p>Data source: Google Sheets - Updated automatically</p>
        <p>Sheet ID: {SHEET_ID}</p>
        <p>Last fetched: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default KeyEventsView; 