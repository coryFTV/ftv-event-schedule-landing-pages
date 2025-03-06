import { useState, useCallback } from 'react';
import { generateAffiliateLink, getPartnerSettings } from '../utils/linkGenerator';
import { notifySuccess, notifyError } from '../utils/notificationService';

/**
 * Custom hook for generating and managing affiliate links
 * @returns {Object} Object containing link generation functions and state
 */
export const useLinkGenerator = () => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate an affiliate link with the given base URL and options
   * @param {string} baseUrl - The base URL to add parameters to
   * @param {Object} options - Additional options for link generation
   * @returns {string} The generated affiliate link
   */
  const generateLink = useCallback((baseUrl, options = {}) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const link = generateAffiliateLink(baseUrl, options);
      setGeneratedLink(link);
      setIsGenerating(false);
      return link;
    } catch (err) {
      setError(err.message || 'Error generating link');
      setIsGenerating(false);
      return '';
    }
  }, []);

  /**
   * Copy the generated link to clipboard
   * @returns {Promise<boolean>} Whether the copy was successful
   */
  const copyLinkToClipboard = useCallback(async (linkToCopy = generatedLink) => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setIsCopied(true);
      notifySuccess('Link copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return true;
    } catch (err) {
      setError(err.message || 'Error copying link');
      notifyError(`Failed to copy link: ${err.message}`);
      return false;
    }
  }, [generatedLink]);

  /**
   * Get partner settings from local storage
   * @returns {Object} The partner settings
   */
  const getSettings = useCallback(() => {
    return getPartnerSettings();
  }, []);

  /**
   * Reset the link generator state
   */
  const reset = useCallback(() => {
    setGeneratedLink('');
    setIsGenerating(false);
    setIsCopied(false);
    setError(null);
  }, []);

  return {
    generatedLink,
    isGenerating,
    isCopied,
    error,
    generateLink,
    copyLinkToClipboard,
    getSettings,
    reset,
  };
}; 