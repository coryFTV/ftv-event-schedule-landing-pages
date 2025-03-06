import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError, notifyWarning } from '../utils/notificationService';
import './PartnerConfig.css';

// Local storage key for partner settings
const PARTNER_SETTINGS_KEY = 'fuboPartnerSettings';

function PartnerConfig() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    partnerId: '',
    irmp: '',
    irad: '',
    sharedId: '',
    subIds: {
      sub1: '',
      sub2: '',
      sub3: '',
    },
    utm: {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
    },
    showAdvancedUtm: false,
  });

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(PARTNER_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings,
          // Ensure subIds and utm objects exist even if not in saved settings
          subIds: {
            ...prevSettings.subIds,
            ...(parsedSettings.subIds || {}),
          },
          utm: {
            ...prevSettings.utm,
            ...(parsedSettings.utm || {}),
          },
        }));
      } catch (error) {
        notifyError(`Error loading saved settings: ${error.message}`);
      }
    }
  }, []);

  // Handle basic field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle nested subIds changes
  const handleSubIdChange = e => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      subIds: {
        ...prev.subIds,
        [name]: value,
      },
    }));
  };

  // Handle nested UTM parameter changes
  const handleUtmChange = e => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      utm: {
        ...prev.utm,
        [name]: value,
      },
    }));
  };

  // Toggle advanced UTM parameters visibility
  const toggleAdvancedUtm = () => {
    setSettings(prev => ({
      ...prev,
      showAdvancedUtm: !prev.showAdvancedUtm,
    }));
  };

  // Save settings to local storage
  const saveSettings = () => {
    try {
      localStorage.setItem(PARTNER_SETTINGS_KEY, JSON.stringify(settings));
      notifySuccess('Partner settings saved successfully');
    } catch (error) {
      notifyError(`Error saving settings: ${error.message}`);
    }
  };

  // Reset settings to default values
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings = {
        partnerId: '',
        irmp: '',
        irad: '',
        sharedId: '',
        subIds: {
          sub1: '',
          sub2: '',
          sub3: '',
        },
        utm: {
          source: '',
          medium: '',
          campaign: '',
          content: '',
          term: '',
        },
        showAdvancedUtm: false,
      };
      
      setSettings(defaultSettings);
      localStorage.setItem(PARTNER_SETTINGS_KEY, JSON.stringify(defaultSettings));
      notifySuccess('Settings reset to default values');
    }
  };

  return (
    <div className="partner-config">
      <div className="content-card">
        <h1>Partner Settings</h1>
        <p>Configure your affiliate partner settings for URL generation and tracking.</p>

        <div className="config-form">
          <div className="form-section-title">Basic Settings</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="partnerId">Partner ID</label>
              <input
                type="text"
                id="partnerId"
                name="partnerId"
                value={settings.partnerId}
                onChange={handleChange}
                placeholder="e.g. partner123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sharedId">Shared ID</label>
              <input
                type="text"
                id="sharedId"
                name="sharedId"
                value={settings.sharedId}
                onChange={handleChange}
                placeholder="e.g. partner_shared"
              />
            </div>
          </div>

          <div className="form-section-title">Impact Radius Parameters</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="irmp">IRMP (Impact Radius Media Partner)</label>
              <input
                type="text"
                id="irmp"
                name="irmp"
                value={settings.irmp}
                onChange={handleChange}
                placeholder="e.g. 123456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="irad">IRAD (Impact Radius Ad ID)</label>
              <input
                type="text"
                id="irad"
                name="irad"
                value={settings.irad}
                onChange={handleChange}
                placeholder="e.g. 789012"
              />
            </div>
          </div>

          <div className="form-section-title">Sub IDs</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sub1">Sub ID 1</label>
              <input
                type="text"
                id="sub1"
                name="sub1"
                value={settings.subIds.sub1}
                onChange={handleSubIdChange}
                placeholder="e.g. campaign1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub2">Sub ID 2</label>
              <input
                type="text"
                id="sub2"
                name="sub2"
                value={settings.subIds.sub2}
                onChange={handleSubIdChange}
                placeholder="e.g. source1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub3">Sub ID 3</label>
              <input
                type="text"
                id="sub3"
                name="sub3"
                value={settings.subIds.sub3}
                onChange={handleSubIdChange}
                placeholder="e.g. placement1"
              />
            </div>
          </div>

          <div className="form-section-title">
            UTM Parameters
            <button
              type="button"
              className="btn-link toggle-advanced"
              onClick={toggleAdvancedUtm}
            >
              {settings.showAdvancedUtm ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source">UTM Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={settings.utm.source}
                onChange={handleUtmChange}
                placeholder="e.g. partner_website"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medium">UTM Medium</label>
              <input
                type="text"
                id="medium"
                name="medium"
                value={settings.utm.medium}
                onChange={handleUtmChange}
                placeholder="e.g. referral"
              />
            </div>

            <div className="form-group">
              <label htmlFor="campaign">UTM Campaign</label>
              <input
                type="text"
                id="campaign"
                name="campaign"
                value={settings.utm.campaign}
                onChange={handleUtmChange}
                placeholder="e.g. summer_promo"
              />
            </div>
          </div>

          {settings.showAdvancedUtm && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="content">UTM Content</label>
                <input
                  type="text"
                  id="content"
                  name="content"
                  value={settings.utm.content}
                  onChange={handleUtmChange}
                  placeholder="e.g. banner_top"
                />
              </div>

              <div className="form-group">
                <label htmlFor="term">UTM Term</label>
                <input
                  type="text"
                  id="term"
                  name="term"
                  value={settings.utm.term}
                  onChange={handleUtmChange}
                  placeholder="e.g. sports_fans"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn" onClick={saveSettings}>
              Save Settings
            </button>
            <button className="btn btn-secondary" onClick={resetSettings}>
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerConfig;
