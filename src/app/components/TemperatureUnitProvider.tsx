'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type TemperatureUnit = 'F' | 'C';

interface TemperatureUnitContextType {
  tempUnit: TemperatureUnit;
  setTempUnit: (unit: TemperatureUnit) => void;
  toggleTempUnit: () => void;
}

// Create context
export const TemperatureUnitContext = createContext<TemperatureUnitContextType | undefined>(undefined);

// Custom hook to use the context
export const useTemperatureUnit = () => {
  const context = useContext(TemperatureUnitContext);
  if (!context) {
    throw new Error('useTemperatureUnit must be used within a TemperatureUnitProvider');
  }
  return context;
};

interface TemperatureUnitProviderProps {
  children: ReactNode;
}

const TemperatureUnitProvider: React.FC<TemperatureUnitProviderProps> = ({ children }) => {
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('F');

  const toggleTempUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  return (
    <TemperatureUnitContext.Provider value={{ tempUnit, setTempUnit, toggleTempUnit }}>
      {children}
    </TemperatureUnitContext.Provider>
  );
};

export default TemperatureUnitProvider; 