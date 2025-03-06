/**
 * Utility functions for generating affiliate links
 */

// Local storage key for partner settings (must match the key in PartnerConfig.js)
const PARTNER_SETTINGS_KEY = 'fuboPartnerSettings';

/**
 * Safely encodes URL components to handle special characters
 * @param {string} value - The value to encode
 * @returns {string} The encoded value
 */
export const safeEncodeURIComponent = (value) => {
  if (!value) return '';
  
  // First replace % with %25 to avoid double encoding
  let encoded = String(value).replace(/%/g, '%25');
  
  // Replace problematic characters
  encoded = encoded
    .replace(/#/g, '%23')  // Hash
    .replace(/\[/g, '%5B') // Opening bracket
    .replace(/\]/g, '%5D') // Closing bracket
    .replace(/\s+/g, '%20'); // Spaces
    
  return encoded;
};

/**
 * Gets partner settings from local storage
 * @returns {Object} The partner settings object
 */
export const getPartnerSettings = () => {
  try {
    const savedSettings = localStorage.getItem(PARTNER_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error retrieving partner settings:', error);
  }
  
  // Return default empty settings if nothing found or error occurs
  return {
    partnerId: '',
    irmp: '',
    irad: '',
    sharedId: '',
    subIds: {
      sub1: '',
      sub2: '',
      sub3: '',
    },
    utm: {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
    },
  };
};

/**
 * Generates an affiliate link with proper tracking parameters
 * @param {string} baseUrl - The base URL to add parameters to
 * @param {Object} options - Additional options for link generation
 * @param {Object} options.customParams - Custom parameters to override defaults
 * @param {boolean} options.includeUtm - Whether to include UTM parameters
 * @returns {string} The generated affiliate link
 */
export const generateAffiliateLink = (baseUrl, options = {}) => {
  if (!baseUrl) return '';
  
  const { customParams = {}, includeUtm = true } = options;
  const settings = getPartnerSettings();
  
  // Create URL object to handle parameters properly
  let url;
  try {
    url = new URL(baseUrl);
  } catch (error) {
    // If the URL is invalid, try adding https:// prefix
    try {
      url = new URL(`https://${baseUrl}`);
    } catch (secondError) {
      console.error('Invalid URL provided:', baseUrl);
      return baseUrl; // Return original URL if it's invalid
    }
  }
  
  // Add Impact Radius parameters
  if (customParams.irmp || settings.irmp) {
    url.searchParams.set('irmp', safeEncodeURIComponent(customParams.irmp || settings.irmp));
  }
  
  if (customParams.irad || settings.irad) {
    url.searchParams.set('irad', safeEncodeURIComponent(customParams.irad || settings.irad));
  }
  
  // Add Sub IDs
  if (customParams.sub1 || settings.subIds?.sub1) {
    url.searchParams.set('sub1', safeEncodeURIComponent(customParams.sub1 || settings.subIds?.sub1));
  }
  
  if (customParams.sub2 || settings.subIds?.sub2) {
    url.searchParams.set('sub2', safeEncodeURIComponent(customParams.sub2 || settings.subIds?.sub2));
  }
  
  if (customParams.sub3 || settings.subIds?.sub3) {
    url.searchParams.set('sub3', safeEncodeURIComponent(customParams.sub3 || settings.subIds?.sub3));
  }
  
  // Add Shared ID
  if (customParams.sharedId || settings.sharedId) {
    url.searchParams.set('sharedid', safeEncodeURIComponent(customParams.sharedId || settings.sharedId));
  }
  
  // Add Partner ID
  if (customParams.partnerId || settings.partnerId) {
    url.searchParams.set('partnerId', safeEncodeURIComponent(customParams.partnerId || settings.partnerId));
  }
  
  // Add UTM parameters if enabled
  if (includeUtm) {
    const utm = settings.utm || {};
    
    if (customParams.utmSource || utm.source) {
      url.searchParams.set('utm_source', safeEncodeURIComponent(customParams.utmSource || utm.source));
    }
    
    if (customParams.utmMedium || utm.medium) {
      url.searchParams.set('utm_medium', safeEncodeURIComponent(customParams.utmMedium || utm.medium));
    }
    
    if (customParams.utmCampaign || utm.campaign) {
      url.searchParams.set('utm_campaign', safeEncodeURIComponent(customParams.utmCampaign || utm.campaign));
    }
    
    if (customParams.utmContent || utm.content) {
      url.searchParams.set('utm_content', safeEncodeURIComponent(customParams.utmContent || utm.content));
    }
    
    if (customParams.utmTerm || utm.term) {
      url.searchParams.set('utm_term', safeEncodeURIComponent(customParams.utmTerm || utm.term));
    }
  }
  
  return url.toString();
}; 