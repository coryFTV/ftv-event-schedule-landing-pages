import React, { useEffect, Component, StrictMode } from 'react';
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
 * Error boundary component to catch rendering errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Only update state if component is still mounted
    if (this._isMounted) {
      this.setState({ errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <ErrorComponent 
            message={`Application Error: ${this.state.error?.message || 'Unknown error'}`} 
            details={this.state.errorInfo?.componentStack} 
          />
          <NotificationCenter />
        </>
      );
    }

    // Wrap children in Fragment to avoid extra DOM nodes
    return <>{this.props.children}</>;
  }
}

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
      <ErrorBoundary>
        <LoadingComponent />
        <NotificationCenter />
      </ErrorBoundary>
    );
  }

  // Show error component if there was an error
  if (error) {
    return (
      <ErrorBoundary>
        <ErrorComponent message={error} />
        <NotificationCenter />
      </ErrorBoundary>
    );
  }

  return (
    // Disable StrictMode in production to avoid double-mounting components
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
