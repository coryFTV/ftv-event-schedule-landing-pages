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
        }));

        // Define data sources to fetch
        const dataSources = [
          { 
            type: 'sports', 
            fetchFn: getFuboMatches, 
            setDataFn: setSportsData 
          },
          { 
            type: 'movies', 
            fetchFn: getFuboMovies, 
            setDataFn: setMoviesData 
          },
          { 
            type: 'series', 
            fetchFn: getFuboSeries, 
            setDataFn: setSeriesData 
          }
        ];

        // Fetch all data sources in parallel
        const results = await Promise.allSettled(
          dataSources.map(async ({ type, fetchFn }) => {
            setAppState(prev => ({
              ...prev,
              lastAction: `fetching ${type}`,
              dataLoadStatus: {
                ...prev.dataLoadStatus,
                [type]: 'loading',
              },
            }));
            
            return { type, data: await fetchFn() };
          })
        );

        // Process results
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const { type, data } = result.value;
            const source = dataSources.find(source => source.type === type);
            
            if (!source) {
              console.error(`No data source found for type: ${type}`);
              return;
            }
            
            if (Array.isArray(data) && data.length > 0) {
              notifySuccess(`Successfully loaded ${data.length} ${type}`);
              source.setDataFn(data);
              setAppState(prev => ({
                ...prev,
                dataLoadStatus: {
                  ...prev.dataLoadStatus,
                  [type]: 'success',
                },
              }));
            } else {
              notifyWarning(`No ${type} found`);
              source.setDataFn([]);
              setAppState(prev => ({
                ...prev,
                dataLoadStatus: {
                  ...prev.dataLoadStatus,
                  [type]: 'empty',
                },
              }));
            }
          } else {
            // Handle rejected promises
            // Since we can't get the type from result.value (it's rejected), 
            // we need to match the index to determine which source failed
            const index = results.indexOf(result);
            if (index >= 0 && index < dataSources.length) {
              const { type, setDataFn } = dataSources[index];
              notifyError(`Error loading ${type} data: ${result.reason?.message || 'Unknown error'}`);
              setDataFn([]);
              setAppState(prev => ({
                ...prev,
                dataLoadStatus: {
                  ...prev.dataLoadStatus,
                  [type]: 'error',
                },
              }));
            } else {
              notifyError(`Error in data fetch: ${result.reason?.message || 'Unknown error'}`);
            }
          }
        });

        // Complete loading
        setAppState(prev => ({
          ...prev,
          lastAction: 'data fetch complete',
        }));
      } catch (error) {
        notifyError(`Error in data fetching process: ${error.message}`);
        setError(error.message || 'An unexpected error occurred');
        setAppState(prev => ({
          ...prev,
          lastAction: 'error in data fetch',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { sportsData, moviesData, seriesData, loading, error, appState };
};

export default useFuboData;
