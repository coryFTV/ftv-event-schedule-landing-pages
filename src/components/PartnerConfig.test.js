import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PartnerConfig from './PartnerConfig';
import * as notificationService from '../utils/notificationService';

// Mock the notification service
jest.mock('../utils/notificationService', () => ({
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
  notifyWarning: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper function to render the component with router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PartnerConfig Component', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders the partner settings form', () => {
    renderWithRouter(<PartnerConfig />);
    
    // Check that the form title is rendered
    expect(screen.getByText('Partner Settings')).toBeInTheDocument();
    
    // Check that basic form fields are rendered
    expect(screen.getByLabelText('Partner ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Shared ID')).toBeInTheDocument();
    expect(screen.getByLabelText('IRMP (Impact Radius Media Partner)')).toBeInTheDocument();
    expect(screen.getByLabelText('IRAD (Impact Radius Ad ID)')).toBeInTheDocument();
    
    // Check that UTM fields are rendered
    expect(screen.getByLabelText('UTM Source')).toBeInTheDocument();
    expect(screen.getByLabelText('UTM Medium')).toBeInTheDocument();
    expect(screen.getByLabelText('UTM Campaign')).toBeInTheDocument();
    
    // Check that buttons are rendered
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
    expect(screen.getByText('Reset to Default')).toBeInTheDocument();
  });

  it('loads saved settings from localStorage on mount', () => {
    // Set up mock localStorage data
    const mockSettings = {
      partnerId: 'test-partner',
      irmp: '123456',
      irad: '789012',
      sharedId: 'test-shared',
      subIds: {
        sub1: 'test-sub1',
        sub2: 'test-sub2',
        sub3: 'test-sub3',
      },
      utm: {
        source: 'test-source',
        medium: 'test-medium',
        campaign: 'test-campaign',
      },
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
    
    renderWithRouter(<PartnerConfig />);
    
    // Check that form fields are populated with saved settings
    expect(screen.getByLabelText('Partner ID')).toHaveValue('test-partner');
    expect(screen.getByLabelText('IRMP (Impact Radius Media Partner)')).toHaveValue('123456');
    expect(screen.getByLabelText('IRAD (Impact Radius Ad ID)')).toHaveValue('789012');
    expect(screen.getByLabelText('Shared ID')).toHaveValue('test-shared');
    expect(screen.getByLabelText('Sub ID 1')).toHaveValue('test-sub1');
    expect(screen.getByLabelText('UTM Source')).toHaveValue('test-source');
    expect(screen.getByLabelText('UTM Medium')).toHaveValue('test-medium');
    expect(screen.getByLabelText('UTM Campaign')).toHaveValue('test-campaign');
  });

  it('saves settings to localStorage when Save Settings button is clicked', async () => {
    renderWithRouter(<PartnerConfig />);
    
    // Fill out form fields
    fireEvent.change(screen.getByLabelText('Partner ID'), { target: { value: 'new-partner' } });
    fireEvent.change(screen.getByLabelText('IRMP (Impact Radius Media Partner)'), { target: { value: '111222' } });
    fireEvent.change(screen.getByLabelText('UTM Source'), { target: { value: 'new-source' } });
    
    // Click save button
    fireEvent.click(screen.getByText('Save Settings'));
    
    // Check that localStorage.setItem was called with the correct values
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedSettings = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedSettings.partnerId).toBe('new-partner');
      expect(savedSettings.irmp).toBe('111222');
      expect(savedSettings.utm.source).toBe('new-source');
    });
    
    // Check that success notification was shown
    expect(notificationService.notifySuccess).toHaveBeenCalledWith('Partner settings saved successfully');
  });

  it('resets settings to default values when Reset to Default button is clicked', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    // Set up initial settings in localStorage
    const mockSettings = {
      partnerId: 'test-partner',
      irmp: '123456',
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
    
    renderWithRouter(<PartnerConfig />);
    
    // Verify initial settings are loaded
    expect(screen.getByLabelText('Partner ID')).toHaveValue('test-partner');
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset to Default'));
    
    // Check that form fields are reset
    await waitFor(() => {
      expect(screen.getByLabelText('Partner ID')).toHaveValue('');
      expect(screen.getByLabelText('IRMP (Impact Radius Media Partner)')).toHaveValue('');
    });
    
    // Check that localStorage was updated with default values
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Check that success notification was shown
    expect(notificationService.notifySuccess).toHaveBeenCalledWith('Settings reset to default values');
  });

  it('toggles advanced UTM parameters when Show Advanced button is clicked', () => {
    renderWithRouter(<PartnerConfig />);
    
    // Advanced UTM fields should not be visible initially
    expect(screen.queryByLabelText('UTM Content')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('UTM Term')).not.toBeInTheDocument();
    
    // Click Show Advanced button
    fireEvent.click(screen.getByText('Show Advanced'));
    
    // Advanced UTM fields should now be visible
    expect(screen.getByLabelText('UTM Content')).toBeInTheDocument();
    expect(screen.getByLabelText('UTM Term')).toBeInTheDocument();
    
    // Button text should change
    expect(screen.getByText('Hide Advanced')).toBeInTheDocument();
    
    // Click Hide Advanced button
    fireEvent.click(screen.getByText('Hide Advanced'));
    
    // Advanced UTM fields should be hidden again
    expect(screen.queryByLabelText('UTM Content')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('UTM Term')).not.toBeInTheDocument();
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    renderWithRouter(<PartnerConfig />);
    
    // Check that error notification was shown
    expect(notificationService.notifyError).toHaveBeenCalledWith('Error loading saved settings: localStorage error');
    
    // Form should still render with default values
    expect(screen.getByLabelText('Partner ID')).toHaveValue('');
  });
}); 