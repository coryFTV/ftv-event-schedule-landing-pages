/**
 * Utility functions for processing data
 */

/**
 * Normalizes data into a consistent format
 * @param {Array} data - Raw data from API
 * @returns {Array} Normalized data
 */
export function normalizeData(data) {
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data received for normalization');
    return [];
  }
  
  console.log(`Normalizing ${data.length} items from Fubo API`);
  
  return data.map(item => ({
    id: item.id || '',
    title: item.title || item.Title || item.name || item.Name || 'Untitled Match',
    description: item.description || item.Description || '',
    landingPageUrl: item.url || item.Url || item.landingPage || item.LandingPage || '',
    adType: 'Sports Match',
    campaignId: item.campaignId || item.CampaignId || '',
    campaignName: item.campaignName || item.CampaignName || 'Sports Campaign',
    dateCreated: item.dateCreated || item.DateCreated || new Date().toISOString(),
    dateLastUpdated: item.dateLastUpdated || item.DateLastUpdated || new Date().toISOString(),
    mobileReady: true,
    dealId: item.dealId || item.DealId || '',
    dealName: item.dealName || item.DealName || '',
    dealDescription: item.dealDescription || item.DealDescription || '',
    sportType: item.sportType || item.SportType || '',
    homeTeam: item.homeTeam || item.HomeTeam || '',
    awayTeam: item.awayTeam || item.AwayTeam || '',
    startTime: item.startTime || item.StartTime || '',
    endTime: item.endTime || item.EndTime || '',
    venue: item.venue || item.Venue || ''
  }));
}

/**
 * Merges data from multiple sources, removing duplicates
 * @param {Array} dataSets - Arrays of data from different sources
 * @returns {Array} - Merged data
 */
export function mergeData(...dataSets) {
  // Flatten all data sets
  const allData = dataSets.flat().filter(Boolean);
  
  // Use a Map to deduplicate by ID
  const uniqueData = new Map();
  
  allData.forEach(item => {
    const id = item.id || item.Id;
    if (id && !uniqueData.has(id)) {
      uniqueData.set(id, item);
    }
  });
  
  return Array.from(uniqueData.values());
}

/**
 * Filters data based on search term and filters
 * @param {Array} data - Data to filter
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered data
 */
export function filterData(data, searchTerm, filters = {}) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  let filteredData = [...data];
  
  // Apply search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredData = filteredData.filter(item => 
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.campaignName && item.campaignName.toLowerCase().includes(term)) ||
      (item.dealName && item.dealName.toLowerCase().includes(term)) ||
      (item.homeTeam && item.homeTeam.toLowerCase().includes(term)) ||
      (item.awayTeam && item.awayTeam.toLowerCase().includes(term))
    );
  }
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      switch (key) {
        case 'Type':
          filteredData = filteredData.filter(item => 
            item.adType === value || item.AdType === value
          );
          break;
        case 'MobileReady':
          filteredData = filteredData.filter(item => 
            String(item.mobileReady) === value || String(item.MobileReady) === value
          );
          break;
        case 'DateLastUpdatedStart':
          const startDate = new Date(value);
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.dateLastUpdated || item.DateLastUpdated);
            return itemDate >= startDate;
          });
          break;
        case 'DateLastUpdatedEnd':
          const endDate = new Date(value);
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.dateLastUpdated || item.DateLastUpdated);
            return itemDate <= endDate;
          });
          break;
        case 'SportType':
          filteredData = filteredData.filter(item => 
            item.sportType === value || item.SportType === value
          );
          break;
        default:
          // For any other filter, try to match it against the item properties
          filteredData = filteredData.filter(item => {
            const lowerCaseKey = key.toLowerCase();
            const lowerCaseValue = value.toLowerCase();
            
            // Check all properties of the item
            return Object.entries(item).some(([itemKey, itemValue]) => {
              if (typeof itemValue === 'string') {
                return itemKey.toLowerCase() === lowerCaseKey && 
                       itemValue.toLowerCase().includes(lowerCaseValue);
              }
              return false;
            });
          });
      }
    }
  });
  
  return filteredData;
}

/**
 * Sorts data based on sort configuration
 * @param {Array} data - Data to sort
 * @param {Object} sortConfig - Sort configuration with key and direction
 * @returns {Array} - Sorted data
 */
export function sortData(data, sortConfig) {
  if (!data || !Array.isArray(data) || !sortConfig || !sortConfig.key) {
    return data;
  }
  
  return [...data].sort((a, b) => {
    // Get values, handling different case variations
    const aValue = a[sortConfig.key] || a[sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)];
    const bValue = b[sortConfig.key] || b[sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)];
    
    // Handle different data types
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    // Handle dates
    if (sortConfig.key.toLowerCase().includes('date')) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      
      return sortConfig.direction === 'asc' 
        ? aDate - bDate 
        : bDate - aDate;
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    // Handle booleans
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    // Default comparison
    return sortConfig.direction === 'asc' 
      ? String(aValue).localeCompare(String(bValue)) 
      : String(bValue).localeCompare(String(aValue));
  });
} 