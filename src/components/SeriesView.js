import React, { useState, useEffect } from 'react';
import { getFuboTvSeries } from '../utils/fuboContentApi';
import URLBuilder from './URLBuilder';
import './ScheduleView.css'; // Reuse the same styling

function SeriesView({
  data,
  loading: externalLoading,
  error: externalError,
  filter = {},
  title = 'TV Series on Fubo',
}) {
  const [localData, setLocalData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
  const [retryCount, setRetryCount] = useState(0);

  // Determine if we should use external data or fetch our own
  const isUsingExternalData = data !== undefined;
  const effectiveLoading = isUsingExternalData ? externalLoading : localLoading;
  const effectiveError = isUsingExternalData ? externalError : localError;
  const effectiveData = isUsingExternalData ? data : localData;

  // Only fetch data if it's not provided externally
  useEffect(() => {
    if (isUsingExternalData) {
      console.log('Using externally provided series data:', data?.length || 0, 'items');
      return; // Skip fetching if data is provided externally
    }

    const fetchSeries = async () => {
      try {
        setLocalLoading(true);
        setLocalError(null);

        // Get series with optional filters
        const options = {};
        if (filter.genre) options.genre = filter.genre;

        console.log('SeriesView: Fetching TV series data...');
        const seriesData = await getFuboTvSeries(options);

        if (!seriesData || !Array.isArray(seriesData)) {
          console.warn('SeriesView: Received invalid data format', seriesData);
          setLocalData([]);
          setLocalError('Received invalid data format from the server');
        } else if (seriesData.length === 0) {
          console.warn('SeriesView: Received empty series data');
          setLocalData([]);
          setLocalError('No TV series data available');
        } else {
          console.log(`SeriesView: Successfully loaded ${seriesData.length} series`);
          setLocalData(seriesData);
          setLocalError(null);
        }
      } catch (err) {
        console.error('Error fetching TV series:', err);
        setLocalError(`Failed to load TV series: ${err.message}`);
        setLocalData([]);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchSeries();
  }, [filter, retryCount, isUsingExternalData, data]);

  useEffect(() => {
    if (!effectiveData || effectiveData.length === 0) {
      setFilteredData([]);
      return;
    }

    try {
      console.log(`Filtering ${effectiveData.length} TV series`);
      let filtered = [...effectiveData];

      // Apply filters based on the filter prop
      if (filter.type === 'genre' && filter.value) {
        filtered = filtered.filter(
          series => series.genre && series.genre.toLowerCase().includes(filter.value.toLowerCase())
        );
      } else if (filter.type === 'rating' && filter.value) {
        filtered = filtered.filter(series => series.rating && series.rating === filter.value);
      }

      // Apply search term filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          series =>
            (series.title && series.title.toLowerCase().includes(term)) ||
            (series.genre && series.genre.toLowerCase().includes(term)) ||
            (series.creator && series.creator.toLowerCase().includes(term)) ||
            (series.description && series.description.toLowerCase().includes(term))
        );
      }

      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;
          if (!a[sortConfig.key]) return 1;
          if (!b[sortConfig.key]) return -1;

          const aValue =
            typeof a[sortConfig.key] === 'string'
              ? a[sortConfig.key].toLowerCase()
              : a[sortConfig.key];
          const bValue =
            typeof b[sortConfig.key] === 'string'
              ? b[sortConfig.key].toLowerCase()
              : b[sortConfig.key];

          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }

      setFilteredData(filtered);
    } catch (err) {
      console.error('Error filtering/sorting data:', err);
      setFilteredData(effectiveData); // Fallback to unfiltered data
    }
  }, [effectiveData, filter, searchTerm, sortConfig]);

  const handleSort = key => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = key => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const openUrlBuilder = series => {
    setSelectedSeries(series);
  };

  const closeUrlBuilder = () => {
    setSelectedSeries(null);
  };

  const handleRetry = () => {
    if (isUsingExternalData) {
      window.location.reload(); // Reload the page if using external data
    } else {
      setRetryCount(prev => prev + 1); // Increment retry count to trigger a refetch
    }
  };

  if (effectiveLoading) {
    return (
      <div className="schedule-container">
        <div className="content-card">
          <h1>{title}</h1>
          <div className="loading">Loading TV series...</div>
        </div>
      </div>
    );
  }

  if (effectiveError) {
    return (
      <div className="schedule-container">
        <div className="content-card">
          <h1>{title}</h1>
          <div className="error-message">{effectiveError}</div>
          <button className="btn btn-primary" onClick={handleRetry}>
            Retry
          </button>
          <button className="btn btn-secondary" onClick={() => (window.location.href = '/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="content-card">
        <h1>{title}</h1>

        <div className="schedule-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search TV series, genres, creators..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="results-count">
            Showing {filteredData.length} {filteredData.length === 1 ? 'series' : 'series'}
          </div>
        </div>
      </div>

      <div className="content-card">
        {filteredData.length > 0 ? (
          <table className="schedule-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')}>Title{getSortIndicator('title')}</th>
                <th onClick={() => handleSort('seasons')}>Seasons{getSortIndicator('seasons')}</th>
                <th onClick={() => handleSort('episodes')}>
                  Episodes{getSortIndicator('episodes')}
                </th>
                <th onClick={() => handleSort('genre')}>Genre{getSortIndicator('genre')}</th>
                <th onClick={() => handleSort('rating')}>Rating{getSortIndicator('rating')}</th>
                <th onClick={() => handleSort('creator')}>Creator{getSortIndicator('creator')}</th>
                <th onClick={() => handleSort('network')}>Network{getSortIndicator('network')}</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((series, index) => (
                <tr key={index}>
                  <td>{series.title || 'Untitled'}</td>
                  <td>{series.seasons || 'N/A'}</td>
                  <td>{series.episodes || 'N/A'}</td>
                  <td>{series.genre || 'N/A'}</td>
                  <td>{series.rating || 'N/A'}</td>
                  <td>{series.creator || 'N/A'}</td>
                  <td>{series.network || 'N/A'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => openUrlBuilder(series)}>
                      Create URL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results-container">
            <p className="no-results">No TV series found matching your criteria</p>
            <button className="btn btn-primary" onClick={handleRetry}>
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {selectedSeries && <URLBuilder match={selectedSeries} onClose={closeUrlBuilder} />}
    </div>
  );
}

export default SeriesView;
