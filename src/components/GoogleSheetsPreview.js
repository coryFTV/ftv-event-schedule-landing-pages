import React, { useState, useEffect } from 'react';
import './GoogleSheetsPreview.css';

function GoogleSheetsPreview({ sheetId, sheetName, range }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default values if not provided
  const effectiveSheetId = sheetId || "1yVXd40qGy8IVXe-LS79gFAiAFv476RPVQVY6whMR_hs";
  const effectiveSheetName = sheetName || "Highlights";
  
  // Build the public Google Sheets URL for embedding
  const buildPublicUrl = () => {
    // Base URL for published sheets
    let url = `https://docs.google.com/spreadsheets/d/${effectiveSheetId}/pubhtml`;
    
    // Add sheet name if specified
    if (effectiveSheetName) {
      url += `?gid=${getGidFromSheetName(effectiveSheetName)}`;
    }
    
    // Range is handled by the iframe's display, not in the URL
    return url;
  };
  
  // This is a placeholder - in a real app, you'd need to fetch the gid
  // or use a mapping of sheet names to gids
  const getGidFromSheetName = (name) => {
    // Default to 0 (first sheet) if we don't know the gid
    return 0;
  };
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    setError("Failed to load Google Sheet. Make sure the sheet is published to the web.");
    setLoading(false);
  };
  
  return (
    <div className="google-sheets-preview">
      <div className="sheets-header">
        <h2>Google Sheets Preview</h2>
        <div className="sheets-info">
          <p>Sheet ID: {effectiveSheetId}</p>
          <p>Sheet Name: {effectiveSheetName}</p>
          {range && <p>Range: {range}</p>}
        </div>
      </div>
      
      {loading && <div className="sheets-loading">Loading Google Sheet...</div>}
      {error && <div className="sheets-error">{error}</div>}
      
      <div className="sheets-iframe-container">
        <iframe 
          src={buildPublicUrl()}
          title="Google Sheets Preview"
          className="sheets-iframe"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
      
      <div className="sheets-instructions">
        <h3>How to make your sheet accessible:</h3>
        <ol>
          <li>Open your Google Sheet</li>
          <li>Click on File → Share → Publish to web</li>
          <li>Select the sheet you want to publish</li>
          <li>Click "Publish" and copy the URL</li>
          <li>The sheet ID is the long string in the URL between /d/ and /pubhtml</li>
        </ol>
        <p className="sheets-note">Note: This method only works with sheets that are published to the web. No API key required!</p>
      </div>
    </div>
  );
}

export default GoogleSheetsPreview; 