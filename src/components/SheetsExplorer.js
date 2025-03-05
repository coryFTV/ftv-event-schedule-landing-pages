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
    return saved ? JSON.parse(saved) : [
      {
        id: '1yVXd40qGy8IVXe-LS79gFAiAFv476RPVQVY6whMR_hs',
        name: 'Highlights',
        description: 'Key Events on Fubo'
      }
    ];
  });

  const handleSubmit = (e) => {
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
          description
        }
      ];
      
      setSavedSheets(newSavedSheets);
      localStorage.setItem('savedSheets', JSON.stringify(newSavedSheets));
    }
  };

  const loadSavedSheet = (sheet) => {
    setSheetId(sheet.id);
    setSheetName(sheet.name);
    setShowPreview(true);
  };

  const removeSavedSheet = (index) => {
    const newSavedSheets = [...savedSheets];
    newSavedSheets.splice(index, 1);
    setSavedSheets(newSavedSheets);
    localStorage.setItem('savedSheets', JSON.stringify(newSavedSheets));
  };

  return (
    <div className="sheets-explorer">
      <h1>Google Sheets Explorer</h1>
      
      <div className="sheets-explorer-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sheetId">Google Sheet ID:</label>
            <input
              type="text"
              id="sheetId"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Enter Google Sheet ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sheetName">Sheet Name (optional):</label>
            <input
              type="text"
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Default: first sheet"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="view-button">View Sheet</button>
            <button type="button" className="save-button" onClick={saveSheet} disabled={!sheetId}>
              Save for Later
            </button>
          </div>
        </form>
      </div>
      
      <div className="saved-sheets">
        <h2>Saved Sheets</h2>
        {savedSheets.length > 0 ? (
          <ul className="saved-sheets-list">
            {savedSheets.map((sheet, index) => (
              <li key={index} className="saved-sheet-item">
                <div className="saved-sheet-info">
                  <h3>{sheet.description}</h3>
                  <p>ID: {sheet.id}</p>
                  <p>Sheet: {sheet.name}</p>
                </div>
                <div className="saved-sheet-actions">
                  <button 
                    className="load-button" 
                    onClick={() => loadSavedSheet(sheet)}
                  >
                    Load
                  </button>
                  <button 
                    className="remove-button" 
                    onClick={() => removeSavedSheet(index)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-saved-sheets">No saved sheets yet. Enter a Sheet ID above and save it for quick access.</p>
        )}
      </div>
      
      {showPreview && sheetId && (
        <div className="sheet-preview-container">
          <h2>Sheet Preview</h2>
          <GoogleSheetsPreview 
            sheetId={sheetId} 
            sheetName={sheetName} 
          />
        </div>
      )}
    </div>
  );
}

export default SheetsExplorer; 