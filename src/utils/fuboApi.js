/**
 * Consolidated API utility for fetching all Fubo TV data (sports, movies, series)
 */

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
      console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}:`, error.message);
      lastError = error;

      if (attempt < retries) {
        console.log(`Waiting ${delay}ms before retry...`);
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

    console.log(`Attempting to fetch ${endpoint} from Fubo TV API: ${url}`);

    const data = await fetchWithRetry(url);
    console.log(
      `Fubo TV ${endpoint} API fetch successful, data structure:`,
      typeof data,
      Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array'
    );

    // Handle different data structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && data[endpoint] && Array.isArray(data[endpoint])) {
      console.log(`Found ${endpoint} property with ${data[endpoint].length} items`);
      return data[endpoint];
    } else if (endpoint === 'series' && data && typeof data === 'object') {
      // Special handling for series data which might have inconsistent structure
      const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        // Use the largest array found
        const largestArray = possibleArrays.reduce((a, b) => (a.length > b.length ? a : b));
        console.log(`Found potential series array with ${largestArray.length} items`);
        return largestArray;
      }

      // If no arrays found, convert object to array as fallback
      if (Object.keys(data).length > 0) {
        console.log('Converting object to array as fallback');
        return [data];
      }
    }

    // If we can't extract data in a standard way, throw an error
    throw new Error(`Unexpected data structure from Fubo TV ${endpoint} API`);
  } catch (error) {
    console.error(`Error in fetchFuboData for ${endpoint}:`, error);
    
    // For matches, we can return mock data in development
    if (endpoint === 'matches' && process.env.NODE_ENV === 'development') {
      console.warn('Using mock match data for development');
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
    return [];
  }

  return matches.map(match => ({
    id: match.id || '',
    title: match.title || '',
    hometeam: match.hometeam || '',
    awayteam: match.awayteam || '',
    hometeamID: match.hometeamID || '',
    awayteamID: match.awayteamID || '',
    starttime: match.starttime || match.startTime || '',
    endtime: match.endtime || match.endTime || '',
    sport: match.sport || '',
    league: match.league || '',
    league_id: match.league_id || '',
    network: match.network || '',
    networkUrl: match.networkUrl || '',
    matchId: match.matchId || '',
    matchUrl: match.matchUrl || '',
    thumbnail: match.thumbnail || '',
    country: match.country || 'US',
    url: match.url || '',
    regionalRestrictions: match.regionalRestrictions || match.isRegional || false,
    startTime: match.starttime || match.startTime || '',
    endTime: match.endtime || match.endTime || '',
    source: 'fubo_api',
  }));
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
    source: 'fubo_movies',
  }));
}

/**
 * Processes raw TV series data from Fubo TV API
 * @param {Array} series - Raw TV series data from API
 * @returns {Array} Processed TV series data
 */
export function processSeriesData(series) {
  if (!series || !Array.isArray(series)) {
    return [];
  }

  return series
    .map(show => {
      if (!show || typeof show !== 'object') {
        return null;
      }

      return {
        id: show.id || show.tmsId || '',
        title: show.title || show.name || '',
        description: show.description || show.shortDescription || show.longDescription || '',
        seasons: show.seasons || show.seasonCount || '',
        episodes: show.episodes || show.episodeCount || '',
        genre: Array.isArray(show.genres)
          ? show.genres.join(', ')
          : show.genre || show.genres || '',
        rating: show.rating || show.contentRating || '',
        creator: Array.isArray(show.creators)
          ? show.creators.join(', ')
          : show.creator || show.creators || '',
        actors: Array.isArray(show.actors) ? show.actors : show.cast || [],
        thumbnail: show.thumbnail || show.poster || show.image || '',
        url: show.url || show.deepLink || '',
        network: show.network || show.channel || '',
        starttime: show.startTime || show.airDate || new Date().toISOString(),
        sport: 'TV Series', // For compatibility with sports filtering
        league: Array.isArray(show.genres)
          ? show.genres[0]
          : show.genre || show.genres || 'TV Series',
        source: 'fubo_series',
      };
    })
    .filter(Boolean); // Remove any null entries
}

/**
 * Fetches and processes sports match data
 * @param {Object} options - Options for filtering data
 * @returns {Promise<Array>} Processed match data
 */
export async function getFuboMatches(options = {}) {
  const rawData = await fetchFuboData('matches');
  let processedData = processMatchData(rawData);

  // Apply filters if provided
  if (options.sport) {
    processedData = processedData.filter(
      match => match.sport && match.sport.toLowerCase() === options.sport.toLowerCase()
    );
  }

  if (options.league) {
    processedData = processedData.filter(
      match => match.league && match.league.toLowerCase() === options.league.toLowerCase()
    );
  }

  if (options.startDate) {
    const startDate = new Date(options.startDate);
    processedData = processedData.filter(match => {
      const matchDate = new Date(match.starttime || match.startTime);
      return !isNaN(matchDate.getTime()) && matchDate >= startDate;
    });
  }

  return processedData;
}

/**
 * Fetches and processes movie data
 * @param {Object} options - Options for filtering data
 * @returns {Promise<Array>} Processed movie data
 */
export async function getFuboMovies(options = {}) {
  const rawData = await fetchFuboData('movies');
  let processedData = processMovieData(rawData);

  // Apply filters if provided
  if (options.genre) {
    processedData = processedData.filter(
      movie => movie.genre && movie.genre.toLowerCase().includes(options.genre.toLowerCase())
    );
  }

  if (options.releaseYear) {
    processedData = processedData.filter(
      movie => movie.releaseYear && movie.releaseYear === options.releaseYear
    );
  }

  return processedData;
}

/**
 * Fetches and processes TV series data
 * @param {Object} options - Options for filtering data
 * @returns {Promise<Array>} Processed TV series data
 */
export async function getFuboSeries(options = {}) {
  const rawData = await fetchFuboData('series');
  let processedData = processSeriesData(rawData);

  // Apply filters if provided
  if (options.genre) {
    processedData = processedData.filter(
      series => series.genre && series.genre.toLowerCase().includes(options.genre.toLowerCase())
    );
  }

  return processedData;
} 