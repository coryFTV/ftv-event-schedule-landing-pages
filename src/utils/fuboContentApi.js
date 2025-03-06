/**
 * Utility functions for fetching and processing movie and TV series data from Fubo TV API
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
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
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
 * Fetches movie data from the Fubo TV API
 * @returns {Promise<Array>} Array of movie objects
 */
export async function fetchFuboTvMovies() {
  try {
    const url =
      process.env.NODE_ENV === 'development' ? 'http://localhost:3001/movies.json' : '/movies.json';

    console.log(`Attempting to fetch movies from Fubo TV API: ${url}`);

    const data = await fetchWithRetry(url);
    console.log(
      'Fubo TV Movies API fetch successful, data structure:',
      typeof data,
      Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array'
    );

    // Handle different data structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.movies && Array.isArray(data.movies)) {
      console.log(`Found movies property with ${data.movies.length} items`);
      return data.movies;
    } else {
      const errorMessage = 'Unexpected data structure from Fubo TV Movies API';
      console.error(errorMessage, data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in fetchFuboTvMovies:', error);
    throw error;
  }
}

/**
 * Fetches TV series data from the Fubo TV API
 * @returns {Promise<Array>} Array of TV series objects
 */
export async function fetchFuboTvSeries() {
  try {
    const url =
      process.env.NODE_ENV === 'development' ? 'http://localhost:3001/series.json' : '/series.json';

    console.log(`Attempting to fetch series from Fubo TV API: ${url}`);

    const data = await fetchWithRetry(url);
    console.log(
      'Fubo TV Series API fetch successful, data structure:',
      typeof data,
      Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array'
    );

    // Handle different data structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.series && Array.isArray(data.series)) {
      console.log(`Found series property with ${data.series.length} items`);
      return data.series;
    } else if (data && typeof data === 'object') {
      // If we get an object but not in the expected format, try to extract any array
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

    // Return empty array as last resort to prevent crashes
    console.warn('Could not extract series data, returning empty array');
    return [];
  } catch (error) {
    console.error('Error in fetchFuboTvSeries:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

/**
 * Processes raw movie data from Fubo TV API to match the format expected by the application
 * @param {Array} movies - Raw movie data from API
 * @returns {Array} Processed movie data
 */
export function processMovieData(movies) {
  if (!movies) {
    console.warn('processMovieData received null or undefined data');
    return [];
  }

  if (!Array.isArray(movies)) {
    console.warn('processMovieData received non-array data:', typeof movies);
    if (movies && typeof movies === 'object' && movies.movies && Array.isArray(movies.movies)) {
      console.log('Extracting movies array from object');
      movies = movies.movies;
    } else {
      return [];
    }
  }

  console.log(`Processing ${movies.length} movies from Fubo TV API`);

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
 * Processes raw TV series data from Fubo TV API to match the format expected by the application
 * @param {Array} series - Raw TV series data from API
 * @returns {Array} Processed TV series data
 */
export function processSeriesData(series) {
  if (!series) {
    console.warn('processSeriesData received null or undefined data');
    return [];
  }

  if (!Array.isArray(series)) {
    console.warn('processSeriesData received non-array data:', typeof series);
    if (series && typeof series === 'object' && series.series && Array.isArray(series.series)) {
      console.log('Extracting series array from object');
      series = series.series;
    } else if (series && typeof series === 'object') {
      // Try to convert object to array if possible
      console.log('Attempting to convert object to array');
      series = [series];
    } else {
      return [];
    }
  }

  console.log(`Processing ${series.length} TV series from Fubo TV API`);

  return series
    .map(show => {
      // Ensure we have an object to work with
      if (!show || typeof show !== 'object') {
        console.warn('Invalid show data:', show);
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
 * Fetches and processes movie data in one call
 * @param {Object} options - Options for filtering and processing data
 * @returns {Promise<Array>} Processed movie data
 */
export async function getFuboTvMovies(options = {}) {
  try {
    const rawData = await fetchFuboTvMovies();
    let processedData = processMovieData(rawData);

    // Apply filters if provided in options
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
  } catch (error) {
    console.error('Error in getFuboTvMovies:', error);
    return []; // Return empty array instead of throwing to prevent app crashes
  }
}

/**
 * Fetches and processes TV series data in one call
 * @param {Object} options - Options for filtering and processing data
 * @returns {Promise<Array>} Processed TV series data
 */
export async function getFuboTvSeries(options = {}) {
  try {
    const rawData = await fetchFuboTvSeries();
    let processedData = processSeriesData(rawData);

    // Apply filters if provided in options
    if (options.genre) {
      processedData = processedData.filter(
        show => show.genre && show.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }

    return processedData;
  } catch (error) {
    console.error('Error in getFuboTvSeries:', error);
    return []; // Return empty array instead of throwing to prevent app crashes
  }
}
