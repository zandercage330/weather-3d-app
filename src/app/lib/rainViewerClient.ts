/**
 * RainViewer API Client
 * Based on documentation at https://www.rainviewer.com/api.html
 */

interface RadarFrame {
  path: string;
  time: number;
  timestamp: number;
}

export interface RadarApiResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
  satellite: {
    infrared: RadarFrame[];
  };
}

/**
 * Fetches radar data from RainViewer API
 * Returns both past radar imagery and forecast (nowcast)
 */
export async function fetchRadarData(): Promise<RadarApiResponse> {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch radar data: ${response.status} ${response.statusText}`);
    }
    
    const data: RadarApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching radar data:', error);
    throw error;
  }
}

/**
 * Constructs a full URL for a radar tile
 */
export function getRadarTileUrl(
  host: string,
  path: string,
  z: number | string,
  x: number | string,
  y: number | string,
  colorScheme: number = 4,
  smoothing: boolean = true,
  snow: boolean = false
): string {
  return `https://${host}${path}/${z}/${x}/${y}/${colorScheme}/${smoothing ? '1' : '0'}/${snow ? '1' : '0'}.png`;
}

/**
 * Returns a formatted date string from a timestamp
 */
export function formatRadarTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
} 