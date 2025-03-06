import { renderHook, act } from '@testing-library/react-hooks';
import { useFuboData } from './useFuboData';
import { getFuboMatches, getFuboMovies, getFuboSeries } from '../utils/fuboApi';
import { notifyError, notifyWarning, notifySuccess } from '../utils/notificationService';

// Mock the API functions
jest.mock('../utils/fuboApi', () => ({
  getFuboMatches: jest.fn(),
  getFuboMovies: jest.fn(),
  getFuboSeries: jest.fn(),
}));

// Mock the notification service
jest.mock('../utils/notificationService', () => ({
  notifyError: jest.fn(),
  notifyWarning: jest.fn(),
  notifySuccess: jest.fn(),
}));

describe('useFuboData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state and empty data', () => {
    const { result } = renderHook(() => useFuboData());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.sportsData).toEqual([]);
    expect(result.current.moviesData).toEqual([]);
    expect(result.current.seriesData).toEqual([]);
    expect(result.current.appState.lastAction).toBe('init');
  });

  it('should fetch and process all data successfully', async () => {
    // Mock successful API responses
    const mockSportsData = [{ id: 'sport1', title: 'Sport 1' }];
    const mockMoviesData = [{ id: 'movie1', title: 'Movie 1' }];
    const mockSeriesData = [{ id: 'series1', title: 'Series 1' }];
    
    getFuboMatches.mockResolvedValue(mockSportsData);
    getFuboMovies.mockResolvedValue(mockMoviesData);
    getFuboSeries.mockResolvedValue(mockSeriesData);
    
    const { result, waitForNextUpdate } = renderHook(() => useFuboData());
    
    // Wait for all data to be fetched
    await waitForNextUpdate();
    
    // Verify that the hook has updated with the fetched data
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sportsData).toEqual(mockSportsData);
    expect(result.current.moviesData).toEqual(mockMoviesData);
    expect(result.current.seriesData).toEqual(mockSeriesData);
    expect(result.current.appState.lastAction).toBe('data fetch complete');
    
    // Verify that the API functions were called
    expect(getFuboMatches).toHaveBeenCalledTimes(1);
    expect(getFuboMovies).toHaveBeenCalledTimes(1);
    expect(getFuboSeries).toHaveBeenCalledTimes(1);
    
    // Verify that success notifications were shown
    expect(notifySuccess).toHaveBeenCalledTimes(3);
  });

  it('should handle empty data responses', async () => {
    // Mock empty API responses
    getFuboMatches.mockResolvedValue([]);
    getFuboMovies.mockResolvedValue([]);
    getFuboSeries.mockResolvedValue([]);
    
    const { result, waitForNextUpdate } = renderHook(() => useFuboData());
    
    // Wait for all data to be fetched
    await waitForNextUpdate();
    
    // Verify that the hook has updated with empty arrays
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sportsData).toEqual([]);
    expect(result.current.moviesData).toEqual([]);
    expect(result.current.seriesData).toEqual([]);
    
    // Verify that warning notifications were shown
    expect(notifyWarning).toHaveBeenCalledTimes(3);
    expect(notifyWarning).toHaveBeenCalledWith(expect.stringContaining('No sports found'));
    expect(notifyWarning).toHaveBeenCalledWith(expect.stringContaining('No movies found'));
    expect(notifyWarning).toHaveBeenCalledWith(expect.stringContaining('No series found'));
  });

  it('should handle API errors gracefully', async () => {
    // Mock API errors
    getFuboMatches.mockRejectedValue(new Error('Sports API error'));
    getFuboMovies.mockRejectedValue(new Error('Movies API error'));
    getFuboSeries.mockRejectedValue(new Error('Series API error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useFuboData());
    
    // Wait for all data to be fetched
    await waitForNextUpdate();
    
    // Verify that the hook has updated with empty arrays and no error state
    // (individual errors are handled within the hook)
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull(); // Main error is null because individual errors are handled
    expect(result.current.sportsData).toEqual([]);
    expect(result.current.moviesData).toEqual([]);
    expect(result.current.seriesData).toEqual([]);
    
    // Verify that error notifications were shown
    expect(notifyError).toHaveBeenCalledTimes(3);
    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Sports API error'));
    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Movies API error'));
    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Series API error'));
    
    // Verify that the app state reflects the errors
    expect(result.current.appState.dataLoadStatus.sports).toBe('error');
    expect(result.current.appState.dataLoadStatus.movies).toBe('error');
    expect(result.current.appState.dataLoadStatus.series).toBe('error');
  });

  it('should handle mixed success and error responses', async () => {
    // Mock mixed API responses
    const mockSportsData = [{ id: 'sport1', title: 'Sport 1' }];
    getFuboMatches.mockResolvedValue(mockSportsData);
    getFuboMovies.mockRejectedValue(new Error('Movies API error'));
    getFuboSeries.mockResolvedValue([]);
    
    const { result, waitForNextUpdate } = renderHook(() => useFuboData());
    
    // Wait for all data to be fetched
    await waitForNextUpdate();
    
    // Verify that the hook has updated with the correct data
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sportsData).toEqual(mockSportsData);
    expect(result.current.moviesData).toEqual([]);
    expect(result.current.seriesData).toEqual([]);
    
    // Verify that the appropriate notifications were shown
    expect(notifySuccess).toHaveBeenCalledWith(expect.stringContaining('Successfully loaded'));
    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Movies API error'));
    expect(notifyWarning).toHaveBeenCalledWith(expect.stringContaining('No series found'));
    
    // Verify that the app state reflects the mixed results
    expect(result.current.appState.dataLoadStatus.sports).toBe('success');
    expect(result.current.appState.dataLoadStatus.movies).toBe('error');
    expect(result.current.appState.dataLoadStatus.series).toBe('empty');
  });
}); 