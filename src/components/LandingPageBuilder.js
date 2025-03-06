import React, { useState, useEffect, useCallback } from 'react';
import { useLinkGenerator } from '../hooks/useLinkGenerator';
import './URLBuilder.css'; // Reuse the same styles

function LandingPageBuilder({ landingPage, onClose }) {
  const {
    generatedLink,
    isCopied,
    error,
    generateLink,
    copyLinkToClipboard,
    getSettings,
  } = useLinkGenerator();
  
  const [customParams, setCustomParams] = useState({
    sub1: '',
    sub2: '',
    sub3: '',
    sharedId: '',
    partnerId: '',
  });
  const [includeUtm, setIncludeUtm] = useState(true);

  // Base URL construction
  const baseUrl = landingPage.landingPageUrl || '';

  // Generate the affiliate link - memoize with useCallback
  const updateGeneratedLink = useCallback(() => {
    generateLink(baseUrl, {
      customParams,
      includeUtm,
    });
  }, [baseUrl, customParams, includeUtm, generateLink]);

  // Load partner settings on mount
  useEffect(() => {
    const settings = getSettings();
    
    // Pre-populate fields with partner settings if they exist
    setCustomParams({
      sub1: settings.subIds?.sub1 || '',
      sub2: settings.subIds?.sub2 || '',
      sub3: settings.subIds?.sub3 || '',
      sharedId: settings.sharedId || '',
      partnerId: settings.partnerId || '',
    });
    
    // Initial link will be generated when customParams changes
  }, [getSettings]); // Only run on mount

  // Update the generated link whenever parameters change
  useEffect(() => {
    updateGeneratedLink();
  }, [updateGeneratedLink]); // updateGeneratedLink already has all the dependencies

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle UTM parameters
  const toggleUtm = () => {
    setIncludeUtm(prev => !prev);
  };

  return (
    <div className="url-builder-overlay">
      <div className="url-builder-container">
        <div className="url-builder-header">
          <h3>GENERATE LANDING PAGE URL</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="url-builder-subtitle">
          Customize the landing page URL for {landingPage.title}
        </p>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div className="url-builder-form">
          <div className="form-group">
            <label htmlFor="sub1">Sub ID 1:</label>
            <input
              type="text"
              id="sub1"
              name="sub1"
              value={customParams.sub1}
              onChange={handleInputChange}
              placeholder="365718"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sub2">Sub ID 2:</label>
            <input
              type="text"
              id="sub2"
              name="sub2"
              value={customParams.sub2}
              onChange={handleInputChange}
              placeholder="596299"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sub3">Sub ID 3:</label>
            <input
              type="text"
              id="sub3"
              name="sub3"
              value={customParams.sub3}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sharedId">Shared ID:</label>
            <input
              type="text"
              id="sharedId"
              name="sharedId"
              value={customParams.sharedId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="partnerId">Partner ID:</label>
            <input
              type="text"
              id="partnerId"
              name="partnerId"
              value={customParams.partnerId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="includeUtm"
              checked={includeUtm}
              onChange={toggleUtm}
            />
            <label htmlFor="includeUtm">Include UTM Parameters</label>
          </div>

          <button className="create-button" onClick={copyLinkToClipboard}>
            {isCopied ? 'Copied!' : 'Generate & Copy URL'}
          </button>
        </div>

        <div className="url-preview">
          <p>Use this link to promote {landingPage.title}.</p>
          <div className="url-display">
            <span className="url-protocol">https://</span>
            <input
              type="text"
              value={generatedLink.replace(/^https?:\/\//, '')}
              readOnly
              className="url-input"
            />
          </div>

          <div className="share-options">
            <span>Share</span>
            <button className="share-button facebook">f</button>
            <button className="share-button twitter">𝕏</button>
            <button 
              className={`share-button copy ${isCopied ? 'copied' : ''}`} 
              onClick={copyLinkToClipboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPageBuilder;

