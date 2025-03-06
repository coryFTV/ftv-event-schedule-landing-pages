import { renderHook, act } from '@testing-library/react-hooks';
import { useLinkGenerator } from './useLinkGenerator';
import * as linkGenerator from '../utils/linkGenerator';
import * as notificationService from '../utils/notificationService';

// Mock the link generator and notification service
jest.mock('../utils/linkGenerator', () => ({
  generateAffiliateLink: jest.fn(),
  getPartnerSettings: jest.fn(),
}));

jest.mock('../utils/notificationService', () => ({
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
});

describe('useLinkGenerator Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    linkGenerator.generateAffiliateLink.mockReturnValue('https://www.fubo.tv/stream/test?param=value');
    linkGenerator.getPartnerSettings.mockReturnValue({
      partnerId: 'test-partner',
      irmp: '123456',
    });
    
    navigator.clipboard.writeText.mockResolvedValue(undefined);
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    expect(result.current.generatedLink).toBe('');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should generate a link successfully', () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    act(() => {
      const link = result.current.generateLink('https://www.fubo.tv/stream/test');
      expect(link).toBe('https://www.fubo.tv/stream/test?param=value');
    });
    
    expect(result.current.generatedLink).toBe('https://www.fubo.tv/stream/test?param=value');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(linkGenerator.generateAffiliateLink).toHaveBeenCalledWith(
      'https://www.fubo.tv/stream/test',
      {}
    );
  });
  
  it('should handle link generation errors', () => {
    // Mock generateAffiliateLink to throw an error
    linkGenerator.generateAffiliateLink.mockImplementation(() => {
      throw new Error('Generation error');
    });
    
    const { result } = renderHook(() => useLinkGenerator());
    
    act(() => {
      const link = result.current.generateLink('https://www.fubo.tv/stream/test');
      expect(link).toBe('');
    });
    
    expect(result.current.generatedLink).toBe('');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe('Generation error');
  });
  
  it('should copy a link to clipboard successfully', async () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    // First generate a link
    act(() => {
      result.current.generateLink('https://www.fubo.tv/stream/test');
    });
    
    // Then copy it
    await act(async () => {
      const success = await result.current.copyLinkToClipboard();
      expect(success).toBe(true);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://www.fubo.tv/stream/test?param=value');
    expect(notificationService.notifySuccess).toHaveBeenCalledWith('Link copied to clipboard!');
    expect(result.current.isCopied).toBe(true);
    
    // After 2 seconds, isCopied should be reset
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(result.current.isCopied).toBe(false);
  });
  
  it('should handle clipboard errors', async () => {
    // Mock clipboard API to reject
    navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
    
    const { result } = renderHook(() => useLinkGenerator());
    
    // First generate a link
    act(() => {
      result.current.generateLink('https://www.fubo.tv/stream/test');
    });
    
    // Then try to copy it
    await act(async () => {
      const success = await result.current.copyLinkToClipboard();
      expect(success).toBe(false);
    });
    
    expect(notificationService.notifyError).toHaveBeenCalledWith('Failed to copy link: Clipboard error');
    expect(result.current.error).toBe('Clipboard error');
    expect(result.current.isCopied).toBe(false);
  });
  
  it('should get partner settings', () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    act(() => {
      const settings = result.current.getSettings();
      expect(settings).toEqual({
        partnerId: 'test-partner',
        irmp: '123456',
      });
    });
    
    expect(linkGenerator.getPartnerSettings).toHaveBeenCalled();
  });
  
  it('should reset the state', () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    // First generate a link and simulate an error
    act(() => {
      result.current.generateLink('https://www.fubo.tv/stream/test');
      result.current.error = 'Some error';
      result.current.isCopied = true;
    });
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.generatedLink).toBe('');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should allow copying a custom link', async () => {
    const { result } = renderHook(() => useLinkGenerator());
    
    const customLink = 'https://www.custom-link.com';
    
    await act(async () => {
      const success = await result.current.copyLinkToClipboard(customLink);
      expect(success).toBe(true);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(customLink);
    expect(notificationService.notifySuccess).toHaveBeenCalledWith('Link copied to clipboard!');
  });
}); 