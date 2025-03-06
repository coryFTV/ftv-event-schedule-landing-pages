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
  }
}

// Try to render the app with error handling
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found in the DOM');
  }
  
  // Use the older ReactDOM.render method if createRoot fails
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      // Remove StrictMode temporarily as it can cause double-rendering and issues
      <App />
    );
  } catch (createRootError) {
    console.warn('ReactDOM.createRoot failed, falling back to ReactDOM.render', createRootError);
    
    // Fallback to older rendering method
    ReactDOM.render(
      <App />,
      rootElement
    );
  }
} catch (error) {
  displayRenderError(error);
} 