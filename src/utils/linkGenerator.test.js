import { safeEncodeURIComponent, getPartnerSettings, generateAffiliateLink } from './linkGenerator';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Link Generator Utility', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('safeEncodeURIComponent', () => {
    it('should handle empty or null values', () => {
      expect(safeEncodeURIComponent('')).toBe('');
      expect(safeEncodeURIComponent(null)).toBe('');
      expect(safeEncodeURIComponent(undefined)).toBe('');
    });

    it('should encode special characters correctly', () => {
      expect(safeEncodeURIComponent('test#hash')).toBe('test%23hash');
      expect(safeEncodeURIComponent('test [brackets]')).toBe('test%20%5Bbrackets%5D');
      expect(safeEncodeURIComponent('test with spaces')).toBe('test%20with%20spaces');
      expect(safeEncodeURIComponent('test%percent')).toBe('test%25percent');
    });

    it('should handle non-string values', () => {
      expect(safeEncodeURIComponent(123)).toBe('123');
      expect(safeEncodeURIComponent(true)).toBe('true');
    });
  });

  describe('getPartnerSettings', () => {
    it('should return default settings when localStorage is empty', () => {
      const settings = getPartnerSettings();
      expect(settings).toHaveProperty('partnerId', '');
      expect(settings).toHaveProperty('irmp', '');
      expect(settings).toHaveProperty('irad', '');
      expect(settings).toHaveProperty('subIds');
      expect(settings).toHaveProperty('utm');
    });

    it('should return settings from localStorage when available', () => {
      const mockSettings = {
        partnerId: 'test-partner',
        irmp: '123456',
        irad: '789012',
        sharedId: 'test-shared',
        subIds: {
          sub1: 'test-sub1',
        },
        utm: {
          source: 'test-source',
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const settings = getPartnerSettings();
      expect(settings).toEqual(mockSettings);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('fuboPartnerSettings');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const settings = getPartnerSettings();
      expect(settings).toHaveProperty('partnerId', '');
      expect(settings).toHaveProperty('irmp', '');
    });
  });

  describe('generateAffiliateLink', () => {
    it('should handle empty or invalid URLs', () => {
      expect(generateAffiliateLink('')).toBe('');
      expect(generateAffiliateLink(null)).toBe('');
      expect(generateAffiliateLink(undefined)).toBe('');
      
      // Invalid URL should return the original URL
      const invalidUrl = 'not-a-valid-url';
      expect(generateAffiliateLink(invalidUrl)).toBe(invalidUrl);
    });

    it('should add https:// prefix if missing', () => {
      const url = 'www.fubo.tv';
      const result = generateAffiliateLink(url);
      expect(result).toContain('https://www.fubo.tv');
    });

    it('should add parameters from partner settings', () => {
      const mockSettings = {
        partnerId: 'test-partner',
        irmp: '123456',
        irad: '789012',
        sharedId: 'test-shared',
        subIds: {
          sub1: 'test-sub1',
          sub2: 'test-sub2',
          sub3: 'test-sub3',
        },
        utm: {
          source: 'test-source',
          medium: 'test-medium',
          campaign: 'test-campaign',
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const url = 'https://www.fubo.tv/stream/soccer';
      const result = generateAffiliateLink(url);
      
      expect(result).toContain('irmp=123456');
      expect(result).toContain('irad=789012');
      expect(result).toContain('sharedid=test-shared');
      expect(result).toContain('sub1=test-sub1');
      expect(result).toContain('sub2=test-sub2');
      expect(result).toContain('sub3=test-sub3');
      expect(result).toContain('partnerId=test-partner');
      expect(result).toContain('utm_source=test-source');
      expect(result).toContain('utm_medium=test-medium');
      expect(result).toContain('utm_campaign=test-campaign');
    });

    it('should override partner settings with custom parameters', () => {
      const mockSettings = {
        irmp: '123456',
        irad: '789012',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const url = 'https://www.fubo.tv/stream/soccer';
      const customParams = {
        irmp: 'custom-irmp',
        utmSource: 'custom-source',
      };
      
      const result = generateAffiliateLink(url, { customParams });
      
      expect(result).toContain('irmp=custom-irmp');
      expect(result).toContain('irad=789012');
      expect(result).toContain('utm_source=custom-source');
    });

    it('should not include UTM parameters when includeUtm is false', () => {
      const mockSettings = {
        irmp: '123456',
        utm: {
          source: 'test-source',
          medium: 'test-medium',
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const url = 'https://www.fubo.tv/stream/soccer';
      const result = generateAffiliateLink(url, { includeUtm: false });
      
      expect(result).toContain('irmp=123456');
      expect(result).not.toContain('utm_source');
      expect(result).not.toContain('utm_medium');
    });

    it('should handle URLs with existing parameters', () => {
      const mockSettings = {
        irmp: '123456',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const url = 'https://www.fubo.tv/stream/soccer?existing=param';
      const result = generateAffiliateLink(url);
      
      expect(result).toContain('existing=param');
      expect(result).toContain('irmp=123456');
    });

    it('should handle special characters in parameters', () => {
      const mockSettings = {
        irmp: 'test#hash',
        utm: {
          campaign: 'test [campaign]',
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const url = 'https://www.fubo.tv/stream/soccer';
      const result = generateAffiliateLink(url);
      
      expect(result).toContain('irmp=test%23hash');
      expect(result).toContain('utm_campaign=test%20%5Bcampaign%5D');
    });
  });
}); 