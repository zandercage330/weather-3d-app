'use client';

import React, { useState } from 'react';

export interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  savedLocations?: string[];
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  currentLocation, 
  onLocationChange,
  savedLocations = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock locations for demonstration
  const popularLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Miami, FL',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA',
    'San Francisco, CA',
    'Atlanta, GA'
  ];

  // Use saved locations if provided, otherwise use popularLocations
  const availableLocations = savedLocations.length > 0 ? savedLocations : popularLocations;

  // Filter locations based on search term
  const filteredLocations = availableLocations.filter(
    location => location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationClick = (location: string) => {
    onLocationChange(location);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center glass-card bg-white/20 dark:bg-black/20 py-2 px-4 rounded-lg text-gray-900 dark:text-white"
      >
        <span className="mr-2">📍</span>
        <span className="truncate max-w-[150px]">{currentLocation}</span>
        <span className="ml-2">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg overflow-hidden z-50">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-white/30 dark:bg-black/30 border border-white/20 dark:border-gray-700/50 rounded text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-white/10 dark:divide-gray-700/30">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-white/20 dark:hover:bg-black/20 text-gray-900 dark:text-white transition-colors"
                  onClick={() => handleLocationClick(location)}
                >
                  {location}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 