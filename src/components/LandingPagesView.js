import React, { useState, useEffect } from 'react';
import { fetchLandingPages } from '../utils/impactRadiusApi';
import { fetchFuboTvMatches } from '../utils/fuboTvApi';
import { normalizeData, filterData, sortData } from '../utils/dataProcessing';
import { downloadCSV } from '../utils/exportHelpers';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import LandingPageBuilder from './LandingPageBuilder';
import './ScheduleView.css'; // Reusing the same styles
import './LandingPagesView.css'; // Additional styles specific to landing pages

function LandingPagesView() {
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateLastUpdated', direction: 'desc' });
  const [filters, setFilters] = useState({
    Type: '',
    MobileReady: '',
    DateLastUpdatedStart: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showLandingPageBuilder, setShowLandingPageBuilder] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState(null);
  const [dataSource, setDataSource] = useState('impact'); // 'impact' or 'fubo'

  const proxyUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/test-metadata' 
    : '/test-metadata';

  useEffect(() => {
    const loadLandingPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only include non-empty filters
        const apiFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        console.log('Fetching landing pages with filters:', apiFilters);
        
        // Try to fetch from the test-impact endpoint first
        try {
          const testResponse = await fetch('http://localhost:3001/test-impact');
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test impact endpoint response:', testData);
            
            if (testData.Ads && Array.isArray(testData.Ads)) {
              const normalizedData = normalizeData(testData.Ads, 'impact');
              setLandingPages(normalizedData);
              setDataSource('impact');
              setLoading(false);
              return;
            }
          } else {
            const errorText = await testResponse.text();
            console.error(`Impact API error (${testResponse.status}): ${errorText}`);
            throw new Error(`Impact API error: ${testResponse.status} - ${errorText}`);
          }
        } catch (testError) {
          console.error('Test impact endpoint failed:', testError);
          throw testError;
        }
        
        // Try to fetch from Fubo TV API
        try {
          console.log('Attempting to fetch from Fubo TV API');
          const fuboResponse = await fetch(proxyUrl);
          
          if (fuboResponse.ok) {
            const fuboData = await fuboResponse.json();
            console.log('Fubo TV API response:', fuboData);
            
            if (Array.isArray(fuboData)) {
              const normalizedData = normalizeData(fuboData, 'fubo');
              setLandingPages(normalizedData);
              setDataSource('fubo');
              setLoading(false);
              return;
            } else {
              console.error('Unexpected data structure from Fubo TV API:', fuboData);
              throw new Error('Unexpected data structure from Fubo TV API');
            }
          } else {
            const errorText = await fuboResponse.text();
            console.error(`Fubo TV API error (${fuboResponse.status}): ${errorText}`);
            throw new Error(`Fubo TV API error: ${fuboResponse.status} - ${errorText}`);
          }
        } catch (fuboError) {
          console.error('Fubo TV API fetch failed:', fuboError);
          throw fuboError;
        }
      } catch (error) {
        console.error('Error loading landing pages:', error);
        setError(`Failed to load landing pages: ${error.message}`);
        setLandingPages([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadLandingPages();
  }, [filters, proxyUrl]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Open landing page builder
  const openLandingPageBuilder = (landingPage) => {
    setSelectedLandingPage(landingPage);
    setShowLandingPageBuilder(true);
  };

  // Close landing page builder
  const closeLandingPageBuilder = () => {
    setShowLandingPageBuilder(false);
    setSelectedLandingPage(null);
  };

  // Apply search and filters
  const filteredLandingPages = filterData(landingPages, searchTerm, filters);
  
  // Apply sorting
  const sortedLandingPages = sortData(filteredLandingPages, sortConfig);
  
  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLandingPages.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Add a retry function
  const retryFetch = () => {
    // Reset data source to try all options again
    setDataSource('');
    // Reload landing pages
    setLoading(true);
    setError(null);
    
    // Only include non-empty filters
    const apiFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    // Try all data sources again
    const loadAllData = async () => {
      try {
        // Try Fubo TV API first
        try {
          const fuboData = await fetchFuboTvMatches();
          if (fuboData && fuboData.length > 0) {
            // Normalize and use Fubo data
            const normalizedData = normalizeData(fuboData, 'fubo');
            setLandingPages(normalizedData);
            setDataSource('fubo');
            setLoading(false);
            return;
          }
        } catch (fuboError) {
          console.error('Retry Fubo TV API fetch failed:', fuboError);
        }
        
        // Then try Impact Radius API
        try {
          const data = await fetchLandingPages(apiFilters);
          const normalizedData = normalizeData(data, 'impact');
          setLandingPages(normalizedData);
          setDataSource('impact');
          setLoading(false);
          return;
        } catch (impactError) {
          console.error('Retry Impact Radius API fetch failed:', impactError);
          setError('Failed to fetch data from all sources. Please try again later.');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error retrying data fetch:', err);
      }
    };
    
    loadAllData();
  };

  // Define CSV headers for export
  const csvHeaders = [
    { title: 'Name', key: 'title' },
    { title: 'Impact Ad ID', key: 'id' },
    { title: 'Landing Page URL', key: 'landingPageUrl' },
    { title: 'Last Updated', key: 'dateLastUpdated' },
    { title: 'Description', key: 'description' },
    { title: 'Type', key: 'adType' },
    { title: 'Campaign', key: 'campaignName' },
    { title: 'Date Created', key: 'dateCreated' },
    { title: 'Mobile Ready', key: 'mobileReady' },
    { title: 'Deal Name', key: 'dealName' },
    { title: 'Deal Description', key: 'dealDescription' },
    { title: 'Data Source', key: 'dataSource' }
  ];

  // Function to handle export
  const handleExport = () => {
    // Prepare data for CSV export
    const csvData = sortedLandingPages.map(page => ({
      ID: page.id,
      Title: page.title,
      Description: page.description,
      'Landing Page URL': page.landingPageUrl,
      'Ad Type': page.adType,
      'Campaign ID': page.campaignId,
      'Campaign Name': page.campaignName,
      'Date Created': page.dateCreated,
      'Last Updated': page.dateLastUpdated,
      'Mobile Ready': page.mobileReady ? 'Yes' : 'No',
      'Deal ID': page.dealId,
      'Deal Name': page.dealName,
      'Deal Description': page.dealDescription,
      'Data Source': page.dataSource || dataSource
    }));
    
    // Download as CSV
    downloadCSV(csvData, 'landing-pages-export.csv');
  };

  if (loading) return <LoadingSpinner message="Loading landing pages from Impact Radius..." />;
  if (error) return <ErrorDisplay error={error} retry={retryFetch} />;

  return (
    <div className="schedule-view">
      <h1>Fubo Landing Pages from Impact Radius</h1>
      
      {error && (
        <div className="error-container">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p>
            <strong>Troubleshooting:</strong> Check that the proxy server is running with <code>npm run proxy</code> in a separate terminal.
            Try accessing <a href="http://localhost:3001/test-impact" target="_blank" rel="noopener noreferrer">http://localhost:3001/test-impact</a> directly to test the API connection.
          </p>
          <button className="retry-button" onClick={retryFetch}>Retry</button>
        </div>
      )}
      
      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search landing pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label>Ad Type:</label>
            <select 
              name="Type" 
              value={filters.Type} 
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="BANNER">Banner</option>
              <option value="TEXT_LINK">Text Link</option>
              <option value="COUPON">Coupon</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Mobile Ready:</label>
            <select 
              name="MobileReady" 
              value={filters.MobileReady} 
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Updated Since:</label>
            <input 
              type="date" 
              name="DateLastUpdatedStart" 
              value={filters.DateLastUpdatedStart} 
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="export-container">
          <button 
            className="export-button"
            onClick={handleExport}
            disabled={sortedLandingPages.length === 0}
          >
            Export to CSV
          </button>
        </div>
        
        <div className="pagination-controls">
          <label>
            Items per page:
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-per-page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')}>
                Name {getSortIndicator('title')}
              </th>
              <th onClick={() => handleSort('id')}>
                Impact Ad ID {getSortIndicator('id')}
              </th>
              <th onClick={() => handleSort('dateLastUpdated')}>
                Last Updated {getSortIndicator('dateLastUpdated')}
              </th>
              <th>Landing Page URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(page => (
                <tr key={page.id}>
                  <td>
                    <div className="event-title">{page.title}</div>
                    {page.description && <div className="event-subtitle">{page.description}</div>}
                  </td>
                  <td>{page.id}</td>
                  <td>{new Date(page.dateLastUpdated).toLocaleDateString()}</td>
                  <td>
                    <a 
                      href={page.landingPageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="landing-page-link"
                    >
                      {page.landingPageUrl}
                    </a>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => window.open(page.landingPageUrl, '_blank')}
                    >
                      Visit
                    </button>
                    <button 
                      className="action-button generate-button"
                      onClick={() => openLandingPageBuilder(page)}
                    >
                      Generate Landing Page
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No landing pages found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {sortedLandingPages.length > 0 && (
        <div className="pagination-container">
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(sortedLandingPages.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedLandingPages.length)} of {sortedLandingPages.length} landing pages
          </div>
        </div>
      )}

      {showLandingPageBuilder && selectedLandingPage && (
        <LandingPageBuilder 
          landingPage={selectedLandingPage} 
          onClose={closeLandingPageBuilder} 
        />
      )}
    </div>
  );
}

export default LandingPagesView; 