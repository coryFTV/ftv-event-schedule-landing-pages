import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display error messages
 * @param {Object} props Component props
 * @param {string} props.message Error message to display
 * @returns {JSX.Element} Error component
 */
const ErrorComponent = ({ message }) => (
  <div
    style={{
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
    }}
  >
    <h3>Error</h3>
    <p>{message || 'An unexpected error occurred'}</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Refresh Page
    </button>
  </div>
);

ErrorComponent.propTypes = {
  message: PropTypes.string,
};

export default ErrorComponent;
