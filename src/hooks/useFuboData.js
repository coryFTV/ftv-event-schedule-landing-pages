import { useState, useEffect } from 'react';
import { getFuboTvMatches } from '../utils/fuboTvApi';
import { getFuboTvMovies, getFuboTvSeries } from '../utils/fuboContentApi';

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
                sports: 'success',
              },
            }));
          } else {
            console.warn('Fubo TV Sports API returned empty or invalid data');
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
          console.error('Error fetching sports data:', sportsError);
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
                movies: 'success',
              },
            }));
          } else {
            console.warn('Fubo TV Movies API returned empty or invalid data');
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
          console.error('Error fetching movies data:', moviesError);
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
                series: 'success',
              },
            }));
          } else {
            console.warn('Fubo TV Series API returned empty or invalid data');
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
          console.error('Error fetching series data:', seriesError);
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
        console.error('Error in data fetching process:', error);
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
