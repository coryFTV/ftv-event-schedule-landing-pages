import React, { useState, useEffect } from 'react';
import { getFuboTvMovies } from '../utils/fuboContentApi';
import { convertToEasternTime } from '../utils/helpers';
import URLBuilder from './URLBuilder';
import './ScheduleView.css'; // Reuse the same styling

function MoviesView({ data, loading: externalLoading, error: externalError, filter = {}, title = "Movies on Fubo" }) {
  const [localData, setLocalData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });

  // Determine if we should use external data or fetch our own
  const isUsingExternalData = data !== undefined;
  const effectiveLoading = isUsingExternalData ? externalLoading : localLoading;
  const effectiveError = isUsingExternalData ? externalError : localError;
  const effectiveData = isUsingExternalData ? data : localData;

  // Only fetch data if it's not provided externally
  useEffect(() => {
    if (isUsingExternalData) {
      console.log('Using externally provided movie data:', data?.length || 0, 'items');
      return; // Skip fetching if data is provided externally
    }

    const fetchMovies = async () => {
      try {
        console.log('Fetching movies data locally');
        setLocalLoading(true);
        setLocalError(null);
        
        // Get movies with optional filters
        const options = {};
        if (filter.genre) options.genre = filter.genre;
        if (filter.releaseYear) options.releaseYear = filter.releaseYear;
        
        const moviesData = await getFuboTvMovies(options);
        setLocalData(moviesData);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setLocalError(`Failed to load movies: ${err.message}`);
        setLocalData([]);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchMovies();
  }, [filter, isUsingExternalData, data]);

  useEffect(() => {
    if (!effectiveData || effectiveData.length === 0) {
      setFilteredData([]);
      return;
    }
    
    console.log(`Filtering ${effectiveData.length} movies`);
    let filtered = [...effectiveData];
    
    // Apply filters based on the filter prop
    if (filter.type === 'genre' && filter.value) {
      filtered = filtered.filter(movie => 
        (movie.genre && movie.genre.toLowerCase().includes(filter.value.toLowerCase()))
      );
    } else if (filter.type === 'releaseYear' && filter.value) {
      filtered = filtered.filter(movie => 
        (movie.releaseYear && movie.releaseYear === filter.value)
      );
    } else if (filter.type === 'rating' && filter.value) {
      filtered = filtered.filter(movie => 
        (movie.rating && movie.rating === filter.value)
      );
    }
    
    // Apply search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(movie => 
        (movie.title && movie.title.toLowerCase().includes(term)) ||
        (movie.genre && movie.genre.toLowerCase().includes(term)) ||
        (movie.director && movie.director.toLowerCase().includes(term)) ||
        (movie.description && movie.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
        
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
  }, [effectiveData, filter, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const openUrlBuilder = (movie) => {
    setSelectedMovie(movie);
  };

  const closeUrlBuilder = () => {
    setSelectedMovie(null);
  };

  if (effectiveLoading) {
    return (
      <div className="schedule-container">
        <div className="content-card">
          <h1>{title}</h1>
          <div className="loading">Loading movies...</div>
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
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
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
              placeholder="Search movies, genres, directors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="results-count">
            Showing {filteredData.length} {filteredData.length === 1 ? 'movie' : 'movies'}
          </div>
        </div>
      </div>
      
      <div className="content-card">
        <table className="schedule-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')}>
                Title{getSortIndicator('title')}
              </th>
              <th onClick={() => handleSort('releaseYear')}>
                Year{getSortIndicator('releaseYear')}
              </th>
              <th onClick={() => handleSort('genre')}>
                Genre{getSortIndicator('genre')}
              </th>
              <th onClick={() => handleSort('duration')}>
                Duration{getSortIndicator('duration')}
              </th>
              <th onClick={() => handleSort('rating')}>
                Rating{getSortIndicator('rating')}
              </th>
              <th onClick={() => handleSort('director')}>
                Director{getSortIndicator('director')}
              </th>
              <th onClick={() => handleSort('network')}>
                Network{getSortIndicator('network')}
              </th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((movie, index) => (
                <tr key={index}>
                  <td>{movie.title}</td>
                  <td>{movie.releaseYear}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.duration}</td>
                  <td>{movie.rating}</td>
                  <td>{movie.director}</td>
                  <td>{movie.network || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => openUrlBuilder(movie)}
                    >
                      Create URL
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No movies found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedMovie && (
        <URLBuilder 
          match={selectedMovie} 
          onClose={closeUrlBuilder} 
        />
      )}
    </div>
  );
}

export default MoviesView; 