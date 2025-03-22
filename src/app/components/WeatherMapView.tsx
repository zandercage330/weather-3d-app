'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchRadarData, getRadarTileUrl, formatRadarTimestamp, RadarApiResponse } from '../lib/rainViewerClient';
import { useUserPreferences } from '../hooks/useUserPreferences';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import of the map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// We'll import these components separately to avoid TypeScript errors
const BaseLayer = dynamic(() => 
  import('react-leaflet').then(mod => {
    // @ts-ignore - BaseLayer is available at runtime
    return mod.LayersControl.BaseLayer;
  }), 
  { ssr: false }
);

const Overlay = dynamic(() => 
  import('react-leaflet').then(mod => {
    // @ts-ignore - Overlay is available at runtime
    return mod.LayersControl.Overlay;
  }), 
  { ssr: false }
);

// Import Leaflet icon for marker
import L from 'leaflet';

// Create a custom icon for the location marker
const createCustomIcon = () => {
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'text-blue-500 fill-blue-500'
  });
};

const INITIAL_POSITION: [number, number] = [40.7128, -74.0060]; // New York by default
const DEFAULT_ZOOM = 6;

interface WeatherMapViewProps {
  className?: string;
}

export default function WeatherMapView({ className = '' }: WeatherMapViewProps) {
  const { preferences } = useUserPreferences();
  const [position, setPosition] = useState<[number, number]>(INITIAL_POSITION);
  const [radarData, setRadarData] = useState<RadarApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showPast, setShowPast] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [locationIcon, setLocationIcon] = useState<L.Icon | null>(null);

  // Fix Leaflet's default icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    
    // Initialize the custom icon
    setLocationIcon(createCustomIcon());
  }, []);

  // Get coordinates from the preferences or use geolocation
  useEffect(() => {
    // If we had actual coordinates for the default location, we'd use them here
    // For now, we'll just use New York as default
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPosition([position.coords.latitude, position.coords.longitude]);
          },
          (err) => {
            console.error('Error getting location:', err);
            // Use default location from preferences
            setPosition(INITIAL_POSITION);
          }
        );
      }
    };

    getLocation();
  }, [preferences.defaultLocation]);

  // Fetch radar data
  useEffect(() => {
    const loadRadarData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRadarData();
        setRadarData(data);
        // Set initial frame to the most recent past frame
        if (data.radar.past.length > 0) {
          setCurrentFrameIndex(data.radar.past.length - 1);
        }
      } catch (err) {
        setError('Failed to load radar data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRadarData();

    // Refresh radar data every 10 minutes
    const intervalId = setInterval(loadRadarData, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Animation control
  useEffect(() => {
    const animate = () => {
      if (!radarData) return;

      const frames = [
        ...(showPast ? radarData.radar.past : []),
        ...(showForecast ? radarData.radar.nowcast : [])
      ];

      if (frames.length === 0) return;

      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % frames.length;
        return nextIndex;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, radarData, showPast, showForecast]);

  // Current frame to display
  const getCurrentFrame = () => {
    if (!radarData) return null;

    const frames = [
      ...(showPast ? radarData.radar.past : []),
      ...(showForecast ? radarData.radar.nowcast : [])
    ];

    if (frames.length === 0) return null;

    return frames[currentFrameIndex % frames.length];
  };

  const currentFrame = getCurrentFrame();

  // Format the current time for display
  const getCurrentTime = () => {
    if (!currentFrame) return '';
    return formatRadarTimestamp(currentFrame.time);
  };

  // Reset if no frame is available
  useEffect(() => {
    if (!getCurrentFrame() && (radarData?.radar.past.length || 0) > 0) {
      setCurrentFrameIndex(0);
    }
  }, [showPast, showForecast, radarData]);

  // Styles for UI elements
  const buttonStyle = "px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors";
  const controlStyle = "flex gap-2 items-center my-2";

  // Skip to a specific point in time
  const skipTo = (position: 'start' | 'end') => {
    if (!radarData) return;
    
    const frames = [
      ...(showPast ? radarData.radar.past : []),
      ...(showForecast ? radarData.radar.nowcast : [])
    ];
    
    if (frames.length === 0) return;
    
    if (position === 'start') {
      setCurrentFrameIndex(0);
    } else {
      setCurrentFrameIndex(frames.length - 1);
    }
  };

  // Handle map type change
  const handleMapTypeChange = (type: 'standard' | 'satellite') => {
    setMapType(type);
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Weather Radar</h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading radar data...' : 
             error ? error : 
             `Showing precipitation radar at ${getCurrentTime()}`}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className={controlStyle}>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showPast}
                onChange={() => setShowPast(!showPast)}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Past Radar</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showForecast}
                onChange={() => setShowForecast(!showForecast)}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Forecast</span>
            </label>
          </div>
          
          <div className={controlStyle}>
            <button className={buttonStyle} onClick={() => skipTo('start')}>⏮️</button>
            <button 
              className={buttonStyle} 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className={buttonStyle} onClick={() => skipTo('end')}>⏭️</button>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[500px] rounded-lg overflow-hidden">
        {error ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <MapContainer 
            center={position} 
            zoom={DEFAULT_ZOOM} 
            className="w-full h-full" 
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            
            <LayersControl position="topright">
              {/* Map base layers */}
              {/* @ts-ignore */}
              <BaseLayer checked={mapType === 'standard'} name="Standard Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{
                    add: () => handleMapTypeChange('standard')
                  }}
                />
              </BaseLayer>
              
              {/* @ts-ignore */}
              <BaseLayer checked={mapType === 'satellite'} name="Satellite">
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  eventHandlers={{
                    add: () => handleMapTypeChange('satellite')
                  }}
                />
              </BaseLayer>
              
              {/* Radar data overlay */}
              {currentFrame && radarData && (
                /* @ts-ignore */
                <Overlay checked name="Precipitation Radar">
                  <TileLayer
                    attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
                    url={getRadarTileUrl(
                      radarData.host,
                      currentFrame.path,
                      '{z}',
                      '{x}',
                      '{y}',
                      4, // Color scheme: 4 is 'universal'
                      true, // Smoothing
                      preferences.temperatureUnit === 'C' // Show snow for Celsius preference
                    )}
                    opacity={0.8}
                  />
                </Overlay>
              )}
            </LayersControl>
            
            <Marker position={position} icon={locationIcon || undefined}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">Your Location</div>
                  <div className="text-xs text-gray-500">
                    {position[0].toFixed(4)}°, {position[1].toFixed(4)}°
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm">
        <p className="text-gray-500">
          Data provided by <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">RainViewer</a>. 
          Radar imagery updates every 10 minutes.
        </p>
      </div>
    </div>
  );
} 