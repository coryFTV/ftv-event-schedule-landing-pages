/**
 * Utility functions for fetching and processing data from Fubo TV API
 */

/**
 * Fetches match data from the Fubo TV API
 * @returns {Promise<Array>} Array of match objects
 */
export async function fetchFuboTvMatches() {
  try {
    // Use the test-metadata endpoint first (which we know is working from the logs)
    try {
      const url = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/test-metadata' 
        : '/test-metadata';
      
      console.log(`Attempting to fetch from test-metadata endpoint: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch from test-metadata: ${response.status} - ${errorText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('test-metadata fetch successful, data structure:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array');
      
      // Handle different data structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.matches && Array.isArray(data.matches)) {
        console.log(`Found matches property with ${data.matches.length} items`);
        return data.matches;
      } else {
        const errorMessage = 'Unexpected data structure from test-metadata';
        console.error(errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (testMetadataError) {
      console.error(`test-metadata fetch failed: ${testMetadataError.message}. Trying test-impact...`);
    }
    
    // Try the test-impact endpoint next
    try {
      const url = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/test-impact' 
        : '/test-impact';
      
      console.log(`Attempting to fetch from test-impact endpoint: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch from test-impact: ${response.status} - ${errorText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('test-impact fetch successful, data structure:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array');
      
      // Handle different data structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.Ads && Array.isArray(data.Ads)) {
        console.log(`Found Ads property with ${data.Ads.length} items`);
        return data.Ads;
      } else {
        const errorMessage = 'Unexpected data structure from test-impact';
        console.error(errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (testImpactError) {
      console.error(`test-impact fetch failed: ${testImpactError.message}. Trying direct matches.json...`);
    }
    
    // Try direct matches.json endpoint
    try {
      const url = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/matches.json' 
        : '/matches.json';
      
      console.log(`Attempting to fetch from direct matches.json endpoint: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch from matches.json: ${response.status} - ${errorText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('matches.json fetch successful, data structure:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array');
      
      // Handle different data structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.matches && Array.isArray(data.matches)) {
        console.log(`Found matches property with ${data.matches.length} items`);
        return data.matches;
      } else {
        const errorMessage = 'Unexpected data structure from matches.json';
        console.error(errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (matchesError) {
      const errorMessage = `All fetch attempts failed: ${matchesError.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in fetchFuboTvMatches:', error);
    throw error; // Propagate the error instead of returning empty array
  }
}

/**
 * Processes raw match data from Fubo TV API to match the format expected by ScheduleView
 * @param {Array} matches - Raw match data from API
 * @returns {Array} Processed match data
 */
export function processMatchData(matches) {
  if (!matches) {
    console.warn('processMatchData received null or undefined data');
    return [];
  }
  
  if (!Array.isArray(matches)) {
    console.warn('processMatchData received non-array data:', typeof matches);
    // Try to extract matches array if it's an object with a matches property
    if (matches && typeof matches === 'object' && matches.matches && Array.isArray(matches.matches)) {
      console.log('Extracting matches array from object');
      matches = matches.matches;
    } else {
      return [];
    }
  }
  
  console.log(`Processing ${matches.length} matches from Fubo TV API`);
  
  return matches.map(match => {
    // Log a sample match to help with debugging
    if (matches.indexOf(match) === 0) {
      console.log('Sample match structure:', JSON.stringify(match, null, 2));
    }
    
    // Map the Fubo TV API fields to the format expected by ScheduleView
    return {
      id: match.id || '',
      title: match.title || '',
      hometeam: match.hometeam || '',
      awayteam: match.awayteam || '',
      hometeamID: match.hometeamID || '',
      awayteamID: match.awayteamID || '',
      starttime: match.starttime || match.startTime || '', // Handle both formats
      endtime: match.endtime || match.endTime || '', // Handle both formats
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
      // Add additional fields for compatibility with ScheduleView
      startTime: match.starttime || match.startTime || '', // Add capitalized version for newer components
      endTime: match.endtime || match.endTime || '', // Add capitalized version for newer components
      // Add a flag to identify this as coming from the Fubo TV API
      source: 'fubo_api'
    };
  });
}

/**
 * Fetches and processes match data in one call
 * @param {Object} options - Options for filtering and processing data
 * @returns {Promise<Array>} Processed match data
 */
export async function getFuboTvMatches(options = {}) {
  try {
    const rawData = await fetchFuboTvMatches();
    let processedData = processMatchData(rawData);
    
    // Apply filters if provided in options
    if (options.sport) {
      processedData = processedData.filter(match => 
        match.sport && match.sport.toLowerCase() === options.sport.toLowerCase()
      );
    }
    
    if (options.league) {
      processedData = processedData.filter(match => 
        match.league && match.league.toLowerCase() === options.league.toLowerCase()
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
  } catch (error) {
    console.error('Error in getFuboTvMatches:', error);
    throw error; // Propagate the error to be handled by the component
  }
} 