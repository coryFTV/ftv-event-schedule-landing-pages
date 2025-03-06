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

  const handleChange = e => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveConfig = () => {
    // Validate that at least one field has a value
    const hasValue = Object.values(config).some(val => val.trim() !== '');
    if (!hasValue) {
      alert('Please fill in at least one field before saving.');
      return;
    }

    const configName = prompt('Enter a name for this configuration:');
    if (!configName) return;

    const newConfigs = [...savedConfigs, { ...config, id: Date.now(), name: configName }];
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

  const applyConfig = savedConfig => {
    // Build query string from config
    const params = new URLSearchParams();

    Object.entries(savedConfig).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name' && value) {
        params.append(key, value);
      }
    });

    // Navigate to the schedule view with the parameters
    navigate(`/?${params.toString()}`);
  };

  const deleteConfig = id => {
    const confirmed = window.confirm('Are you sure you want to delete this configuration?');
    if (confirmed) {
      const newConfigs = savedConfigs.filter(config => config.id !== id);
      setSavedConfigs(newConfigs);
      localStorage.setItem('partnerConfigs', JSON.stringify(newConfigs));
    }
  };

  return (
    <div className="partner-config">
      <div className="content-card">
        <h1>Partner Configuration</h1>
        <p>Configure partner parameters for URL generation and tracking.</p>

        <div className="config-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="partnerId">Partner ID</label>
              <input
                type="text"
                id="partnerId"
                name="partnerId"
                value={config.partnerId}
                onChange={handleChange}
                placeholder="e.g. partner123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sharedIdPrefix">Shared ID Prefix</label>
              <input
                type="text"
                id="sharedIdPrefix"
                name="sharedIdPrefix"
                value={config.sharedIdPrefix}
                onChange={handleChange}
                placeholder="e.g. partner_"
              />
            </div>
          </div>

          <div className="form-section-title">UTM Parameters</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="utmSource">UTM Source</label>
              <input
                type="text"
                id="utmSource"
                name="utmSource"
                value={config.utmSource}
                onChange={handleChange}
                placeholder="e.g. partner_website"
              />
            </div>

            <div className="form-group">
              <label htmlFor="utmMedium">UTM Medium</label>
              <input
                type="text"
                id="utmMedium"
                name="utmMedium"
                value={config.utmMedium}
                onChange={handleChange}
                placeholder="e.g. referral"
              />
            </div>

            <div className="form-group">
              <label htmlFor="utmCampaign">UTM Campaign</label>
              <input
                type="text"
                id="utmCampaign"
                name="utmCampaign"
                value={config.utmCampaign}
                onChange={handleChange}
                placeholder="e.g. summer_promo"
              />
            </div>
          </div>

          <div className="form-section-title">Impact Radius Parameters</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="irad">IRAD (Impact Radius Ad ID)</label>
              <input
                type="text"
                id="irad"
                name="irad"
                value={config.irad}
                onChange={handleChange}
                placeholder="e.g. 123456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="irmp">IRMP (Impact Radius Media Partner)</label>
              <input
                type="text"
                id="irmp"
                name="irmp"
                value={config.irmp}
                onChange={handleChange}
                placeholder="e.g. 789012"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn" onClick={saveConfig}>
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <h2>Saved Configurations</h2>

        {savedConfigs.length > 0 ? (
          <div className="saved-configs">
            {savedConfigs.map(savedConfig => (
              <div key={savedConfig.id} className="config-card">
                <div className="config-card-header">
                  <h3>{savedConfig.name || 'Unnamed Configuration'}</h3>
                </div>
                <div className="config-card-body">
                  {savedConfig.partnerId && (
                    <div className="config-item">
                      <span className="config-label">Partner ID:</span>
                      <span className="config-value">{savedConfig.partnerId}</span>
                    </div>
                  )}
                  {savedConfig.utmSource && (
                    <div className="config-item">
                      <span className="config-label">UTM Source:</span>
                      <span className="config-value">{savedConfig.utmSource}</span>
                    </div>
                  )}
                  {(savedConfig.irad || savedConfig.irmp) && (
                    <div className="config-item">
                      <span className="config-label">Impact Radius:</span>
                      <span className="config-value">
                        {savedConfig.irad && `IRAD: ${savedConfig.irad}`}
                        {savedConfig.irad && savedConfig.irmp && ' | '}
                        {savedConfig.irmp && `IRMP: ${savedConfig.irmp}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="config-card-actions">
                  <button className="btn" onClick={() => applyConfig(savedConfig)}>
                    Apply
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => deleteConfig(savedConfig.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-configs">
            No saved configurations yet. Create and save a configuration to see it here.
          </p>
        )}
      </div>
    </div>
  );
}

export default PartnerConfig;
