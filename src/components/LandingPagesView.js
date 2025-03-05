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
        
        // If test endpoint fails, try the real API
        try {
          const data = await fetchLandingPages(apiFilters);
          if (data && data.Ads && Array.isArray(data.Ads)) {
            const normalizedData = normalizeData(data.Ads, 'impact');
            setLandingPages(normalizedData);
            setDataSource('impact');
          } else {
            throw new Error('Invalid data structure received from Impact Radius API');
          }
        } catch (impactError) {
          console.error('Impact Radius API failed:', impactError);
          
          // If Impact Radius API fails, try Fubo TV API as fallback
          try {
            const fuboData = await fetchFuboTvMatches();
            if (fuboData && Array.isArray(fuboData)) {
              const normalizedData = normalizeData(fuboData, 'fubo');
              setLandingPages(normalizedData);
              setDataSource('fubo');
            } else {
              throw new Error('Invalid data structure received from Fubo TV API');
            }
          } catch (fuboError) {
            console.error('Fubo TV API failed:', fuboError);
            
            // If all APIs fail, try the mock data endpoint
            try {
              const mockResponse = await fetch(proxyUrl);
              if (mockResponse.ok) {
                const mockData = await mockResponse.json();
                const normalizedData = normalizeData(mockData.Ads || mockData, 'mock');
                setLandingPages(normalizedData);
                setDataSource('mock');
              } else {
                throw new Error(`Mock API error: ${mockResponse.status}`);
              }
            } catch (mockError) {
              console.error('Mock data endpoint failed:', mockError);
              throw mockError;
            }
          }
        }
      } catch (error) {
        console.error('Error loading landing pages:', error);
        setError(error.message || 'Failed to load landing pages');
      } finally {
        setLoading(false);
      }
    };
    
    loadLandingPages();
  }, [filters, proxyUrl]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };
  
  const openLandingPageBuilder = (landingPage) => {
    setSelectedLandingPage(landingPage);
    setShowLandingPageBuilder(true);
  };
  
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
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  
  const retryFetch = () => {
    // Reset error state and try loading again
    setError(null);
    
    // Reload the data
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from the test-impact endpoint first
        try {
          const testResponse = await fetch('http://localhost:3001/test-impact');
          if (testResponse.ok) {
            const testData = await testResponse.json();
            
            if (testData.Ads && Array.isArray(testData.Ads)) {
              const normalizedData = normalizeData(testData.Ads, 'impact');
              setLandingPages(normalizedData);
              setDataSource('impact');
              setLoading(false);
              return;
            }
          }
        } catch (testError) {
          console.error('Test impact endpoint failed on retry:', testError);
        }
        
        // If test endpoint fails, try the mock data endpoint
        try {
          const mockResponse = await fetch(proxyUrl);
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            const normalizedData = normalizeData(mockData.Ads || mockData, 'mock');
            setLandingPages(normalizedData);
            setDataSource('mock');
          } else {
            throw new Error(`Mock API error: ${mockResponse.status}`);
          }
        } catch (mockError) {
          console.error('Mock data endpoint failed on retry:', mockError);
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  };
  
  const handleExport = () => {
    // Prepare data for export
    const exportData = sortedLandingPages.map(page => ({
      'Landing Page Name': page.name,
      'URL': page.url,
      'Type': page.type,
      'Mobile Ready': page.mobileReady ? 'Yes' : 'No',
      'Last Updated': page.dateLastUpdated,
      'Status': page.status
    }));
    
    // Download as CSV
    downloadCSV(exportData, 'fubo-landing-pages.csv');
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading landing pages..." />;
  }
  
  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        retryAction={retryFetch}
      />
    );
  }
  
  if (showLandingPageBuilder) {
    return (
      <LandingPageBuilder 
        landingPage={selectedLandingPage}
        onClose={closeLandingPageBuilder}
      />
    );
  }
  
  // Render the landing pages view
  return (
    <div className="landing-pages-container">
      <div className="content-card">
        <h1>Fubo Landing Pages</h1>
        
        <div className="controls-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search landing pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <div className="filter-group">
              <label htmlFor="Type">Type:</label>
              <select 
                name="Type" 
                id="Type" 
                value={filters.Type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Standard">Standard</option>
                <option value="Vanity">Vanity</option>
                <option value="Promotional">Promotional</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="MobileReady">Mobile Ready:</label>
              <select 
                name="MobileReady" 
                id="MobileReady" 
                value={filters.MobileReady}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          
          <div className="export-container">
            <button 
              className="export-button" 
              onClick={handleExport}
              disabled={landingPages.length === 0}
            >
              Export to CSV
            </button>
          </div>
        </div>
        
        {dataSource === 'mock' && (
          <div className="mock-data-warning">
            <p>
              <strong>Note:</strong> Using mock data. Connect to the API for real data.
            </p>
          </div>
        )}
        
        {landingPages.length === 0 ? (
          <div className="no-results">
            <p>No landing pages found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="landing-pages-table-container">
              <table className="landing-pages-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>
                      Landing Page Name{getSortIndicator('name')}
                    </th>
                    <th onClick={() => handleSort('type')}>
                      Type{getSortIndicator('type')}
                    </th>
                    <th onClick={() => handleSort('mobileReady')}>
                      Mobile Ready{getSortIndicator('mobileReady')}
                    </th>
                    <th onClick={() => handleSort('dateLastUpdated')}>
                      Last Updated{getSortIndicator('dateLastUpdated')}
                    </th>
                    <th onClick={() => handleSort('status')}>
                      Status{getSortIndicator('status')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((page, index) => (
                    <tr key={page.id || index}>
                      <td className="event-title">{page.name}</td>
                      <td>{page.type}</td>
                      <td>{page.mobileReady ? 'Yes' : 'No'}</td>
                      <td>{page.dateLastUpdated}</td>
                      <td>{page.status}</td>
                      <td>
                        <button 
                          className="action-button"
                          onClick={() => openLandingPageBuilder(page)}
                        >
                          View/Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalItems={sortedLandingPages.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default LandingPagesView; 