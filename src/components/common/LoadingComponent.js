import React from 'react';

/**
 * Component to display loading state
 * @returns {JSX.Element} Loading component
 */
const LoadingComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Loading...</h2>
    <p>Please wait while we fetch the latest data</p>
    <div
      style={{
        display: 'inline-block',
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 2s linear infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingComponent;
