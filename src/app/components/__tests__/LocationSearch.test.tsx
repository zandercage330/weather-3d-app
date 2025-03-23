import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationSearch from '../LocationSearch';

describe('LocationSearch', () => {
  const mockSearchResults = [
    { name: 'New York', country: 'US', state: 'NY', displayName: 'New York, NY, US' },
    { name: 'Los Angeles', country: 'US', state: 'CA', displayName: 'Los Angeles, CA, US' },
    { name: 'London', country: 'GB', displayName: 'London, GB' }
  ];
  
  const defaultProps = {
    searchTerm: '',
    searchResults: [],
    isSearching: false,
    onSearch: jest.fn(),
    onResultSelect: jest.fn(),
    onClearSearch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input correctly', () => {
    render(<LocationSearch {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search location...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearch when typing in the input', async () => {
    render(<LocationSearch {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search location...');
    await userEvent.type(searchInput, 'N');
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('N');
  });

  it('shows the clear button when searchTerm has a value', () => {
    render(<LocationSearch {...defaultProps} searchTerm="New York" />);
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('calls onClearSearch when the clear button is clicked', async () => {
    render(<LocationSearch {...defaultProps} searchTerm="New York" />);
    
    const clearButton = screen.getByRole('button');
    await userEvent.click(clearButton);
    
    expect(defaultProps.onClearSearch).toHaveBeenCalledTimes(1);
  });

  it('shows search results when focused and results are available', async () => {
    render(
      <LocationSearch 
        {...defaultProps} 
        searchResults={mockSearchResults}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search location...');
    await userEvent.click(searchInput); // Focus the input
    
    // The results should be visible now
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('calls onResultSelect when a result item is clicked', async () => {
    render(
      <LocationSearch 
        {...defaultProps} 
        searchResults={mockSearchResults}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search location...');
    await userEvent.click(searchInput); // Focus the input
    
    const resultItem = screen.getByText('New York');
    await userEvent.click(resultItem);
    
    expect(defaultProps.onResultSelect).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('shows loading indicator when isSearching is true', () => {
    render(<LocationSearch {...defaultProps} isSearching={true} />);
    
    const loadingIndicator = screen.getByTestId('loading-spinner');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('submits the form when pressing enter', async () => {
    render(<LocationSearch {...defaultProps} searchTerm="New York" />);
    
    const searchInput = screen.getByPlaceholderText('Search location...');
    await userEvent.type(searchInput, '{enter}');
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('New York');
  });
}); 