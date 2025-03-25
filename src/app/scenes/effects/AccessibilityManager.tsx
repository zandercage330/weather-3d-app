'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AccessibilityManagerProps {
  condition: string;
  timeOfDay: 'day' | 'night';
  onFocus?: (description: string) => void;
}

const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({
  condition,
  timeOfDay,
  onFocus
}) => {
  const { scene, camera } = useThree();
  const announcementRef = useRef<HTMLDivElement>(null);
  
  // Create accessible descriptions
  const getWeatherDescription = () => {
    const timeContext = timeOfDay === 'day' ? 'daytime' : 'nighttime';
    
    switch (condition) {
      case 'clear':
        return `Clear ${timeContext} sky with good visibility.`;
      case 'cloudy':
        return `${timeContext} with cloud cover reducing visibility.`;
      case 'rain':
        return `${timeContext} with rainfall creating a wet atmosphere.`;
      case 'snow':
        return `${timeContext} with snowfall creating a winter scene.`;
      case 'storm':
        return `${timeContext} storm with intense weather conditions.`;
      case 'fog':
        return `${timeContext} with fog limiting visibility.`;
      default:
        return `Current weather scene showing ${condition} conditions during ${timeContext}.`;
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Tab':
          // Focus next interactive element
          event.preventDefault();
          const interactiveObjects = scene.children.filter(
            obj => obj.userData.interactive
          );
          if (interactiveObjects.length > 0) {
            const currentFocus = interactiveObjects.findIndex(
              obj => obj.userData.focused
            );
            const nextIndex = (currentFocus + 1) % interactiveObjects.length;
            
            // Update focus
            interactiveObjects.forEach(obj => {
              obj.userData.focused = false;
            });
            interactiveObjects[nextIndex].userData.focused = true;
            
            // Update camera to look at focused object
            const target = interactiveObjects[nextIndex].position;
            camera.lookAt(target);
            
            // Announce focus change
            if (onFocus) {
              const objType = interactiveObjects[nextIndex].userData.type || 'object';
              onFocus(`Focused on ${objType} in the scene`);
            }
          }
          break;
          
        case 'Enter':
          // Activate focused element
          const focusedObject = scene.children.find(
            obj => obj.userData.interactive && obj.userData.focused
          );
          if (focusedObject && focusedObject.userData.onActivate) {
            focusedObject.userData.onActivate();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scene, camera, onFocus]);
  
  // Add ARIA live region for announcements
  useEffect(() => {
    if (!announcementRef.current) {
      const div = document.createElement('div');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.style.position = 'absolute';
      div.style.width = '1px';
      div.style.height = '1px';
      div.style.padding = '0';
      div.style.margin = '-1px';
      div.style.overflow = 'hidden';
      div.style.clip = 'rect(0, 0, 0, 0)';
      div.style.whiteSpace = 'nowrap';
      div.style.border = '0';
      document.body.appendChild(div);
      announcementRef.current = div;
    }
    
    // Announce initial scene description
    const description = getWeatherDescription();
    if (announcementRef.current) {
      announcementRef.current.textContent = description;
    }
    
    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [condition, timeOfDay]);
  
  return null;
};

export default AccessibilityManager; 