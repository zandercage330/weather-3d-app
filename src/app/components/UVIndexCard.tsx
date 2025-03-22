'use client';

import React from 'react';
import GlassCard from './GlassCard';

interface UVIndexCardProps {
  uvIndex: number;
  className?: string;
}

/**
 * UVIndexCard component displays UV index information with a visual indicator
 * of the UV intensity level and corresponding safety recommendations
 */
const UVIndexCard: React.FC<UVIndexCardProps> = ({ uvIndex, className = '' }) => {
  // Determine UV risk level and color
  const getUVRiskLevel = (index: number): {level: string; color: string; variant: string} => {
    if (index <= 2) {
      return {
        level: 'Low',
        color: 'bg-green-500',
        variant: 'success'
      };
    } else if (index <= 5) {
      return {
        level: 'Moderate', 
        color: 'bg-yellow-500',
        variant: 'warning'
      };
    } else if (index <= 7) {
      return {
        level: 'High',
        color: 'bg-orange-500',
        variant: 'warning'
      };
    } else if (index <= 10) {
      return {
        level: 'Very High',
        color: 'bg-red-500',
        variant: 'danger'
      };
    } else {
      return {
        level: 'Extreme', 
        color: 'bg-purple-500',
        variant: 'danger'
      };
    }
  };

  // Get safety recommendations based on UV index
  const getSafetyRecommendations = (index: number): string[] => {
    const recommendations = [];
    
    if (index >= 3) {
      recommendations.push('Wear sunscreen SPF 30+');
      recommendations.push('Wear a hat');
    }
    
    if (index >= 6) {
      recommendations.push('Seek shade during midday hours');
      recommendations.push('Wear UV-blocking sunglasses');
    }
    
    if (index >= 8) {
      recommendations.push('Minimize sun exposure between 10am-4pm');
      recommendations.push('Wear protective clothing');
    }
    
    if (index >= 11) {
      recommendations.push('Take all precautions - unprotected skin can burn quickly');
    }
    
    return recommendations.length > 0 ? recommendations : ['No special precautions needed'];
  };

  const { level, color, variant } = getUVRiskLevel(uvIndex);
  const recommendations = getSafetyRecommendations(uvIndex);
  const percentValue = Math.min(100, (uvIndex / 11) * 100);
  
  return (
    <GlassCard 
      className={`p-4 ${className}`}
      variant={variant as any}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">UV Index</h3>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold`}>
            {uvIndex}
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{level} Risk</span>
        </div>
        <div className="h-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percentValue}%` }}></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Extreme</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
        <ul className="text-sm space-y-1">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
};

export default UVIndexCard; 