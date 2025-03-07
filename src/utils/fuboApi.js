/**
 * Consolidated API utility for fetching all Fubo TV data (sports, movies, series)
 */
import { notifyError, notifyWarning } from './notificationService';

/**
 * Fetches data from the API with retry logic
 * @param {string} url - The URL to fetch from
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} initialDelay - Initial delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} The JSON response
 */
async function fetchWithRetry(url, retries = 3, initialDelay = 1000) {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      notifyWarning(`Fetch attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
      lastError = error;

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Fetches data from a specific Fubo TV endpoint
 * @param {string} endpoint - The endpoint to fetch from (matches, movies, series)
 * @returns {Promise<Array>} Array of data objects
 */
export async function fetchFuboData(endpoint) {
  try {
    const url =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3001/${endpoint}.json`
        : `/${endpoint}.json`;

    console.log(`Fetching ${endpoint} data from: ${url}`);
    const data = await fetchWithRetry(url);
    
    // Log the structure for debugging
    console.log(`${endpoint} data structure:`, 
      Array.isArray(data) 
        ? `Array with ${data.length} items` 
        : (data ? `Object with keys: ${Object.keys(data).join(', ')}` : 'No data'));

    // Handle different data structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && data[endpoint] && Array.isArray(data[endpoint])) {
      return data[endpoint];
    } else if (data && typeof data === 'object') {
      // For any data format, look for any array property that might contain our data
      const possibleArrays = Object.entries(data)
        .filter(([_, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => {
          console.log(`Found array in property '${key}' with ${value.length} items`);
          return { key, value };
        });
        
      if (possibleArrays.length > 0) {
        // Use the largest array found
        const largestArray = possibleArrays.reduce(
          (largest, current) => current.value.length > largest.value.length ? current : largest, 
          possibleArrays[0]
        );
        console.log(`Using largest array from '${largestArray.key}' with ${largestArray.value.length} items`);
        return largestArray.value;
      }

      // If no arrays found, try to extract data from object
      if (Object.keys(data).length > 0) {
        console.log('No arrays found, converting object data to array');
        if (endpoint === 'matches' && data.matchData) {
          // Special case for matches that might have a matchData property
          return Array.isArray(data.matchData) ? data.matchData : [data];
        }
        return [data];
      }
    }

    // If we can't extract data in a standard way, throw an error
    throw new Error(`Unexpected data structure from Fubo TV ${endpoint} API`);
  } catch (error) {
    console.error(`Error in fetchFuboData for ${endpoint}:`, error);
    notifyError(`Error in fetchFuboData for ${endpoint}: ${error.message}`);
    
    // For matches, we can return mock data in development
    if (endpoint === 'matches' && process.env.NODE_ENV === 'development') {
      notifyWarning('Using mock match data for development');
      return getMockMatchData();
    }
    
    throw error;
  }
}

/**
 * Returns mock match data for development and testing
 */
function getMockMatchData() {
  return [
    {
      id: 'mock-1',
      title: 'New York Yankees vs Boston Red Sox',
      hometeam: 'New York Yankees',
      awayteam: 'Boston Red Sox',
      hometeamID: 'nyy',
      awayteamID: 'bos',
      starttime: new Date(Date.now() + 3600000).toISOString(),
      endtime: new Date(Date.now() + 7200000).toISOString(),
      sport: 'baseball',
      league: 'MLB',
      league_id: 'mlb',
      network: 'ESPN',
      networkUrl: 'https://espn.com',
      matchId: 'mock-match-1',
      matchUrl: 'https://espn.com/game/1',
      thumbnail: 'https://via.placeholder.com/150',
      country: 'US',
      url: 'https://espn.com/game/1',
      regionalRestrictions: false,
      source: 'mock_data',
    },
    {
      id: 'mock-2',
      title: 'Los Angeles Lakers vs Golden State Warriors',
      hometeam: 'Los Angeles Lakers',
      awayteam: 'Golden State Warriors',
      hometeamID: 'lal',
      awayteamID: 'gsw',
      starttime: new Date(Date.now() + 7200000).toISOString(),
      endtime: new Date(Date.now() + 10800000).toISOString(),
      sport: 'basketball',
      league: 'NBA',
      league_id: 'nba',
      network: 'TNT',
      networkUrl: 'https://tnt.com',
      matchId: 'mock-match-2',
      matchUrl: 'https://tnt.com/game/1',
      thumbnail: 'https://via.placeholder.com/150',
      country: 'US',
      url: 'https://tnt.com/game/1',
      regionalRestrictions: false,
      source: 'mock_data',
    },
    {
      id: 'mock-3',
      title: 'Manchester United vs Liverpool',
      hometeam: 'Manchester United',
      awayteam: 'Liverpool',
      hometeamID: 'manu',
      awayteamID: 'liv',
      starttime: new Date(Date.now() + 10800000).toISOString(),
      endtime: new Date(Date.now() + 14400000).toISOString(),
      sport: 'soccer',
      league: 'Premier League',
      league_id: 'epl',
      network: 'NBC Sports',
      networkUrl: 'https://nbcsports.com',
      matchId: 'mock-match-3',
      matchUrl: 'https://nbcsports.com/game/1',
      thumbnail: 'https://via.placeholder.com/150',
      country: 'US',
      url: 'https://nbcsports.com/game/1',
      regionalRestrictions: false,
      source: 'mock_data',
    },
  ];
}

/**
 * Processes raw match data from Fubo TV API
 * @param {Array} matches - Raw match data from API
 * @returns {Array} Processed match data
 */
export function processMatchData(matches) {
  if (!matches || !Array.isArray(matches)) {
    console.error('Invalid match data format:', matches);
    return [];
  }

  console.log(`Processing ${matches.length} match records`);
  
  try {
    return matches.map((match, index) => {
      if (!match || typeof match !== 'object') {
        console.error(`Invalid match record at index ${index}:`, match);
        return null;
      }
      
      // Extract team names if available
      let homeTeam = '';
      let awayTeam = '';
      
      if (match.hometeam && match.awayteam) {
        homeTeam = match.hometeam;
        awayTeam = match.awayteam;
      } else if (match.title) {
        // Try to extract team names from title with format "Team A vs Team B"
        const teamMatch = match.title.match(/(.+?)\s+(?:vs\.?|v\.?)\s+(.+)/i);
        if (teamMatch && teamMatch.length >= 3) {
          homeTeam = teamMatch[1].trim();
          awayTeam = teamMatch[2].trim();
        }
      }
      
      // Create a normalized match object with fallbacks for all required fields
      const normalizedMatch = {
        id: match.id || `match-${Math.random().toString(36).substring(2, 9)}`,
        title: match.title || 'Unknown Match',
        hometeam: homeTeam || '',
        awayteam: awayTeam || '',
        hometeamID: match.hometeamID || '',
        awayteamID: match.awayteamID || '',
        starttime: match.starttime || match.startTime || new Date().toISOString(),
        endtime: match.endtime || match.endTime || '',
        sport: match.sport || 'Unknown',
        league: match.league || '',
        league_id: match.league_id || '',
        network: match.network || '',
        networkUrl: match.networkUrl || '',
        matchId: match.matchId || match.id || '',
        matchUrl: match.matchUrl || match.url || '',
        thumbnail: match.thumbnail || '',
        country: match.country || 'US',
        url: match.url || '',
        regionalRestrictions: !!match.regionalRestrictions || !!match.isRegional,
        startTime: match.starttime || match.startTime || new Date().toISOString(),
        endTime: match.endtime || match.endTime || '',
        source: 'fubo_api',
      };
      
      // Handle networks consistently as an array of objects
      if (match.networks && Array.isArray(match.networks)) {
        normalizedMatch.networks = match.networks.map(network => {
          if (typeof network === 'string') {
            return {
              network,
              isRegional: false
            };
          }
          return {
            network: network.network || 'Unknown Network',
            isRegional: !!network.isRegional
          };
        });
      } else if (match.network) {
        // Create networks array from single network
        normalizedMatch.networks = [{
          network: match.network,
          isRegional: !!match.regionalRestrictions || !!match.isRegional
        }];
      } else {
        // Ensure networks is always an array
        normalizedMatch.networks = [];
      }
      
      return normalizedMatch;
    }).filter(match => match !== null); // Remove any null entries
  } catch (error) {
    console.error('Error while processing match data:', error);
    return [];
  }
}

/**
 * Processes raw movie data from Fubo TV API
 * @param {Array} movies - Raw movie data from API
 * @returns {Array} Processed movie data
 */
export function processMovieData(movies) {
  if (!movies || !Array.isArray(movies)) {
    return [];
  }

  return movies.map(movie => ({
    id: movie.tmsId || movie.id || '',
    title: movie.title || '',
    description: movie.shortDescription || movie.longDescription || '',
    releaseYear: movie.releaseYear || '',
    duration: movie.duration || movie.durationSeconds ? Math.floor(movie.durationSeconds / 60) : '',
    genre: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || '',
    rating: movie.rating || '',
    director: Array.isArray(movie.directors) ? movie.directors.join(', ') : movie.directors || '',
    actors: Array.isArray(movie.actors) ? movie.actors : [],
    thumbnail: movie.poster || '',
    url: movie.url || movie.deepLink || '',
    network: movie.network || '',
    starttime: movie.licenseWindowStart || new Date().toISOString(),
    sport: 'Movie',
    league: Array.isArray(movie.genres) ? movie.genres[0] : movie.genres || 'Movie',
    league_id: 'movies',
    source: 'fubo_movies',
  }));
}

/**
 * Processes raw series data from Fubo TV API
 * @param {Array} series - Raw series data from API
 * @returns {Array} Processed series data
 */
export function processSeriesData(series) {
  if (!series || !Array.isArray(series)) {
    return [];
  }

  return series.map(show => ({
    id: show.tmsId || show.id || '',
    title: show.title || '',
    description: show.shortDescription || show.longDescription || '',
    releaseYear: show.releaseYear || '',
    seasons: show.seasons || show.seasonCount || '',
    genre: Array.isArray(show.genres) ? show.genres.join(', ') : show.genres || '',
    rating: show.rating || '',
    creator: Array.isArray(show.creators) ? show.creators.join(', ') : show.creators || '',
    actors: Array.isArray(show.actors) ? show.actors : [],
    thumbnail: show.poster || '',
    url: show.url || show.deepLink || '',
    network: show.network || '',
    starttime: show.licenseWindowStart || new Date().toISOString(),
    sport: 'Series',
    league: Array.isArray(show.genres) ? show.genres[0] : show.genres || 'Series',
    league_id: 'series',
    source: 'fubo_series',
  }));
}

/**
 * Generic function to fetch and process data from Fubo TV API
 * @param {string} endpoint - The endpoint to fetch from (matches, movies, series)
 * @param {Function} processFn - Function to process the data
 * @param {Object} options - Options for filtering the data
 * @returns {Promise<Array>} Processed data
 */
async function getFuboData(endpoint, processFn, options = {}) {
  try {
    const data = await fetchFuboData(endpoint);
    const processedData = processFn(data);
    
    // Apply filters if provided
    if (options.filter && typeof options.filter === 'function') {
      return processedData.filter(options.filter);
    }
    
    return processedData;
  } catch (error) {
    notifyError(`Error fetching ${endpoint}: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches and processes match data from Fubo TV API
 * @param {Object} options - Options for filtering the data
 * @returns {Promise<Array>} Processed match data
 */
export async function getFuboMatches(options = {}) {
  const filter = item => {
    if (options.sport && item.sport) {
      return item.sport.toLowerCase() === options.sport.toLowerCase();
    }
    return true;
  };
  
  return getFuboData('matches', processMatchData, { filter });
}

/**
 * Fetches and processes movie data from Fubo TV API
 * @param {Object} options - Options for filtering the data
 * @returns {Promise<Array>} Processed movie data
 */
export async function getFuboMovies(options = {}) {
  const filter = item => {
    if (options.genre && item.genre) {
      return item.genre.toLowerCase().includes(options.genre.toLowerCase());
    }
    return true;
  };
  
  return getFuboData('movies', processMovieData, { filter });
}

/**
 * Fetches and processes series data from Fubo TV API
 * @param {Object} options - Options for filtering the data
 * @returns {Promise<Array>} Processed series data
 */
export async function getFuboSeries(options = {}) {
  const filter = item => {
    if (options.genre && item.genre) {
      return item.genre.toLowerCase().includes(options.genre.toLowerCase());
    }
    return true;
  };
  
  return getFuboData('series', processSeriesData, { filter });
} 