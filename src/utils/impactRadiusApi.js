// Impact Radius API utility functions

// Directly set the Account SID and Auth Token
// React environment variables need to be prefixed with REACT_APP_
const ACCOUNT_SID = 'IRuPEN2Q6um2355896YQMXzk3eWNzUXRV1'; // Hardcoded for testing
const AUTH_TOKEN = process.env.REACT_APP_IMPACT_RADIUS_AUTH_TOKEN || '9ttadtffjpq#MkVgU2FgPMtzRfj_KRuz';

// Debug logging for environment variables
console.log('API Credentials:');
console.log('ACCOUNT_SID:', ACCOUNT_SID ? 'Loaded (length: ' + ACCOUNT_SID.length + ')' : 'Not loaded');
console.log('AUTH_TOKEN:', AUTH_TOKEN ? 'Loaded (length: ' + AUTH_TOKEN.length + ')' : 'Not loaded');

// Helper function to create the Authorization header
const createAuthHeader = () => {
  // Encode the credentials as Base64
  const credentials = `${ACCOUNT_SID}:${AUTH_TOKEN}`;
  // Use Buffer for Node.js or btoa for browser
  const encoded = typeof Buffer !== 'undefined' 
    ? Buffer.from(credentials).toString('base64')
    : btoa(credentials);
  return `Basic ${encoded}`;
};

/**
 * Fetches landing pages (ads) from the Impact Radius API
 * @param {Object} filters - Optional filters for the API request
 * @returns {Promise<Array>} - Promise resolving to an array of landing pages
 */
export const fetchLandingPages = async (filters = {}) => {
  try {
    // Try with direct API call first (for testing)
    try {
      return await fetchDirectApi(filters);
    } catch (directApiError) {
      console.error('Direct API call failed:', directApiError);
      console.log('Trying with local proxy...');
      try {
        return await fetchWithLocalProxy(filters);
      } catch (localProxyError) {
        console.error('Local proxy failed:', localProxyError);
        console.log('Trying with public CORS proxy...');
        try {
          return await fetchWithPublicProxy(filters);
        } catch (publicProxyError) {
          console.error('Public proxy failed:', publicProxyError);
          // Instead of using mock data, throw an error with details
          const errorMessage = `All API connection attempts failed. Last error: ${publicProxyError.message}`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    }
  } catch (error) {
    console.error('All proxy attempts failed:', error);
    throw error;
  }
};

/**
 * Fetches landing pages directly from the API (for testing)
 */
const fetchDirectApi = async (filters) => {
  // Direct API call (will likely fail due to CORS)
  // Try with exact URL format from documentation
  const baseUrl = `https://api.impact.com/Advertisers/${ACCOUNT_SID}/Ads`;
  
  // Convert filters object to URL parameters
  const queryParams = new URLSearchParams();
  
  // Add any filters passed to the function
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  // Create request options with Basic Auth
  const requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': createAuthHeader()
    },
    mode: 'no-cors' // Try with no-cors mode
  };
  
  // Make the API request
  console.log(`Making direct API request: ${baseUrl}`);
  const response = await fetch(`${baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`, requestOptions);
  
  // Note: with no-cors mode, we can't access the response status or body
  // This is just for testing if the endpoint exists
  console.log('Direct API response:', response);
  
  // This will likely throw an error due to CORS
  if (!response.ok) {
    console.error(`Direct API error: ${response.status} ${response.statusText}`);
    throw new Error(`HTTP error with direct API! Status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API response from direct API:', data);
  return data.Ads || [];
};

/**
 * Fetches landing pages using the local proxy
 */
const fetchWithLocalProxy = async (filters) => {
  // Use our local proxy to avoid CORS issues
  // Try with exact URL format from documentation
  const baseUrl = `http://localhost:3001/api/Advertisers/${ACCOUNT_SID}/Ads`;
  
  // Convert filters object to URL parameters
  const queryParams = new URLSearchParams();
  
  // Add any filters passed to the function
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  // Create request options with Basic Auth
  const requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': createAuthHeader()
    }
  };
  
  // Make the API request
  console.log(`Making request to local proxy: ${baseUrl}`);
  const response = await fetch(`${baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`, requestOptions);
  
  if (!response.ok) {
    console.error(`Proxy error: ${response.status} ${response.statusText}`);
    throw new Error(`HTTP error with local proxy! Status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API response from local proxy:', data);
  return data.Ads || [];
};

/**
 * Fetches landing pages using a public CORS proxy
 */
const fetchWithPublicProxy = async (filters) => {
  // Use a public CORS proxy
  const publicProxyUrl = 'https://corsproxy.io/?';
  // Try with exact URL format from documentation
  const targetUrl = `https://api.impact.com/Advertisers/${ACCOUNT_SID}/Ads`;
  
  // Convert filters object to URL parameters
  const queryParams = new URLSearchParams();
  
  // Add any filters passed to the function
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  // Create request options with Basic Auth
  const requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': createAuthHeader()
    }
  };
  
  // Make the API request
  const fullUrl = `${publicProxyUrl}${encodeURIComponent(targetUrl + (queryParams.toString() ? '?' + queryParams.toString() : ''))}`;
  console.log(`Making request via public proxy: ${fullUrl}`);
  
  const response = await fetch(fullUrl, requestOptions);
  
  if (!response.ok) {
    console.error(`Public proxy error: ${response.status} ${response.statusText}`);
    throw new Error(`HTTP error with public proxy! Status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API response from public proxy:', data);
  return data.Ads || [];
};

/**
 * Formats landing page data for display in the application
 * @param {Array} landingPages - Raw landing pages data from the API
 * @returns {Array} - Formatted landing pages data
 */
export const formatLandingPagesData = (landingPages) => {
  return landingPages.map(page => ({
    id: page.Id,
    title: page.Name,
    description: page.Description,
    landingPageUrl: page.LandingPage,
    adType: page.AdType,
    campaignId: page.CampaignId,
    campaignName: page.CampaignName,
    dateCreated: page.DateCreated,
    dateLastUpdated: page.DateLastUpdated,
    mobileReady: page.MobileReady === 'true',
    dealId: page.DealId,
    dealName: page.DealName,
    dealDescription: page.DealDescription,
    // Add any other fields you want to include
  }));
}; 