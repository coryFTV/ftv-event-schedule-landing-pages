import React from 'react';
import './ErrorDisplay.css';

function ErrorDisplay({ error, retry }) {
  return (
    <div className="error-container">
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      <p>This could be due to:</p>
      <ul>
        <li>Missing or incorrect API credentials</li>
        <li>Network connectivity issues</li>
        <li>CORS restrictions</li>
        <li>API rate limiting</li>
      </ul>
      {retry && (
        <button 
          className="action-button" 
          onClick={retry}
        >
          Try Again
        </button>
      )}
      <div className="error-help">
        <p>
          <strong>Need help?</strong> Make sure your Account SID and Auth Token are correctly set in the .env file.
        </p>
      </div>
    </div>
  );
}

export default ErrorDisplay; 