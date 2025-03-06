import React, { useState, useEffect } from 'react';
import './GoogleSheetsPreview.css';

function GoogleSheetsPreview({ sheetId, sheetName, range }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default values if not provided
  const effectiveSheetId = sheetId || '1yVXd40qGy8IVXe-LS79gFAiAFv476RPVQVY6whMR_hs';
  const effectiveSheetName = sheetName || 'Highlights';

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
  const getGidFromSheetName = name => {
    // Default to 0 (first sheet) if we don't know the gid
    return 0;
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load Google Sheet. Make sure the sheet is published to the web.');
    setLoading(false);
  };

  return (
    <div className="google-sheets-preview">
      <div className="content-card">
        <div className="sheets-header">
          <h2>Google Sheets Preview</h2>
          <div className="sheets-info">
            <div className="info-item">
              <span className="info-label">Sheet ID:</span>
              <span className="info-value">{effectiveSheetId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sheet Name:</span>
              <span className="info-value">{effectiveSheetName}</span>
            </div>
            {range && (
              <div className="info-item">
                <span className="info-label">Range:</span>
                <span className="info-value">{range}</span>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="sheets-loading">
            <div className="loading-spinner"></div>
            <p>Loading Google Sheet...</p>
          </div>
        )}

        {error && (
          <div className="sheets-error">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        )}

        <div className="sheets-iframe-container">
          <iframe
            src={buildPublicUrl()}
            title="Google Sheets Preview"
            className="sheets-iframe"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>

      <div className="content-card">
        <div className="sheets-instructions">
          <h3>How to make your sheet accessible</h3>
          <p>Follow these steps to publish your Google Sheet for embedding:</p>
          <ol>
            <li>Open your Google Sheet</li>
            <li>
              Click on <strong>File → Share → Publish to web</strong>
            </li>
            <li>Select the sheet you want to publish</li>
            <li>
              Click <strong>Publish</strong> and copy the URL
            </li>
            <li>
              The sheet ID is the long string in the URL between <code>/d/</code> and{' '}
              <code>/pubhtml</code>
            </li>
          </ol>
          <div className="sheets-note">
            <p>
              Note: This method only works with sheets that are published to the web. No API key
              required!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetsPreview;
