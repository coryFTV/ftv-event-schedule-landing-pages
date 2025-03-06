/**
 * Utility functions for fetching and processing data from Fubo TV API
 */

/**
 * Fetches match data from the Fubo TV API
 * @returns {Promise<Array>} Array of match objects
 */
export async function fetchFuboTvMatches() {
  try {
    const url = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/matches.json' 
      : '/matches.json';
    
    console.log(`Attempting to fetch from Fubo TV API: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Failed to fetch from Fubo TV API: ${response.status} - ${errorText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Fubo TV API fetch successful, data structure:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array');
    
    // Handle different data structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.matches && Array.isArray(data.matches)) {
      console.log(`Found matches property with ${data.matches.length} items`);
      return data.matches;
    } else {
      const errorMessage = 'Unexpected data structure from Fubo TV API';
      console.error(errorMessage, data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in fetchFuboTvMatches:', error);
    throw error;
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
    if (matches && typeof matches === 'object' && matches.matches && Array.isArray(matches.matches)) {
      console.log('Extracting matches array from object');
      matches = matches.matches;
    } else {
      return [];
    }
  }
  
  console.log(`Processing ${matches.length} matches from Fubo TV API`);
  
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
    source: 'fubo_api'
  }));
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
    throw error;
  }
} 