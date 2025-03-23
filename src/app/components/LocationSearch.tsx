'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

interface LocationResult {
  name: string;
  country: string;
  state?: string;
  displayName: string;
}

interface LocationSearchProps {
  searchTerm: string;
  searchResults: LocationResult[];
  isSearching: boolean;
  onSearch: (term: string) => void;
  onResultSelect: (result: LocationResult) => void;
  onClearSearch: () => void;
}

export default function LocationSearch({
  searchTerm,
  searchResults,
  isSearching,
  onSearch,
  onResultSelect,
  onClearSearch
}: LocationSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search location..."
            className="w-full py-3 px-4 pr-10 bg-black/30 backdrop-blur-md rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Search results dropdown */}
      {isFocused && searchResults.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((result, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onResultSelect(result)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-blue-500/20 transition-colors"
                >
                  <span className="font-medium">{result.name}</span>
                  <span className="text-white/70 ml-1">
                    {result.state ? `${result.state}, ` : ''}{result.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 