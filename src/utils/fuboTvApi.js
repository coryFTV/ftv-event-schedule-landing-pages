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
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      // If fetch fails, return mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for development');
        return getMockMatchData();
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in fetchFuboTvMatches:', error);
    
    // Return mock data as a last resort in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data as fallback');
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
      source: 'mock_data'
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
      source: 'mock_data'
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
      source: 'mock_data'
    }
  ];
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