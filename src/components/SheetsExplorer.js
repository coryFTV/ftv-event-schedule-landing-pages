import React, { useState } from 'react';
import GoogleSheetsPreview from './GoogleSheetsPreview';
import './SheetsExplorer.css';

function SheetsExplorer() {
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [savedSheets, setSavedSheets] = useState(() => {
    // Load saved sheets from localStorage if available
    const saved = localStorage.getItem('savedSheets');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1yVXd40qGy8IVXe-LS79gFAiAFv476RPVQVY6whMR_hs',
            name: 'Highlights',
            description: 'Key Events on Fubo',
          },
        ];
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (sheetId) {
      setShowPreview(true);
    }
  };

  const saveSheet = () => {
    if (!sheetId) return;

    const description = prompt('Enter a description for this sheet:');
    if (description) {
      const newSavedSheets = [
        ...savedSheets,
        {
          id: sheetId,
          name: sheetName || 'Sheet1',
          description,
        },
      ];

      setSavedSheets(newSavedSheets);
      localStorage.setItem('savedSheets', JSON.stringify(newSavedSheets));
    }
  };

  const loadSavedSheet = sheet => {
    setSheetId(sheet.id);
    setSheetName(sheet.name);
    setShowPreview(true);
  };

  const removeSavedSheet = index => {
    const confirmed = window.confirm('Are you sure you want to remove this saved sheet?');
    if (confirmed) {
      const newSavedSheets = [...savedSheets];
      newSavedSheets.splice(index, 1);
      setSavedSheets(newSavedSheets);
      localStorage.setItem('savedSheets', JSON.stringify(newSavedSheets));
    }
  };

  return (
    <div className="sheets-explorer">
      <div className="content-card">
        <h1>Google Sheets Explorer</h1>
        <p>View and explore Google Sheets data directly in this application.</p>

        <form onSubmit={handleSubmit} className="sheets-form">
          <div className="form-group">
            <label htmlFor="sheetId">Google Sheet ID:</label>
            <input
              type="text"
              id="sheetId"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
              placeholder="Enter Google Sheet ID"
              required
            />
            <small className="form-help">The ID is the part of the URL between /d/ and /edit</small>
          </div>

          <div className="form-group">
            <label htmlFor="sheetName">Sheet Name (optional):</label>
            <input
              type="text"
              id="sheetName"
              value={sheetName}
              onChange={e => setSheetName(e.target.value)}
              placeholder="Sheet1"
            />
            <small className="form-help">Leave blank to use the first sheet</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn">
              Load Sheet
            </button>
            {sheetId && showPreview && (
              <button type="button" className="btn btn-secondary" onClick={saveSheet}>
                Save for Later
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="content-card">
        <h2>Saved Sheets</h2>

        {savedSheets.length > 0 ? (
          <div className="saved-sheets-list">
            {savedSheets.map((sheet, index) => (
              <div key={index} className="saved-sheet-item">
                <div className="saved-sheet-info">
                  <h3>{sheet.description}</h3>
                  <div className="saved-sheet-details">
                    <span>ID: {sheet.id}</span>
                    <span>Sheet: {sheet.name}</span>
                  </div>
                </div>
                <div className="saved-sheet-actions">
                  <button className="btn" onClick={() => loadSavedSheet(sheet)}>
                    Load
                  </button>
                  <button className="btn btn-secondary" onClick={() => removeSavedSheet(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-saved-sheets">
            No saved sheets yet. Load a sheet and save it for quick access later.
          </p>
        )}
      </div>

      {showPreview && (
        <div className="content-card">
          <h2>Sheet Preview</h2>
          <GoogleSheetsPreview sheetId={sheetId} sheetName={sheetName} />
        </div>
      )}
    </div>
  );
}

export default SheetsExplorer;
