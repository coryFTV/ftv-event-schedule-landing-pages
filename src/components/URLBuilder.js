import React, { useState } from 'react';
import './URLBuilder.css';

function URLBuilder({ match, onClose }) {
  const [subId1, setSubId1] = useState('');
  const [subId2, setSubId2] = useState('');
  const [subId3, setSubId3] = useState('');
  const [sharedId, setSharedId] = useState('');
  const [property, setProperty] = useState('');
  
  // Base URL construction
  const baseUrl = match.url || match.matchUrl || match.networkUrl || 
    `https://www.fubo.tv/stream/${match.sport?.toLowerCase()}`;
  
  // Build the final URL with all parameters
  const buildFinalUrl = () => {
    let url = baseUrl;
    
    // Add parameters
    const params = new URLSearchParams();
    if (subId1) params.append('irmp', subId1);
    if (subId2) params.append('irad', subId2);
    if (subId3) params.append('irsub', subId3);
    if (sharedId) params.append('sharedid', sharedId);
    if (property) params.append('property', property);
    
    // Add to URL
    const paramString = params.toString();
    if (paramString) {
      url += (url.includes('?') ? '&' : '?') + paramString;
    }
    
    return url;
  };
  
  const finalUrl = buildFinalUrl();
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalUrl)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };
  
  return (
    <div className="url-builder-overlay">
      <div className="url-builder-container">
        <div className="url-builder-header">
          <h3>CREATE AND SHARE LINK</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="url-builder-subtitle">Promote {match.title} with a simple link</p>
        
        <div className="url-builder-form">
          <div className="form-group">
            <label htmlFor="subId1">Sub ID 1:</label>
            <input 
              type="text" 
              id="subId1" 
              value={subId1} 
              onChange={(e) => setSubId1(e.target.value)}
              placeholder="365718"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subId2">Sub ID 2:</label>
            <input 
              type="text" 
              id="subId2" 
              value={subId2} 
              onChange={(e) => setSubId2(e.target.value)}
              placeholder="596299"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subId3">Sub ID 3:</label>
            <input 
              type="text" 
              id="subId3" 
              value={subId3} 
              onChange={(e) => setSubId3(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sharedId">Shared ID:</label>
            <input 
              type="text" 
              id="sharedId" 
              value={sharedId} 
              onChange={(e) => setSharedId(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="property">Property:</label>
            <input 
              type="text" 
              id="property" 
              value={property} 
              onChange={(e) => setProperty(e.target.value)}
            />
          </div>
          
          <button className="create-button" onClick={copyToClipboard}>
            Create
          </button>
        </div>
        
        <div className="url-preview">
          <p>Use this link to promote {match.title}. Link updates may take up to 5 minutes to propagate.</p>
          <div className="url-display">
            <span className="url-protocol">https://</span>
            <input 
              type="text" 
              value={finalUrl.replace('https://', '')} 
              readOnly 
              className="url-input"
            />
          </div>
          
          <div className="share-options">
            <span>Share</span>
            <button className="share-button facebook">f</button>
            <button className="share-button twitter">𝕏</button>
            <button className="share-button copy" onClick={copyToClipboard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default URLBuilder; 