import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PartnerConfig.css';

function PartnerConfig() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    partnerId: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    irad: '',
    irmp: '',
    sharedIdPrefix: '',
  });
  
  const [savedConfigs, setSavedConfigs] = useState([]);
  
  useEffect(() => {
    // Load saved configurations from localStorage
    const saved = localStorage.getItem('partnerConfigs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveConfig = () => {
    const newConfigs = [...savedConfigs, { ...config, id: Date.now() }];
    setSavedConfigs(newConfigs);
    localStorage.setItem('partnerConfigs', JSON.stringify(newConfigs));
    setConfig({
      partnerId: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      irad: '',
      irmp: '',
      sharedIdPrefix: '',
    });
  };
  
  const applyConfig = (savedConfig) => {
    // Build URL with parameters
    const params = new URLSearchParams();
    
    if (savedConfig.utmSource) params.append('utm_source', savedConfig.utmSource);
    if (savedConfig.utmMedium) params.append('utm_medium', savedConfig.utmMedium);
    if (savedConfig.utmCampaign) params.append('utm_campaign', savedConfig.utmCampaign);
    if (savedConfig.irad) params.append('IRAD', savedConfig.irad);
    if (savedConfig.irmp) params.append('IRMP', savedConfig.irmp);
    
    navigate(`/?${params.toString()}`);
  };
  
  const deleteConfig = (id) => {
    const newConfigs = savedConfigs.filter(config => config.id !== id);
    setSavedConfigs(newConfigs);
    localStorage.setItem('partnerConfigs', JSON.stringify(newConfigs));
  };
  
  return (
    <div className="partner-config">
      <h1>Partner Configuration</h1>
      
      <div className="config-form">
        <h2>Create New Configuration</h2>
        <div className="form-group">
          <label>Partner ID</label>
          <input 
            type="text" 
            name="partnerId" 
            value={config.partnerId} 
            onChange={handleChange} 
            placeholder="Partner ID"
          />
        </div>
        
        <h3>UTM Parameters</h3>
        <div className="form-group">
          <label>UTM Source</label>
          <input 
            type="text" 
            name="utmSource" 
            value={config.utmSource} 
            onChange={handleChange} 
            placeholder="utm_source"
          />
        </div>
        <div className="form-group">
          <label>UTM Medium</label>
          <input 
            type="text" 
            name="utmMedium" 
            value={config.utmMedium} 
            onChange={handleChange} 
            placeholder="utm_medium"
          />
        </div>
        <div className="form-group">
          <label>UTM Campaign</label>
          <input 
            type="text" 
            name="utmCampaign" 
            value={config.utmCampaign} 
            onChange={handleChange} 
            placeholder="utm_campaign"
          />
        </div>
        
        <h3>Impact Radius Parameters</h3>
        <div className="form-group">
          <label>IRAD</label>
          <input 
            type="text" 
            name="irad" 
            value={config.irad} 
            onChange={handleChange} 
            placeholder="IRAD"
          />
        </div>
        <div className="form-group">
          <label>IRMP</label>
          <input 
            type="text" 
            name="irmp" 
            value={config.irmp} 
            onChange={handleChange} 
            placeholder="IRMP"
          />
        </div>
        
        <div className="form-group">
          <label>SharedID Prefix (optional)</label>
          <input 
            type="text" 
            name="sharedIdPrefix" 
            value={config.sharedIdPrefix} 
            onChange={handleChange} 
            placeholder="SharedID Prefix"
          />
        </div>
        
        <button onClick={saveConfig} className="save-btn">Save Configuration</button>
      </div>
      
      <div className="saved-configs">
        <h2>Saved Configurations</h2>
        {savedConfigs.length === 0 ? (
          <p>No saved configurations yet.</p>
        ) : (
          <ul>
            {savedConfigs.map(config => (
              <li key={config.id}>
                <div className="config-card">
                  <h3>{config.partnerId || 'Unnamed Partner'}</h3>
                  <div className="config-details">
                    {config.utmSource && <p>UTM Source: {config.utmSource}</p>}
                    {config.irad && <p>IRAD: {config.irad}</p>}
                    {config.irmp && <p>IRMP: {config.irmp}</p>}
                  </div>
                  <div className="config-actions">
                    <button onClick={() => applyConfig(config)}>Apply</button>
                    <button onClick={() => deleteConfig(config.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PartnerConfig; 