import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Function to display error in the DOM if React fails to render
function displayRenderError(error) {
  console.error('Error rendering React app:', error);

  const errorDisplay = document.getElementById('error-display');
  const errorMessage = document.getElementById('error-message');
  const errorDetails = document.getElementById('error-details');

  if (errorDisplay && errorMessage && errorDetails) {
    errorDisplay.style.display = 'block';
    errorMessage.textContent = error ? error.message : 'Failed to render the application';
    errorDetails.textContent = error ? error.stack : '';
  } else {
    // Fallback if error elements don't exist
    document.body.innerHTML = `
      <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
        <h3>Application Failed to Start</h3>
        <p>${error ? error.message : 'Failed to render the application'}</p>
        <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; overflow: auto; max-height: 300px;">${error ? error.stack : ''}</pre>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Try to render the app with error handling
try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found in the DOM');
  }

  // Use ReactDOM.createRoot method (React 18+)
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // Remove StrictMode temporarily as it can cause double-rendering and issues
    <App />
  );
} catch (error) {
  displayRenderError(error);
}
