import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScheduleView from './components/ScheduleView';
import KeyEventsView from './components/KeyEventsView';
import SheetsExplorer from './components/SheetsExplorer';
import PartnerConfig from './components/PartnerConfig';
import Navigation from './components/Navigation';
import LandingPagesView from './components/LandingPagesView';
import FuboMatches from './components/FuboMatches';
import MoviesView from './components/MoviesView';
import SeriesView from './components/SeriesView';
import { getFuboTvMatches } from './utils/fuboTvApi';
import { getFuboTvMovies, getFuboTvSeries } from './utils/fuboContentApi';
import './App.css';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Log additional details about the error
  console.error('Error message:', event.error?.message);
  console.error('Error stack:', event.error?.stack);
  console.error('Error type:', event.error?.constructor?.name);
  console.error('Error event:', event);
  
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px;">
      <h3>Application Error</h3>
      <p>The application encountered an error: ${event.error?.message || 'Unknown error'}</p>
      <p>Error type: ${event.error?.constructor?.name || 'Unknown'}</p>
      <p>Please check the console for more details or refresh the page.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Refresh Page
      </button>
    </div>
  `;
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Rejection reason:', event.reason?.message);
  console.error('Rejection stack:', event.reason?.stack);
  console.error('Rejection type:', event.reason?.constructor?.name);
  console.error('Rejection event:', event);
});

// Simple loading component
const LoadingComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Loading...</h2>
    <p>Please wait while we load the data.</p>
  </div>
);

// Simple error component
const ErrorComponent = ({ message }) => (
  <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
    <h2>Error</h2>
    <p>{message || 'An error occurred while loading the data.'}</p>
    <button 
      onClick={() => window.location.reload()} 
      style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
    >
      Refresh Page
    </button>
  </div>
);

function App() {
  const [sportsData, setSportsData] = useState([]);
  const [moviesData, setMoviesData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appState, setAppState] = useState({
    lastAction: 'init',
    dataLoadStatus: {
      sports: 'pending',
      movies: 'pending',
      series: 'pending'
    }
  });

  // Fetch data from the Fubo TV APIs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'starting data fetch',
          dataLoadStatus: {
            sports: 'loading',
            movies: 'pending',
            series: 'pending'
          }
        }));
        
        // Fetch sports data
        console.log('Starting to fetch Fubo TV matches...');
        let matches;
        try {
          matches = await getFuboTvMatches();
          
          if (Array.isArray(matches) && matches.length > 0) {
            console.log(`Successfully loaded ${matches.length} matches from Fubo TV API`);
            setSportsData(matches);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                sports: 'success'
              }
            }));
          } else {
            console.warn('Fubo TV Sports API returned empty or invalid data');
            setSportsData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                sports: 'empty'
              }
            }));
          }
        } catch (sportsError) {
          console.error('Error fetching sports data:', sportsError);
          setSportsData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              sports: 'error'
            }
          }));
        }
        
        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'fetching movies',
          dataLoadStatus: {
            ...prev.dataLoadStatus,
            movies: 'loading'
          }
        }));
        
        // Fetch movies data
        console.log('Starting to fetch Fubo TV movies...');
        let movies;
        try {
          movies = await getFuboTvMovies();
          
          if (Array.isArray(movies) && movies.length > 0) {
            console.log(`Successfully loaded ${movies.length} movies from Fubo TV API`);
            setMoviesData(movies);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                movies: 'success'
              }
            }));
          } else {
            console.warn('Fubo TV Movies API returned empty or invalid data');
            setMoviesData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                movies: 'empty'
              }
            }));
          }
        } catch (moviesError) {
          console.error('Error fetching movies data:', moviesError);
          setMoviesData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              movies: 'error'
            }
          }));
        }
        
        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'fetching series',
          dataLoadStatus: {
            ...prev.dataLoadStatus,
            series: 'loading'
          }
        }));
        
        // Fetch series data
        console.log('Starting to fetch Fubo TV series...');
        let series;
        try {
          series = await getFuboTvSeries();
          
          if (Array.isArray(series) && series.length > 0) {
            console.log(`Successfully loaded ${series.length} TV series from Fubo TV API`);
            setSeriesData(series);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                series: 'success'
              }
            }));
          } else {
            console.warn('Fubo TV Series API returned empty or invalid data');
            setSeriesData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                series: 'empty'
              }
            }));
          }
        } catch (seriesError) {
          console.error('Error fetching series data:', seriesError);
          setSeriesData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              series: 'error'
            }
          }));
        }
        
        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'data fetch complete'
        }));
      } catch (error) {
        console.error('Error in fetchAllData:', error);
        setError(`Failed to load data: ${error.message}`);
        setSportsData([]);
        setMoviesData([]);
        setSeriesData([]);
        setAppState(prev => ({
          ...prev,
          lastAction: 'error',
          dataLoadStatus: {
            sports: 'error',
            movies: 'error',
            series: 'error'
          }
        }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Add a debug component to show app state
  const DebugInfo = () => (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.7)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>Debug Info</h4>
      <div>Last Action: {appState.lastAction}</div>
      <div>Sports: {appState.dataLoadStatus.sports} ({sportsData ? sportsData.length : 0} items)</div>
      <div>Movies: {appState.dataLoadStatus.movies} ({moviesData ? moviesData.length : 0} items)</div>
      <div>Series: {appState.dataLoadStatus.series} ({seriesData ? seriesData.length : 0} items)</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Error: {error ? error : 'none'}</div>
    </div>
  );

  // If there's an error, show the error component
  if (error) {
    return (
      <div className="app">
        <ErrorComponent message={error} />
        <DebugInfo />
      </div>
    );
  }

  // If still loading, show the loading component
  if (loading) {
    return (
      <div className="app">
        <LoadingComponent />
        <DebugInfo />
      </div>
    );
  }

  // Main app render
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{}} 
                title="Full Live Sports Schedule"
              />} 
            />
            <Route path="/key-events" element={<KeyEventsView />} />
            <Route path="/sheets" element={<SheetsExplorer />} />
            <Route path="/landing-pages" element={<LandingPagesView />} />
            
            {/* Movies and TV Series routes */}
            <Route 
              path="/movies" 
              element={<MoviesView 
                data={moviesData}
                loading={loading}
                error={error}
                filter={{}} 
                title="Movies on Fubo"
              />} 
            />
            <Route 
              path="/movies/action" 
              element={<MoviesView 
                data={moviesData}
                loading={loading}
                error={error}
                filter={{type: 'genre', value: 'action'}} 
                title="Action Movies on Fubo"
              />} 
            />
            <Route 
              path="/movies/comedy" 
              element={<MoviesView 
                data={moviesData}
                loading={loading}
                error={error}
                filter={{type: 'genre', value: 'comedy'}} 
                title="Comedy Movies on Fubo"
              />} 
            />
            <Route 
              path="/movies/drama" 
              element={<MoviesView 
                data={moviesData}
                loading={loading}
                error={error}
                filter={{type: 'genre', value: 'drama'}} 
                title="Drama Movies on Fubo"
              />} 
            />
            <Route 
              path="/series" 
              element={<SeriesView 
                data={seriesData}
                loading={loading}
                error={error}
                filter={{}} 
                title="TV Series on Fubo"
              />} 
            />
            <Route 
              path="/series/drama" 
              element={<SeriesView 
                data={seriesData}
                loading={loading}
                error={error}
                filter={{type: 'genre', value: 'drama'}} 
                title="Drama Series on Fubo"
              />} 
            />
            <Route 
              path="/series/comedy" 
              element={<SeriesView 
                data={seriesData}
                loading={loading}
                error={error}
                filter={{type: 'genre', value: 'comedy'}} 
                title="Comedy Series on Fubo"
              />} 
            />
            
            {/* Sport-specific routes */}
            <Route 
              path="/sport/soccer" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'soccer'}} 
                title="Soccer on Fubo"
              />} 
            />
            <Route 
              path="/sport/nfl" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'football'}} 
                title="NFL on Fubo"
              />} 
            />
            <Route 
              path="/sport/nba" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'basketball'}} 
                title="NBA & WNBA on Fubo"
              />} 
            />
            <Route 
              path="/sport/nhl" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'sport', value: 'hockey'}} 
                title="NHL on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-basketball" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college basketball'}} 
                title="College Basketball on Fubo"
              />} 
            />
            <Route 
              path="/sport/college-football" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'league', value: 'college football'}} 
                title="College Football on Fubo"
              />} 
            />
            <Route 
              path="/sport/canada" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'country', value: 'CA'}} 
                title="Canada Sports on Fubo"
              />} 
            />
            <Route 
              path="/sport/cricket" 
              element={<ScheduleView 
                data={sportsData} 
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
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'category', value: 'entertainment'}} 
                title="US Entertainment on Fubo"
              />} 
            />
            <Route 
              path="/latino-sports" 
              element={<ScheduleView 
                data={sportsData} 
                loading={loading} 
                error={error} 
                filter={{type: 'latino', value: 'sports'}} 
                title="Latino Sports on Fubo"
              />} 
            />
            <Route 
              path="/latino-entertainment" 
              element={<ScheduleView 
                data={sportsData} 
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
                data={sportsData} 
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
        <DebugInfo />
      </div>
    </Router>
  );
}

export default App; 