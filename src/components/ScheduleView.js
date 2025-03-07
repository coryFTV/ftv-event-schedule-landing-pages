import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertToEasternTime } from '../utils/helpers';
import URLBuilder from './URLBuilder';
import './ScheduleView.css';

function ScheduleView({ data, loading, error, filter = {}, title }) {
  const [filteredData, setFilteredData] = useState([]);
  const [searchParams] = useSearchParams();
  const [partnerParams, setPartnerParams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'starttime', direction: 'asc' });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Extract partner params from URL
  useEffect(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    setPartnerParams(params);
  }, [searchParams]);

  // Consolidate duplicate matches with same ID but different networks
  const consolidateMatches = useCallback((matches) => {
    if (!matches || matches.length === 0) return [];
    
    const matchMap = new Map();
    
    matches.forEach(match => {
      const matchId = match.id;
      
      if (matchMap.has(matchId)) {
        // Match already exists, add this network to its networks array
        const existingMatch = matchMap.get(matchId);
        
        // Create networks array if it doesn't exist
        if (!existingMatch.networks) {
          existingMatch.networks = [
            {
              network: existingMatch.network,
              networkUrl: existingMatch.networkUrl,
              isRegional: existingMatch.regionalRestrictions || existingMatch.isRegional
            }
          ];
        }
        
        // Add the new network
        existingMatch.networks.push({
          network: match.network,
          networkUrl: match.networkUrl,
          isRegional: match.regionalRestrictions || match.isRegional
        });
        
        // If any network is not regional, the match is not considered regional
        if (!(match.regionalRestrictions || match.isRegional)) {
          existingMatch.regionalRestrictions = false;
        }
        
        // Update the map
        matchMap.set(matchId, existingMatch);
      } else {
        // New unique match
        matchMap.set(matchId, { ...match });
      }
    });
    
    // Convert map back to array
    return Array.from(matchMap.values());
  }, []);

  // Memoize the filtering and sorting logic
  const filterAndSortData = useCallback(() => {
    if (!data || data.length === 0) return [];

    // First consolidate matches with the same ID
    let consolidated = consolidateMatches(data);
    let filtered = [...consolidated];

    // Apply filters based on the filter prop
    if (filter.type === 'regional' && filter.value === true) {
      filtered = filtered.filter(
        match => match.regionalRestrictions === true || match.isRegional === true
      );
    } else if (filter.type === 'sport' && filter.value) {
      filtered = filtered.filter(
        match => match.sport && match.sport.toLowerCase() === filter.value.toLowerCase()
      );
    } else if (filter.type === 'league' && filter.value) {
      filtered = filtered.filter(
        match => match.league && match.league.toLowerCase().includes(filter.value.toLowerCase())
      );
    } else if (filter.type === 'country' && filter.value) {
      filtered = filtered.filter(match => match.country === filter.value);
    } else if (filter.type === 'category' && filter.value) {
      // For entertainment vs sports filtering
      if (filter.value === 'entertainment') {
        filtered = filtered.filter(
          match =>
            ![
              'baseball',
              'basketball',
              'football',
              'soccer',
              'hockey',
              'cricket',
              'tennis',
              'golf',
            ].includes(match.sport.toLowerCase())
        );
      }
    } else if (filter.type === 'latino' && filter.value) {
      // For Latino content
      filtered = filtered.filter(
        match =>
          (match.network && match.network.toLowerCase().includes('telemundo')) ||
          (match.network && match.network.toLowerCase().includes('univision')) ||
          (match.network && match.network.toLowerCase().includes('deportes'))
      );

      // Further filter by sports or entertainment
      if (filter.value === 'sports') {
        filtered = filtered.filter(match =>
          [
            'baseball',
            'basketball',
            'football',
            'soccer',
            'hockey',
            'cricket',
            'tennis',
            'golf',
          ].includes(match.sport.toLowerCase())
        );
      } else if (filter.value === 'entertainment') {
        filtered = filtered.filter(
          match =>
            ![
              'baseball',
              'basketball',
              'football',
              'soccer',
              'hockey',
              'cricket',
              'tennis',
              'golf',
            ].includes(match.sport.toLowerCase())
        );
      }
    } else if (filter.type === 'key') {
      // Key events filtering - could be based on specific criteria
      filtered = filtered.filter(
        match =>
          // Example criteria for key events: major leagues or special events
          (match.league &&
            ['MLB', 'NFL', 'NBA', 'NHL', 'UEFA Champions League'].includes(match.league)) ||
          (match.title && match.title.toLowerCase().includes('championship'))
      );
    } else if (filter.type === 'networks') {
      // Just show unique networks
      const uniqueNetworks = [];
      const networkSet = new Set();

      filtered.forEach(match => {
        // Check both network property and networks array
        if (match.networks) {
          match.networks.forEach(networkInfo => {
            if (!networkSet.has(networkInfo.network)) {
              networkSet.add(networkInfo.network);
              uniqueNetworks.push({
                id: match.id,
                network: networkInfo.network,
                networkUrl: networkInfo.networkUrl,
                title: networkInfo.network,
                sport: 'Network',
                starttime: match.starttime || match.startTime,
              });
            }
          });
        } else if (match.network && !networkSet.has(match.network)) {
          networkSet.add(match.network);
          uniqueNetworks.push({
            id: match.id,
            network: match.network,
            networkUrl: match.networkUrl,
            title: match.network,
            sport: 'Network',
            starttime: match.starttime || match.startTime,
          });
        }
      });

      filtered = uniqueNetworks;
    } else if (filter.type === 'rsn') {
      // Filter for Regional Sports Networks
      filtered = filtered.filter(match => {
        // Check if the main network is an RSN
        if (match.network && 
            (match.network.includes('SportsNet') || 
             match.network.includes('RSN') || 
             match.regionalRestrictions === true || 
             match.isRegional === true)) {
          return true;
        }
        
        // Check networks array if it exists
        if (match.networks) {
          return match.networks.some(networkInfo => 
            networkInfo.network.includes('SportsNet') || 
            networkInfo.network.includes('RSN') || 
            networkInfo.isRegional === true
          );
        }
        
        return false;
      });
    }

    // Apply search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => {
        // Check title, sport, league, main network
        const basicMatch = 
          (match.title && match.title.toLowerCase().includes(term)) ||
          (match.sport && match.sport.toLowerCase().includes(term)) ||
          (match.league && match.league.toLowerCase().includes(term)) ||
          (match.network && match.network.toLowerCase().includes(term));
          
        // Also check networks array if it exists
        const networksMatch = match.networks ? 
          match.networks.some(networkInfo => 
            networkInfo.network.toLowerCase().includes(term)
          ) : false;
          
        return basicMatch || networksMatch;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle both starttime and startTime formats
        let aValue =
          a[sortConfig.key] || a[sortConfig.key === 'starttime' ? 'startTime' : sortConfig.key];
        let bValue =
          b[sortConfig.key] || b[sortConfig.key === 'starttime' ? 'startTime' : sortConfig.key];

        if (!aValue) return 1;
        if (!bValue) return -1;

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, filter, searchTerm, sortConfig, consolidateMatches]);

  // Update filtered data when dependencies change
  useEffect(() => {
    setFilteredData(filterAndSortData());
  }, [filterAndSortData]);

  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = key => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const openUrlBuilder = match => {
    setSelectedMatch(match);
  };

  const closeUrlBuilder = () => {
    setSelectedMatch(null);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  // Helper function to get sport logo
  const getSportLogo = match => {
    if (!match) return null;
    
    // Check for thumbnail from the JSON feed first
    if (match.thumbnail) return match.thumbnail;
    
    // Then check for logo if available
    if (match.logo) return match.logo;
    
    // Fall back to Fubo league placeholder logo
    return 'https://imgx.fubo.tv/league_logos/league_placeholder.png';
  };

  // Helper function to render network tags
  const renderNetworkTags = match => {
    if (match.networks && match.networks.length > 0) {
      return match.networks.map((networkInfo, index) => (
        <span key={index} className={`match-network ${networkInfo.isRegional ? 'regional' : 'national'}`}>
          {networkInfo.network}
          {networkInfo.isRegional ? 
            <span className="regional-indicator">REGIONAL</span> : 
            <span className="national-indicator">NATIONAL</span>
          }
        </span>
      ));
    } else if (match.network) {
      const isRegional = match.regionalRestrictions || match.isRegional;
      return (
        <span className={`match-network ${isRegional ? 'regional' : 'national'}`}>
          {match.network}
          {isRegional ? 
            <span className="regional-indicator">REGIONAL</span> : 
            <span className="national-indicator">NATIONAL</span>
          }
        </span>
      );
    }
    return <span className="match-network">No network info</span>;
  };

  if (loading) return <div className="loading">Loading schedule data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="schedule-container">
      <div className="content-card">
        <h1>{title || 'Sports Schedule'}</h1>

        <div className="schedule-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search events, teams, networks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
          </div>

          <div className="results-count">
            Showing {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>

      <div className="content-card">
        {viewMode === 'list' ? (
          <div className="matches-list">
            {filteredData.length > 0 ? (
              <>
                {filteredData.map((match, index) => {
                  // Handle both starttime and startTime formats
                  const timeString = match.starttime || match.startTime;
                  const { datePart, timePart } = convertToEasternTime(timeString);
                  
                  return (
                    <div key={index} className="match-row">
                      <div className="match-logo">
                        <img src={getSportLogo(match)} alt={match.sport || 'Sport'} />
                      </div>
                      <div className="match-info">
                        <div className="match-title">{match.title}</div>
                        <div className="match-details">
                          <div className="match-date-time">
                            <span className="date-icon">📅</span> {datePart}
                            <span className="time-icon">🕒</span> {timePart} EST
                          </div>
                          <div className="match-metadata">
                            <div className="networks-container">
                              {renderNetworkTags(match)}
                            </div>
                            {match.league && <span className="match-league">{match.league}</span>}
                            {match.sport && <span className="match-sport">{match.sport}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="match-actions">
                        <button className="btn btn-primary" onClick={() => openUrlBuilder(match)}>
                          Generate Link
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="regional-note">
                  <p>
                    <strong>Note:</strong> Networks are marked as either{' '}
                    <span className="regional-example">REGIONAL</span> (geographic viewing restrictions) or{' '}
                    <span className="national-example">NATIONAL</span> (available nationwide).
                  </p>
                </div>
              </>
            ) : (
              <div className="no-results">No events found matching your criteria</div>
            )}
          </div>
        ) : (
          <>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('network')}>Networks{getSortIndicator('network')}</th>
                  <th onClick={() => handleSort('starttime')}>Date{getSortIndicator('starttime')}</th>
                  <th>Time</th>
                  <th onClick={() => handleSort('league')}>League{getSortIndicator('league')}</th>
                  <th onClick={() => handleSort('title')}>Matchup{getSortIndicator('title')}</th>
                  <th onClick={() => handleSort('sport')}>Sport{getSortIndicator('sport')}</th>
                  <th>Regional</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((match, index) => {
                    // Handle both starttime and startTime formats
                    const timeString = match.starttime || match.startTime;
                    const { datePart, timePart } = convertToEasternTime(timeString);
                    
                    // Handle networks column display
                    let networksDisplay;
                    if (match.networks && match.networks.length > 0) {
                      networksDisplay = match.networks.map(n => 
                        n.isRegional ? `${n.network} (REGIONAL)` : `${n.network} (NATIONAL)`
                      ).join(', ');
                    } else {
                      const isRegional = match.regionalRestrictions || match.isRegional;
                      networksDisplay = isRegional ? 
                        `${match.network} (REGIONAL)` : 
                        `${match.network} (NATIONAL)`;
                    }
                    
                    // Determine if regional
                    let isRegional = match.regionalRestrictions || match.isRegional;
                    if (match.networks) {
                      isRegional = match.networks.some(n => n.isRegional);
                    }
                    
                    return (
                      <tr key={index}>
                        <td>{networksDisplay}</td>
                        <td>{datePart}</td>
                        <td>{timePart}</td>
                        <td>{match.league || match.sport}</td>
                        <td>{match.title}</td>
                        <td>{match.sport}</td>
                        <td className={isRegional ? 'regional-cell' : ''}>{isRegional ? 'Yes' : 'No'}</td>
                        <td>
                          <button className="btn btn-secondary" onClick={() => openUrlBuilder(match)}>
                            Generate Link
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      No events found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="regional-note">
              <p>
                <strong>Note:</strong> Networks are marked as either{' '}
                <span className="regional-example">REGIONAL</span> (geographic viewing restrictions) or{' '}
                <span className="national-example">NATIONAL</span> (available nationwide).
              </p>
            </div>
          </>
        )}
      </div>

      {selectedMatch && <URLBuilder match={selectedMatch} onClose={closeUrlBuilder} />}
    </div>
  );
}

export default ScheduleView;
