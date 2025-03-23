This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WeatherAPI Integration

This application uses [WeatherAPI](https://www.weatherapi.com/) to fetch real-time weather data. To use this feature, you need to:

1. Sign up for a free WeatherAPI account at [weatherapi.com](https://www.weatherapi.com/)
2. Get your API key from the dashboard
3. Create a `.env.local` file in the root of the project with the following content:

```
WEATHER_API_KEY=your_api_key_here
WEATHER_API_BASE_URL=https://api.weatherapi.com/v1
```

Replace `your_api_key_here` with your actual API key.

### Security Features

For security, this application:

- Keeps the API key on the server side using Next.js API routes
- Implements rate limiting to prevent abuse
- Validates and sanitizes all user inputs
- Uses proper error handling for API failures
- Implements fallbacks when API calls fail

### Testing the API

The application includes an API tester component that you can use to verify your WeatherAPI integration is working correctly. Click the "Show API Tester" button on the main page to access this feature.

### Fallback Mechanism

If the WeatherAPI calls fail for any reason, the application will fall back to the MCP weather tools, and if those fail as well, it will use simulated weather data.

## Weather Maps and Radar

The application includes an interactive weather radar map that shows precipitation data in real-time. This feature uses:

- [RainViewer API](https://www.rainviewer.com/api.html) for radar imagery
- [Leaflet](https://leafletjs.com/) for interactive maps
- [React-Leaflet](https://react-leaflet.js.org/) for React integration

### Features

The weather map includes:

- Real-time precipitation radar visualization
- Animation controls for past radar frames
- Precipitation forecast (nowcast) for the next 2 hours
- Ability to switch between standard map and satellite view
- Automatic geolocation detection
- Custom weather marker for your location

### How to Use

1. Click the "Show Radar Map" button on the main page
2. Use the playback controls to animate through radar frames
3. Toggle between "Past Radar" and "Forecast" to see different time periods
4. Switch between map types using the layer control in the top right
5. Zoom and pan the map to explore different areas

The radar data updates automatically every 10 minutes to ensure you have the latest precipitation information.

## Smart Notification System

The application includes a comprehensive notification system that keeps you informed about important weather events without overwhelming you. 

### Features

- **Real-time Weather Alerts**: Get immediate notifications for severe weather events
- **Personalized Notifications**: Configure exactly which types of notifications you want to receive
- **Scheduled Notifications**: Create custom notification schedules for regular weather updates
- **Notification History**: View past notifications and track weather patterns
- **Smart Rules**: Set up custom rules for notifications based on specific weather conditions
- **Browser Notifications**: Receive alerts even when the app is not in focus

### Notification Types

- **Weather Alerts**: Government-issued severe weather warnings
- **Forecast Updates**: Daily summaries of upcoming weather
- **Precipitation Alerts**: Get notified when rain or snow is about to start or stop
- **Temperature Alerts**: Notifications for significant temperature changes
- **Air Quality Alerts**: Get informed when air quality reaches unhealthy levels
- **UV Index Warnings**: Warnings when UV levels are high enough to cause skin damage

### Customization Options

The notification system offers extensive customization:

- **Thresholds**: Adjust sensitivity for temperature changes, precipitation probabilities, etc.
- **Quiet Hours**: Set times when non-critical notifications are silenced
- **Frequency Controls**: Choose how often you receive notifications
- **Weekend Preferences**: Decide if you want to receive non-critical notifications on weekends

### How to Use

1. Click the bell icon in the top right corner to open the notification panel
2. Switch between tabs to see your active notifications, history, or scheduled notifications
3. Use the "Schedule" tab to create new notification schedules
4. Configure your preferences in detail using the "Settings" tab
5. Enable browser notifications when prompted to receive alerts outside the app

The notification system is designed to be unobtrusive while keeping you informed about the weather conditions that matter most to you.

## Geolocation and Saved Locations

The application includes powerful geolocation features and the ability to save your favorite locations for quick access.

### Geolocation Features

- **Automatic Location Detection**: Automatically detects your current location when you allow location access
- **Reverse Geocoding**: Converts coordinates to readable addresses and location names
- **Location-based Weather**: Instantly shows weather for your current location
- **Browser Permission Handling**: Gracefully handles permission requests and denials
- **Fallback Options**: Provides alternate location options if geolocation is unavailable

### Saved Locations Management

- **Favorite Locations**: Save frequently checked locations for quick access
- **Quick Toggle**: Easily switch between saved locations with a single click
- **Custom Names**: Rename saved locations (e.g., "Home", "Work", "Vacation House")
- **Location Cards**: Visual cards showing current conditions at your saved locations
- **Synced Preferences**: Location-specific preferences for weather display
- **Drag-and-Drop Sorting**: Organize your saved locations in order of importance

### Enhanced Location Search

- **Autocomplete**: Get location suggestions as you type
- **Recent Searches**: Quick access to your recent location searches
- **Fuzzy Matching**: Find locations even with partial or misspelled names
- **Smart Defaults**: Improved initial location suggestions based on your region
- **Detailed Results**: See country, region, and postal code in search results

### How to Use

1. Click the location icon or allow location permission to use your current location
2. Use the search bar to find any location worldwide
3. Click the heart/star icon to save a location to your favorites
4. Access your saved locations from the sidebar or dropdown menu
5. Click on any saved location to instantly view its weather information
6. Use the management panel to rename, reorder, or remove saved locations

The location features are designed to make checking weather for different places seamless and efficient.
