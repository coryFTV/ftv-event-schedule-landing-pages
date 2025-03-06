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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the Fubo TV API
  useEffect(() => {
    const fetchFuboData = async () => {
      try {
        console.log('Starting to fetch Fubo TV matches...');
        const matches = await getFuboTvMatches();
        
        if (Array.isArray(matches) && matches.length > 0) {
          console.log(`Successfully loaded ${matches.length} matches from Fubo TV API`);
          setData(matches);
        } else {
          console.warn('Fubo TV API returned empty or invalid data');
          setError('Failed to load matches from Fubo TV API');
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching Fubo TV matches:', error);
        setError(`Failed to load matches: ${error.message}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFuboData();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{}} 
                title="Full Live Sports Schedule"
              />} 
            />
            <Route path="/key-events" element={<KeyEventsView />} />
            <Route path="/sheets" element={<SheetsExplorer />} />
            <Route path="/landing-pages" element={<LandingPagesView />} />
            
            {/* Sport-specific routes */}
            <Route 
              path="/sport/soccer" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'soccer'}} 
                title="Soccer on Fubo"
              />} 
            />
            <Route 
              path="/sport/nfl" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'football'}} 
                title="NFL on Fubo"
              />} 
            />
            <Route 
              path="/sport/nba" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'basketball'}} 
                title="NBA & WNBA on Fubo"
              />} 
            />
            <Route 
              path="/sport/nhl" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'hockey'}} 
                title="NHL on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-basketball" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college basketball'}} 
                title="College Basketball on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-football" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college football'}} 
                title="College Football on Fubo"
              />} 
            />
            <Route 
              path="/sport/canada" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'country', value: 'CA'}} 
                title="Canada Sports on Fubo"
              />} 
            />
            <Route 
              path="/sport/cricket" 
              element={<ScheduleView 
                data={data} 
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
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'category', value: 'entertainment'}} 
                title="US Entertainment on Fubo"
              />} 
            />
            <Route 
              path="/latino-sports" 
              element={<ScheduleView 
                data={data} 
                loading={loading} 
                error={error} 
                filter={{type: 'latino', value: 'sports'}} 
                title="Latino Sports on Fubo"
              />} 
            />
            <Route 
              path="/latino-entertainment" 
              element={<ScheduleView 
                data={data} 
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
                data={data} 
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