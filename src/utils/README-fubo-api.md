# Fubo TV API Integration

This document explains how to use the Fubo TV API integration in this project.

## Overview

The integration allows you to fetch and display match data from the Fubo TV matches JSON feed at `https://metadata-feeds.fubo.tv/Test/matches.json`.

## Files

- `src/utils/fuboTvApi.js` - Contains utility functions for fetching and processing data from the Fubo TV API
- `src/components/FuboMatches.js` - React component for displaying matches
- `src/components/FuboMatches.css` - Styling for the FuboMatches component
- `public/api/Test/matches.json` - Mock data file for development and fallback

## Integration with Full Live Sports Schedule

The Fubo TV API data is now integrated with the Full Live Sports Schedule. The integration works as follows:

1. The App component fetches data from both the original source and the Fubo TV API
2. The data from both sources is combined and passed to the ScheduleView component
3. Each match is tagged with a `source` field to identify where it came from
4. The ScheduleView component displays a source indicator for each match

This allows you to see matches from both sources in a single view, making it easier to compare and analyze the data.

## Error Handling and Fallbacks

The integration includes robust error handling and fallback mechanisms:

1. **CORS Proxy Fallback**: If the CORS proxy is not running, the system will:
   - First try to fetch from a local mock data file
   - Then attempt a direct fetch (which may work in some environments)
   - Finally, return an empty array rather than crashing the application

2. **Data Structure Handling**: The system handles various data structures:
   - Arrays of match objects
   - Objects with a `matches` property containing an array
   - Invalid or missing data (returns empty array)

3. **Mock Data**: A mock data file is included at `public/api/Test/matches.json` for development and testing

To use the CORS proxy:
```
npm run proxy
```

## API Functions

### `fetchFuboTvMatches()`

Fetches raw match data from the Fubo TV API.

```javascript
import { fetchFuboTvMatches } from '../utils/fuboTvApi';

// Usage
const rawData = await fetchFuboTvMatches();
```

### `processMatchData(matches)`

Processes raw match data into a format compatible with the ScheduleView component.

```javascript
import { processMatchData } from '../utils/fuboTvApi';

// Usage
const processedData = processMatchData(rawData);
```

### `getFuboTvMatches(options)`

Fetches and processes match data in one call. Supports filtering by sport, league, and start date.

```javascript
import { getFuboTvMatches } from '../utils/fuboTvApi';

// Usage with filters
const options = {
  sport: 'soccer',
  league: 'Premier League',
  startDate: '2023-01-01'
};

const matches = await getFuboTvMatches(options);
```

## Component Usage

The `FuboMatches` component can be used to display matches with optional filtering:

```jsx
import FuboMatches from './components/FuboMatches';

// Display all matches
<FuboMatches />

// Filter by sport
<FuboMatches sport="soccer" />

// Filter by sport and league
<FuboMatches sport="soccer" league="Premier League" />
```

## CORS Considerations

The integration uses a CORS proxy to avoid CORS issues when fetching data from the Fubo TV API. The proxy is configured in `cors-proxy.js` and is started with `npm run proxy`.

In development, the proxy runs on `http://localhost:3001/proxy`. In production, it's expected to be available at `/proxy`.

## Data Structure

The Fubo TV matches JSON feed returns an array of match objects. Each match object has the following structure:

```json
{
  "id": "29467811",
  "title": "South Africa vs New Zealand",
  "hometeam": "South Africa",
  "awayteam": "New Zealand",
  "hometeamabbr": "",
  "awayteamabbr": "",
  "hometeamID": "14897",
  "awayteamID": "14906",
  "starttime": "2025-03-05T13:00:00Z",
  "endtime": "2025-03-05T16:30:00Z",
  "sport": "Cricket",
  "league": "2025 ICC Champions Trophy",
  "league_id": "29290904",
  "network": "Willow TV",
  "networkUrl": "https://www.fubo.tv/welcome/channel/willow-tv?irmp=365718&irad=596299",
  "matchId": "EP055480590015",
  "matchUrl": "https://www.fubo.tv/welcome/matches/EP055480590015?irmp=365718&irad=596299",
  "thumbnail": "https://gn-imgx.fubo.tv/assets/assets/o101252_l_h15_aa.png",
  "country": "US",
  "url": "https://www.fubo.tv/stream/cricket/?irmp=365718&irad=2791680",
  "regionalRestrictions": false
}
```

## Customization

You can customize the appearance of the matches by modifying the `FuboMatches.css` file. The component uses a responsive grid layout that adapts to different screen sizes. 