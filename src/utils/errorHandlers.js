/**
 * Sets up global error handlers for the application
 */
export const setupGlobalErrorHandlers = () => {
  // Global error handler
  window.addEventListener('error', event => {
    console.error('Global error caught:', event.error);
    // Log additional details about the error
    console.error('Error message:', event.error?.message);
    console.error('Error stack:', event.error?.stack);
    console.error('Error type:', event.error?.constructor?.name);
    console.error('Error event:', event);

    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px;">
        <h3>Application Error</h3>
        <p>The application encountered an error: ${event.error?.message || 'Unknown error'}</p>
        <p>Error type: ${event.error?.constructor?.name || 'Unknown'}</p>
        <p>Please check the console for more details or refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  });

  // Global promise rejection handler
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    console.error('Rejection reason:', event.reason?.message);
    console.error('Rejection stack:', event.reason?.stack);
    console.error('Rejection type:', event.reason?.constructor?.name);
    console.error('Rejection event:', event);
  });
};

export default setupGlobalErrorHandlers;
