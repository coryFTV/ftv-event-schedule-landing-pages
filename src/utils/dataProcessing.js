/**
 * Utility functions for processing data from different sources
 */

/**
 * Normalizes data from different sources into a consistent format
 * @param {Array} data - Raw data from any source
 * @param {string} source - Source of the data ('fubo' or 'impact')
 * @returns {Array} - Normalized data
 */
export function normalizeData(data, source) {
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data provided to normalizeData:', data);
    return [];
  }

  console.log(`Normalizing ${data.length} items from ${source} source`);

  switch (source) {
    case 'fubo':
      return normalizeFuboData(data);
    case 'impact':
      return normalizeImpactData(data);
    default:
      // Try to detect the source based on data structure
      if (data.length > 0) {
        if (data[0].hasOwnProperty('SportType') || data[0].hasOwnProperty('sportType')) {
          return normalizeFuboData(data);
        } else if (data[0].hasOwnProperty('AdType') || data[0].hasOwnProperty('adType')) {
          return normalizeImpactData(data);
        }
      }
      console.warn('Unknown data source, attempting generic normalization');
      return data.map(item => normalizeGeneric(item));
  }
}

/**
 * Normalizes Fubo TV data
 * @param {Array} data - Raw Fubo TV data
 * @returns {Array} - Normalized data
 */
function normalizeFuboData(data) {
  return data.map(match => ({
    id: match.id || match.Id || String(Math.random()).slice(2, 10),
    title: match.title || match.Title || match.name || match.Name || 'Untitled Match',
    description: match.description || match.Description || '',
    landingPageUrl: match.url || match.Url || match.landingPage || match.LandingPage || '',
    adType: 'Sports Match',
    campaignId: match.campaignId || match.CampaignId || '',
    campaignName: match.campaignName || match.CampaignName || 'Sports Campaign',
    dateCreated: match.dateCreated || match.DateCreated || new Date().toISOString(),
    dateLastUpdated: match.dateLastUpdated || match.DateLastUpdated || new Date().toISOString(),
    mobileReady: true,
    dealId: match.dealId || match.DealId || '',
    dealName: match.dealName || match.DealName || '',
    dealDescription: match.dealDescription || match.DealDescription || '',
    // Fubo TV specific fields
    sportType: match.sportType || match.SportType || '',
    homeTeam: match.homeTeam || match.HomeTeam || '',
    awayTeam: match.awayTeam || match.AwayTeam || '',
    startTime: match.startTime || match.StartTime || '',
    endTime: match.endTime || match.EndTime || '',
    venue: match.venue || match.Venue || '',
    // Source tracking
    dataSource: 'fubo'
  }));
}

/**
 * Normalizes Impact Radius data
 * @param {Array} data - Raw Impact Radius data
 * @returns {Array} - Normalized data
 */
function normalizeImpactData(data) {
  return data.map(page => ({
    id: page.Id || page.id || String(Math.random()).slice(2, 10),
    title: page.Name || page.name || 'Untitled Page',
    description: page.Description || page.description || '',
    landingPageUrl: page.LandingPage || page.landingPage || page.landingPageUrl || '',
    adType: page.AdType || page.adType || 'Unknown',
    campaignId: page.CampaignId || page.campaignId || '',
    campaignName: page.CampaignName || page.campaignName || '',
    dateCreated: page.DateCreated || page.dateCreated || new Date().toISOString(),
    dateLastUpdated: page.DateLastUpdated || page.dateLastUpdated || new Date().toISOString(),
    mobileReady: page.MobileReady === 'true' || page.mobileReady === true,
    dealId: page.DealId || page.dealId || '',
    dealName: page.DealName || page.dealName || '',
    dealDescription: page.DealDescription || page.dealDescription || '',
    // Source tracking
    dataSource: 'impact'
  }));
}

/**
 * Generic normalization for unknown data structures
 * @param {Object} item - Raw data item
 * @returns {Object} - Normalized item
 */
function normalizeGeneric(item) {
  // Create a normalized object with all possible field names
  const normalized = {};
  
  // Map of common field names and their possible variations
  const fieldMappings = {
    id: ['id', 'Id', '_id', 'ID'],
    title: ['title', 'Title', 'name', 'Name'],
    description: ['description', 'Description', 'desc', 'Desc'],
    landingPageUrl: ['landingPageUrl', 'LandingPageUrl', 'landingPage', 'LandingPage', 'url', 'Url'],
    adType: ['adType', 'AdType', 'type', 'Type'],
    campaignId: ['campaignId', 'CampaignId'],
    campaignName: ['campaignName', 'CampaignName'],
    dateCreated: ['dateCreated', 'DateCreated', 'created', 'Created', 'createdAt', 'CreatedAt'],
    dateLastUpdated: ['dateLastUpdated', 'DateLastUpdated', 'updated', 'Updated', 'updatedAt', 'UpdatedAt'],
    mobileReady: ['mobileReady', 'MobileReady'],
    dealId: ['dealId', 'DealId'],
    dealName: ['dealName', 'DealName'],
    dealDescription: ['dealDescription', 'DealDescription'],
    // Sports specific fields
    sportType: ['sportType', 'SportType', 'sport', 'Sport'],
    homeTeam: ['homeTeam', 'HomeTeam', 'home', 'Home'],
    awayTeam: ['awayTeam', 'AwayTeam', 'away', 'Away'],
    startTime: ['startTime', 'StartTime', 'start', 'Start'],
    endTime: ['endTime', 'EndTime', 'end', 'End'],
    venue: ['venue', 'Venue', 'location', 'Location']
  };
  
  // For each field, try all possible variations
  Object.entries(fieldMappings).forEach(([normalizedField, possibleFields]) => {
    for (const field of possibleFields) {
      if (item[field] !== undefined) {
        normalized[normalizedField] = item[field];
        break;
      }
    }
  });
  
  // Ensure required fields have default values
  normalized.id = normalized.id || String(Math.random()).slice(2, 10);
  normalized.title = normalized.title || 'Untitled';
  normalized.description = normalized.description || '';
  normalized.landingPageUrl = normalized.landingPageUrl || '';
  normalized.adType = normalized.adType || 'Unknown';
  normalized.dateCreated = normalized.dateCreated || new Date().toISOString();
  normalized.dateLastUpdated = normalized.dateLastUpdated || new Date().toISOString();
  normalized.dataSource = 'unknown';
  
  return normalized;
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