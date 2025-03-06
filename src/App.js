import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './components/Navigation';
import AppRoutes from './routes/AppRoutes';
import DebugInfo from './components/common/DebugInfo';
import LoadingComponent from './components/common/LoadingComponent';
import ErrorComponent from './components/common/ErrorComponent';
import NotificationCenter from './components/common/NotificationCenter';
import useFuboData from './hooks/useFuboData';
import { setupGlobalErrorHandlers } from './utils/errorHandlers';
import './App.css';

// Set up global error handlers
setupGlobalErrorHandlers();

/**
 * Main application component
 * @returns {JSX.Element} App component
 */
function App() {
  // Use custom hook to fetch and manage data
  const { sportsData, moviesData, seriesData, loading, error, appState } = useFuboData();

  // Log application state changes
  useEffect(() => {
    console.log('App state updated:', appState);
  }, [appState]);

  // Show loading component while data is being fetched
  if (loading) {
    return (
      <>
        <LoadingComponent />
        <NotificationCenter />
      </>
    );
  }

  // Show error component if there was an error
  if (error) {
    return (
      <>
        <ErrorComponent message={error} />
        <NotificationCenter />
      </>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="content-container">
          <AppRoutes
            sportsData={sportsData}
            moviesData={moviesData}
            seriesData={seriesData}
            loading={loading}
            error={error}
          />
        </main>
        <DebugInfo appState={appState} />
        <NotificationCenter />
      </div>
    </Router>
  );
}

export default App;
