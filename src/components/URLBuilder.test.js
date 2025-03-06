import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import URLBuilder from './URLBuilder';
import * as linkGenerator from '../utils/linkGenerator';
import * as notificationService from '../utils/notificationService';

// Mock the link generator and notification service
jest.mock('../utils/linkGenerator', () => ({
  generateAffiliateLink: jest.fn(),
  getPartnerSettings: jest.fn(),
}));

jest.mock('../utils/notificationService', () => ({
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
});

describe('URLBuilder Component', () => {
  const mockMatch = {
    id: 'test-id',
    title: 'Test Match',
    url: 'https://www.fubo.tv/stream/test',
    sport: 'soccer',
  };
  
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    linkGenerator.generateAffiliateLink.mockReturnValue('https://www.fubo.tv/stream/test?param=value');
    linkGenerator.getPartnerSettings.mockReturnValue({
      partnerId: 'default-partner',
      irmp: 'default-irmp',
      irad: 'default-irad',
      sharedId: 'default-shared',
      subIds: {
        sub1: 'default-sub1',
        sub2: 'default-sub2',
        sub3: 'default-sub3',
      },
    });
    
    navigator.clipboard.writeText.mockResolvedValue(undefined);
  });
  
  it('renders the URLBuilder component with match title', () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('CREATE AND SHARE LINK')).toBeInTheDocument();
    expect(screen.getByText(`Promote ${mockMatch.title} with a simple link`)).toBeInTheDocument();
  });
  
  it('loads partner settings on mount', () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    expect(linkGenerator.getPartnerSettings).toHaveBeenCalled();
    expect(linkGenerator.generateAffiliateLink).toHaveBeenCalled();
  });
  
  it('updates the link when parameters change', async () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    // Initial call on mount
    expect(linkGenerator.generateAffiliateLink).toHaveBeenCalledTimes(1);
    
    // Change a parameter
    fireEvent.change(screen.getByLabelText('Sub ID 1:'), { target: { value: 'new-sub1' } });
    
    // Should call generateAffiliateLink again
    await waitFor(() => {
      expect(linkGenerator.generateAffiliateLink).toHaveBeenCalledTimes(2);
    });
    
    // Check that it was called with the updated parameters
    expect(linkGenerator.generateAffiliateLink).toHaveBeenLastCalledWith(
      mockMatch.url,
      expect.objectContaining({
        customParams: expect.objectContaining({
          sub1: 'new-sub1',
        }),
      })
    );
  });
  
  it('toggles UTM parameters', async () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    // Initial state should include UTM
    expect(screen.getByLabelText('Include UTM Parameters')).toBeChecked();
    
    // Toggle UTM off
    fireEvent.click(screen.getByLabelText('Include UTM Parameters'));
    
    // Should call generateAffiliateLink with includeUtm: false
    await waitFor(() => {
      expect(linkGenerator.generateAffiliateLink).toHaveBeenLastCalledWith(
        mockMatch.url,
        expect.objectContaining({
          includeUtm: false,
        })
      );
    });
    
    // Toggle UTM back on
    fireEvent.click(screen.getByLabelText('Include UTM Parameters'));
    
    // Should call generateAffiliateLink with includeUtm: true
    await waitFor(() => {
      expect(linkGenerator.generateAffiliateLink).toHaveBeenLastCalledWith(
        mockMatch.url,
        expect.objectContaining({
          includeUtm: true,
        })
      );
    });
  });
  
  it('copies the link to clipboard and shows success notification', async () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    // Click the copy button
    fireEvent.click(screen.getByText('Create & Copy'));
    
    // Should call clipboard API
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://www.fubo.tv/stream/test?param=value');
    
    // Should show success notification
    await waitFor(() => {
      expect(notificationService.notifySuccess).toHaveBeenCalledWith('Link copied to clipboard!');
    });
    
    // Button text should change to "Copied!"
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    
    // After 2 seconds, should revert back
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });
  });
  
  it('handles clipboard errors', async () => {
    // Mock clipboard API to reject
    navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
    
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    // Click the copy button
    fireEvent.click(screen.getByText('Create & Copy'));
    
    // Should show error notification
    await waitFor(() => {
      expect(notificationService.notifyError).toHaveBeenCalledWith('Failed to copy link: Clipboard error');
    });
  });
  
  it('closes the modal when close button is clicked', () => {
    render(<URLBuilder match={mockMatch} onClose={mockOnClose} />);
    
    // Click the close button
    fireEvent.click(screen.getByText('×'));
    
    // Should call onClose
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('handles missing match URL gracefully', () => {
    const matchWithoutUrl = {
      id: 'test-id',
      title: 'Test Match',
      sport: 'soccer',
    };
    
    render(<URLBuilder match={matchWithoutUrl} onClose={mockOnClose} />);
    
    // Should call generateAffiliateLink with fallback URL
    expect(linkGenerator.generateAffiliateLink).toHaveBeenCalledWith(
      'https://www.fubo.tv/stream/soccer',
      expect.anything()
    );
  });
}); 