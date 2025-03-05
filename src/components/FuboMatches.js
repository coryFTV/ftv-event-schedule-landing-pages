import React, { useState, useEffect } from 'react';
import { getFuboTvMatches } from '../utils/fuboTvApi';
import { convertToEasternTime } from '../utils/helpers';
import './FuboMatches.css';

const FuboMatches = ({ sport, league }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get matches with optional filters
        const options = {};
        if (sport) options.sport = sport;
        if (league) options.league = league;
        
        const data = await getFuboTvMatches(options);
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(`Failed to load matches: ${err.message}`);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [sport, league]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchMatches = async () => {
      try {
        const options = {};
        if (sport) options.sport = sport;
        if (league) options.league = league;
        
        const data = await getFuboTvMatches(options);
        setMatches(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching matches on retry:', err);
        setError(`Failed to load matches: ${err.message}`);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  };

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <p>
          <strong>Troubleshooting:</strong> Check that the proxy server is running with <code>npm run proxy</code> in a separate terminal.
          Try accessing <a href="http://localhost:3001/test-metadata" target="_blank" rel="noopener noreferrer">http://localhost:3001/test-metadata</a> directly to test the API connection.
        </p>
        <button className="retry-button" onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (matches.length === 0) {
    return <div className="no-matches">No matches found.</div>;
  }

  return (
    <div className="fubo-matches">
      <h2>Upcoming Matches</h2>
      <div className="matches-grid">
        {matches.map(match => {
          const { datePart, timePart } = convertToEasternTime(match.startTime);
          
          return (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <span className="match-league">{match.league}</span>
                <span className="match-sport">{match.sport}</span>
              </div>
              
              <h3 className="match-title">{match.title}</h3>
              
              <div className="match-time">
                <div className="match-date">{datePart}</div>
                <div className="match-time-value">{timePart} ET</div>
              </div>
              
              {match.teams && match.teams.length > 0 && (
                <div className="match-teams">
                  {match.teams.map((team, index) => (
                    <div key={index} className="team">
                      {team.name || team}
                    </div>
                  ))}
                </div>
              )}
              
              {match.venue && (
                <div className="match-venue">
                  <span className="venue-label">Venue:</span> {match.venue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuboMatches; 