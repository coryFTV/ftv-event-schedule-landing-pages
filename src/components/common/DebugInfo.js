import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display debug information
 * @param {Object} props Component props
 * @param {Object} props.appState Application state object
 * @returns {JSX.Element} Debug info component
 */
const DebugInfo = ({ appState }) => {
  const [expanded, setExpanded] = useState(false);

  if (!appState) {
    return null;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label="Debug information panel"
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff00',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        maxHeight: expanded ? '80vh' : '200px',
        overflow: 'auto',
        zIndex: 9999,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={toggleExpanded}
      onKeyDown={handleKeyDown}
    >
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Debug Info {expanded ? '(click to collapse)' : '(click to expand)'}
      </div>
      {expanded && (
        <>
          <div style={{ marginBottom: '5px' }}>
            <strong>Last Action:</strong> {appState.lastAction || 'None'}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Data Load Status:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Sports: {appState.dataLoadStatus?.sports || 'Not loaded'}</li>
              <li>Movies: {appState.dataLoadStatus?.movies || 'Not loaded'}</li>
              <li>Series: {appState.dataLoadStatus?.series || 'Not loaded'}</li>
            </ul>
          </div>
          <div>
            <strong>Full State:</strong>
            <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(appState, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

DebugInfo.propTypes = {
  appState: PropTypes.shape({
    lastAction: PropTypes.string,
    dataLoadStatus: PropTypes.shape({
      sports: PropTypes.string,
      movies: PropTypes.string,
      series: PropTypes.string,
    }),
  }),
};

export default DebugInfo;
