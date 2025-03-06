import React, { useState, useEffect } from 'react';
import { getFuboTvMatches } from '../utils/fuboTvApi';
import Pagination from './Pagination';
import URLBuilder from './URLBuilder';
import './LandingPagesView.css';

function LandingPagesView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const matches = await getFuboTvMatches();
        setData(matches);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search term
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.sport && item.sport.toLowerCase().includes(searchLower)) ||
      (item.league && item.league.toLowerCase().includes(searchLower)) ||
      (item.network && item.network.toLowerCase().includes(searchLower))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const openUrlBuilder = (match) => {
    setSelectedMatch(match);
  };

  const closeUrlBuilder = () => {
    setSelectedMatch(null);
  };

  if (loading) {
    return <div className="loading">Loading landing pages...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="landing-pages-container">
      <div className="content-card">
        <h1>Fubo Landing Pages</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search landing pages..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="results-info">
          Showing {currentData.length} of {filteredData.length} landing pages
        </div>
      </div>

      <div className="content-card">
        <table className="landing-pages-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Sport</th>
              <th>League</th>
              <th>Network</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td>{item.sport}</td>
                  <td>{item.league}</td>
                  <td>{item.network}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openUrlBuilder(item)}
                    >
                      Create URL
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No landing pages found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
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

export default LandingPagesView; 