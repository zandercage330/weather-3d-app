'use client';

import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import RefreshButton from './RefreshButton';

interface LocationSelectorWrapperProps {
  initialLocation: string;
}

const LocationSelectorWrapper: React.FC<LocationSelectorWrapperProps> = ({ 
  initialLocation 
}) => {
  const [location, setLocation] = useState(initialLocation);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    // In a real app, we would fetch new weather data for this location
    console.log(`Location changed to: ${newLocation}`);
  };

  const handleRefresh = async () => {
    // This would fetch new weather data in a real app
    console.log('Refreshing weather data...');
    return new Promise<void>(resolve => setTimeout(resolve, 800));
  };

  return (
    <div className="flex items-center gap-2">
      <LocationSelector 
        currentLocation={location} 
        onLocationChange={handleLocationChange} 
      />
      <RefreshButton onRefresh={handleRefresh} />
    </div>
  );
};

export default LocationSelectorWrapper; 