import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScheduleView from './components/ScheduleView';
import KeyEventsView from './components/KeyEventsView';
import SheetsExplorer from './components/SheetsExplorer';
import PartnerConfig from './components/PartnerConfig';
import Navigation from './components/Navigation';
import LandingPagesView from './components/LandingPagesView';
import FuboMatches from './components/FuboMatches';
import { getFuboTvMatches } from './utils/fuboTvApi';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [fuboData, setFuboData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data from the original source
  useEffect(() => {
    // Use the CORS proxy for all environments
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/test-metadata'  // Local proxy for development
      : '/test-metadata';  // Proxy in production
    
    console.log(`Fetching matches data from: ${apiUrl}`);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`Loaded ${data.length} matches from original source`);
          setData(data);
        } else if (data && data.matches && Array.isArray(data.matches)) {
          // Handle case where data is wrapped in a matches property
          console.log(`Loaded ${data.matches.length} matches from original source`);
          setData(data.matches);
        } else {
          console.warn('Original source data is not an array:', data);
          setData([]);
        }
      })
      .catch(error => {
        console.error('Error fetching matches data:', error);
        setError(`Failed to load matches: ${error.message}`);
      });
  }, []);
  
  // Fetch data from the Fubo TV API
  useEffect(() => {
    const fetchFuboData = async () => {
      try {
        console.log('Starting to fetch Fubo TV matches...');
        const matches = await getFuboTvMatches();
        
        if (Array.isArray(matches) && matches.length > 0) {
          console.log(`Successfully loaded ${matches.length} matches from Fubo TV API`);
          setFuboData(matches);
        } else {
          console.warn('Fubo TV API returned empty or invalid data');
          setError('Failed to load matches from Fubo TV API');
          setFuboData([]);
        }
      } catch (error) {
        console.error('Error fetching Fubo TV matches:', error);
        setError(`Failed to load matches: ${error.message}`);
        setFuboData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFuboData();
  }, []);
  
  // Combine data from both sources
  useEffect(() => {
    // Make sure data is an array before trying to spread it
    if (data) {
      let combined = Array.isArray(data) ? [...data] : [];
      
      // Add Fubo TV data if available
      if (fuboData && Array.isArray(fuboData) && fuboData.length > 0) {
        // Add a source field to identify where the data came from
        const fuboDataWithSource = fuboData.map(match => ({
          ...match,
          source: 'fubo_api'
        }));
        
        // Add a source field to the original data
        const originalDataWithSource = combined.map(match => ({
          ...match,
          source: 'original'
        }));
        
        // Combine both datasets
        combined = [...originalDataWithSource, ...fuboDataWithSource];
        console.log(`Combined data has ${combined.length} matches`);
      } else if (combined.length > 0) {
        // If we only have original data, still add the source field
        combined = combined.map(match => ({
          ...match,
          source: 'original'
        }));
        console.log(`Only original data available with ${combined.length} matches`);
      } else {
        console.warn('No data available from either source');
      }
      
      setCombinedData(combined);
      setLoading(false);
    }
  }, [data, fuboData]);
  
  if (loading) return <div className="loading-container">Loading events data...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="content">
          <Routes>
            {/* Main routes */}
            <Route 
              path="/" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'all'}} 
                title="Full Live Sports Schedule"
              />} 
            />
            <Route 
              path="/key-events" 
              element={<KeyEventsView />} 
            />
            <Route 
              path="/sheets-explorer" 
              element={<SheetsExplorer />} 
            />
            <Route 
              path="/rsn-coverage" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'rsn'}} 
                title="RSN Coverage by League"
              />} 
            />
            <Route 
              path="/networks" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'networks'}} 
                title="Master Network List"
              />} 
            />
            <Route 
              path="/landing-pages" 
              element={<LandingPagesView />} 
            />
            
            {/* Sport-specific routes */}
            <Route 
              path="/sport/mlb" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'baseball'}} 
                title="MLB on Fubo"
              />} 
            />
            <Route 
              path="/sport/soccer" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'soccer'}} 
                title="Soccer on Fubo"
              />} 
            />
            <Route 
              path="/sport/nfl" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'football'}} 
                title="NFL on Fubo"
              />} 
            />
            <Route 
              path="/sport/nba" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'basketball'}} 
                title="NBA & WNBA on Fubo"
              />} 
            />
            <Route 
              path="/sport/nhl" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'hockey'}} 
                title="NHL on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-basketball" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college basketball'}} 
                title="College Basketball on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-football" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college football'}} 
                title="College Football on Fubo"
              />} 
            />
            <Route 
              path="/sport/canada" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'country', value: 'CA'}} 
                title="Canada Sports on Fubo"
              />} 
            />
            <Route 
              path="/sport/cricket" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'cricket'}} 
                title="Cricket on Fubo"
              />} 
            />
            
            {/* Entertainment routes */}
            <Route 
              path="/entertainment" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'category', value: 'entertainment'}} 
                title="US Entertainment on Fubo"
              />} 
            />
            <Route 
              path="/latino-sports" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'latino', value: 'sports'}} 
                title="Latino Sports on Fubo"
              />} 
            />
            <Route 
              path="/latino-entertainment" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'latino', value: 'entertainment'}} 
                title="Latino Entertainment on Fubo"
              />} 
            />
            
            {/* Legacy routes */}
            <Route 
              path="/local" 
              element={<ScheduleView 
                data={combinedData} 
                loading={loading} 
                error={error} 
                filter={{type: 'regional', value: true}} 
                title="Local Sports on Fubo"
              />} 
            />
            
            {/* Configuration */}
            <Route path="/partner-config" element={<PartnerConfig />} />
            <Route path="/fubo-matches" element={<FuboMatches />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 