/**
 * Tests for the Fubo API utility functions
 */

import { 
  fetchFuboData, 
  processMatchData, 
  processMovieData, 
  processSeriesData,
  getFuboMatches,
  getFuboMovies,
  getFuboSeries
} from './fuboApi';
import { notifyError, notifyWarning } from './notificationService';

// Mock notification service
jest.mock('./notificationService', () => ({
  notifyError: jest.fn(),
  notifyWarning: jest.fn(),
  notifySuccess: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Helper to setup fetch mock
const setupFetchMock = (data, ok = true) => {
  global.fetch.mockImplementationOnce(() => 
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    })
  );
};

describe('Fubo API Utilities', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    jest.clearAllMocks();
  });

  describe('fetchFuboData', () => {
    it('should fetch and return array data', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      setupFetchMock(mockData);

      const result = await fetchFuboData('matches');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should extract data from object with endpoint property', async () => {
      const mockData = { matches: [{ id: 1 }, { id: 2 }] };
      setupFetchMock(mockData);

      const result = await fetchFuboData('matches');
      expect(result).toEqual(mockData.matches);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await expect(fetchFuboData('matches')).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(notifyError).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      setupFetchMock({ error: 'Not found' }, false);

      await expect(fetchFuboData('matches')).rejects.toThrow('HTTP error');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(notifyError).toHaveBeenCalled();
    });

    it('should handle retry logic on temporary failures', async () => {
      // First attempt fails
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Temporary error')));
      
      // Second attempt succeeds
      const mockData = [{ id: 1 }];
      setupFetchMock(mockData);
      
      const result = await fetchFuboData('matches');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(notifyWarning).toHaveBeenCalled();
    });
  });

  describe('processMatchData', () => {
    it('should process match data correctly', () => {
      const mockMatches = [
        {
          id: '123',
          title: 'Team A vs Team B',
          hometeam: 'Team A',
          awayteam: 'Team B',
          sport: 'soccer'
        }
      ];

      const result = processMatchData(mockMatches);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123');
      expect(result[0].title).toBe('Team A vs Team B');
      expect(result[0].source).toBe('fubo_api');
    });

    it('should handle empty or invalid input', () => {
      expect(processMatchData(null)).toEqual([]);
      expect(processMatchData(undefined)).toEqual([]);
      expect(processMatchData({})).toEqual([]);
      expect(processMatchData([])).toEqual([]);
    });
  });

  describe('processMovieData', () => {
    it('should process movie data correctly', () => {
      const mockMovies = [
        {
          tmsId: '123',
          title: 'Test Movie',
          shortDescription: 'A test movie',
          genres: ['Action', 'Comedy']
        }
      ];

      const result = processMovieData(mockMovies);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123');
      expect(result[0].title).toBe('Test Movie');
      expect(result[0].description).toBe('A test movie');
      expect(result[0].genre).toBe('Action, Comedy');
      expect(result[0].source).toBe('fubo_movies');
      expect(result[0].league_id).toBe('movies');
    });

    it('should handle empty or invalid input', () => {
      expect(processMovieData(null)).toEqual([]);
      expect(processMovieData(undefined)).toEqual([]);
      expect(processMovieData({})).toEqual([]);
      expect(processMovieData([])).toEqual([]);
    });
  });

  describe('processSeriesData', () => {
    it('should process series data correctly', () => {
      const mockSeries = [
        {
          id: '123',
          title: 'Test Series',
          shortDescription: 'A test series',
          genres: ['Drama', 'Thriller']
        }
      ];

      const result = processSeriesData(mockSeries);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123');
      expect(result[0].title).toBe('Test Series');
      expect(result[0].description).toBe('A test series');
      expect(result[0].genre).toBe('Drama, Thriller');
      expect(result[0].source).toBe('fubo_series');
      expect(result[0].league_id).toBe('series');
    });

    it('should handle empty or invalid input', () => {
      expect(processSeriesData(null)).toEqual([]);
      expect(processSeriesData(undefined)).toEqual([]);
      expect(processSeriesData({})).toEqual([]);
      expect(processSeriesData([])).toEqual([]);
    });
  });

  describe('getFuboMatches', () => {
    it('should fetch and process match data', async () => {
      const mockData = [
        { id: '1', title: 'Match 1', sport: 'soccer' },
        { id: '2', title: 'Match 2', sport: 'basketball' }
      ];
      setupFetchMock(mockData);

      const result = await getFuboMatches();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Match 1');
      expect(result[0].source).toBe('fubo_api');
    });

    it('should apply sport filter correctly', async () => {
      const mockData = [
        { id: '1', title: 'Match 1', sport: 'soccer' },
        { id: '2', title: 'Match 2', sport: 'basketball' }
      ];
      setupFetchMock(mockData);

      const result = await getFuboMatches({ sport: 'soccer' });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Match 1');
      expect(result[0].sport).toBe('soccer');
    });

    it('should handle fetch errors and show notifications', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API error')));

      await expect(getFuboMatches()).rejects.toThrow('API error');
      expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Error fetching matches'));
    });
  });

  describe('getFuboMovies', () => {
    it('should fetch and process movie data', async () => {
      const mockData = [
        { tmsId: '1', title: 'Movie 1', genres: ['Action'] },
        { tmsId: '2', title: 'Movie 2', genres: ['Comedy'] }
      ];
      setupFetchMock(mockData);

      const result = await getFuboMovies();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Movie 1');
      expect(result[0].source).toBe('fubo_movies');
    });

    it('should apply genre filter correctly', async () => {
      const mockData = [
        { tmsId: '1', title: 'Movie 1', genres: ['Action'] },
        { tmsId: '2', title: 'Movie 2', genres: ['Comedy'] }
      ];
      setupFetchMock(mockData);

      const result = await getFuboMovies({ genre: 'action' });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Movie 1');
      expect(result[0].genre).toBe('Action');
    });

    it('should handle fetch errors and show notifications', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API error')));

      await expect(getFuboMovies()).rejects.toThrow('API error');
      expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Error fetching movies'));
    });
  });

  describe('getFuboSeries', () => {
    it('should fetch and process series data', async () => {
      const mockData = [
        { id: '1', title: 'Series 1', genres: ['Drama'] },
        { id: '2', title: 'Series 2', genres: ['Comedy'] }
      ];
      setupFetchMock(mockData);

      const result = await getFuboSeries();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Series 1');
      expect(result[0].source).toBe('fubo_series');
    });

    it('should apply genre filter correctly', async () => {
      const mockData = [
        { id: '1', title: 'Series 1', genres: ['Drama'] },
        { id: '2', title: 'Series 2', genres: ['Comedy'] }
      ];
      setupFetchMock(mockData);

      const result = await getFuboSeries({ genre: 'drama' });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Series 1');
      expect(result[0].genre).toBe('Drama');
    });

    it('should handle fetch errors and show notifications', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API error')));

      await expect(getFuboSeries()).rejects.toThrow('API error');
      expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Error fetching series'));
    });
  });
}); 