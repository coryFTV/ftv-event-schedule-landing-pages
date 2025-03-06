import { useState, useEffect } from 'react';
import { getFuboMatches, getFuboMovies, getFuboSeries } from '../utils/fuboApi';
import { notifyError, notifyWarning, notifySuccess } from '../utils/notificationService';

/**
 * Custom hook to fetch and manage Fubo TV data (sports, movies, series)
 * @returns {Object} Data, loading state, error state, and app state
 */
export const useFuboData = () => {
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
      series: 'pending',
    },
  });

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
            series: 'pending',
          },
        }));

        // Fetch sports data
        try {
          const matches = await getFuboMatches();

          if (Array.isArray(matches) && matches.length > 0) {
            notifySuccess(`Successfully loaded ${matches.length} matches`);
            setSportsData(matches);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                sports: 'success',
              },
            }));
          } else {
            notifyWarning('No sports matches found');
            setSportsData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                sports: 'empty',
              },
            }));
          }
        } catch (sportsError) {
          notifyError(`Error loading sports data: ${sportsError.message}`);
          setSportsData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              sports: 'error',
            },
          }));
        }

        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'fetching movies',
          dataLoadStatus: {
            ...prev.dataLoadStatus,
            movies: 'loading',
          },
        }));

        // Fetch movies data
        try {
          const movies = await getFuboMovies();

          if (Array.isArray(movies) && movies.length > 0) {
            notifySuccess(`Successfully loaded ${movies.length} movies`);
            setMoviesData(movies);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                movies: 'success',
              },
            }));
          } else {
            notifyWarning('No movies found');
            setMoviesData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                movies: 'empty',
              },
            }));
          }
        } catch (moviesError) {
          notifyError(`Error loading movies data: ${moviesError.message}`);
          setMoviesData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              movies: 'error',
            },
          }));
        }

        // Update app state
        setAppState(prev => ({
          ...prev,
          lastAction: 'fetching series',
          dataLoadStatus: {
            ...prev.dataLoadStatus,
            series: 'loading',
          },
        }));

        // Fetch series data
        try {
          const series = await getFuboSeries();

          if (Array.isArray(series) && series.length > 0) {
            notifySuccess(`Successfully loaded ${series.length} TV series`);
            setSeriesData(series);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                series: 'success',
              },
            }));
          } else {
            notifyWarning('No TV series found');
            setSeriesData([]);
            setAppState(prev => ({
              ...prev,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                series: 'empty',
              },
            }));
          }
        } catch (seriesError) {
          notifyError(`Error loading series data: ${seriesError.message}`);
          setSeriesData([]);
          setAppState(prev => ({
            ...prev,
            dataLoadStatus: {
              ...prev.dataLoadStatus,
              series: 'error',
            },
          }));
        }

        // Complete loading
        setAppState(prev => ({
          ...prev,
          lastAction: 'data fetch complete',
        }));
        setLoading(false);
      } catch (error) {
        notifyError(`Error in data fetching process: ${error.message}`);
        setError(error.message || 'An unexpected error occurred');
        setLoading(false);
        setAppState(prev => ({
          ...prev,
          lastAction: 'error in data fetch',
        }));
      }
    };

    fetchAllData();
  }, []);

  return { sportsData, moviesData, seriesData, loading, error, appState };
};

export default useFuboData;
