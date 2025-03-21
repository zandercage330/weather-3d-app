'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type TemperatureUnit = 'C' | 'F';

export interface TemperatureUnitContextType {
  unit: TemperatureUnit;
  toggleUnit: () => void;
}

const TemperatureUnitContext = createContext<TemperatureUnitContextType | null>(null);

interface TemperatureUnitProviderProps {
  children: ReactNode;
}

export function TemperatureUnitProvider({ children }: TemperatureUnitProviderProps) {
  const [unit, setUnit] = useState<TemperatureUnit>('F');

  const toggleUnit = () => {
    setUnit(prevUnit => (prevUnit === 'F' ? 'C' : 'F'));
  };

  return (
    <TemperatureUnitContext.Provider
      value={{
        unit,
        toggleUnit
      }}
    >
      {children}
    </TemperatureUnitContext.Provider>
  );
}

export function useTemperatureUnit(): TemperatureUnitContextType {
  const context = useContext(TemperatureUnitContext);
  
  if (!context) {
    throw new Error('useTemperatureUnit must be used within a TemperatureUnitProvider');
  }
  
  return context;
} 