import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertToEasternTime, encodeForURL } from '../utils/helpers';
import URLBuilder from './URLBuilder';
import './ScheduleView.css';

function ScheduleView({ data, loading, error, filter = {}, title }) {
  const [filteredData, setFilteredData] = useState([]);
  const [searchParams] = useSearchParams();
  const [partnerParams, setPartnerParams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'starttime', direction: 'asc' });
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Extract partner params from URL
  useEffect(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    setPartnerParams(params);
  }, [searchParams]);

  // Memoize the filtering and sorting logic
  const filterAndSortData = useCallback(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

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
        if (match.network && !networkSet.has(match.network)) {
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
      filtered = filtered.filter(
        match =>
          match.network &&
          (match.network.includes('SportsNet') ||
            match.network.includes('RSN') ||
            match.regionalRestrictions === true ||
            match.isRegional === true)
      );
    }

    // Apply search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        match =>
          (match.title && match.title.toLowerCase().includes(term)) ||
          (match.sport && match.sport.toLowerCase().includes(term)) ||
          (match.league && match.league.toLowerCase().includes(term)) ||
          (match.network && match.network.toLowerCase().includes(term))
      );
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
  }, [data, filter, searchTerm, sortConfig]);

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

          <div className="results-count">
            Showing {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>

      <div className="content-card">
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
                return (
                  <tr key={index}>
                    <td>{match.network || 'N/A'}</td>
                    <td>{datePart}</td>
                    <td>{timePart}</td>
                    <td>{match.league || match.sport}</td>
                    <td>{match.title}</td>
                    <td>{match.sport}</td>
                    <td>{match.regionalRestrictions || match.isRegional ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => openUrlBuilder(match)}>
                        Create URL
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
      </div>

      {selectedMatch && <URLBuilder match={selectedMatch} onClose={closeUrlBuilder} />}
    </div>
  );
}

export default ScheduleView;
