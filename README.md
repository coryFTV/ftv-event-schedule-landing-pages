# Fubo Events, Schedules and Landing Pages

## Partner Resource Application

This application serves as a comprehensive resource for partners and editors to access information about all events and schedules on Fubo, including landing pages and live widgets.

### Purpose

This self-service tool allows editors to:
- View all live sports events on Fubo
- Browse movies and TV series available on Fubo
- Filter events by sport type, regional availability, and more
- Generate customized affiliate URLs for content
- Access landing pages with proper tracking parameters
- View network and league-specific information

### Features

- **Full Live Sports Schedule**: Complete schedule of all live events on Fubo, updated daily
- **Movies and TV Series Catalog**: Access to Fubo's complete library of movies and TV series
- **Sport-Specific Filtering**: Quick access to events by sport (MLB, Soccer, NFL, NBA, NHL, etc.)
- **Regional Content Filtering**: Filter for local/regional events
- **URL Customization**: Generate affiliate links with proper tracking parameters
- **Partner Configuration**: Set default parameters for your organization

### Getting Started

1. Navigate to the main dashboard
2. Use the navigation to access specific sports, movies, TV series, or views
3. Click "Watch" on any content to generate a customized affiliate URL
4. Use the Partner Configuration page to set default parameters

### Technical Details

This application is built with React and uses JSON APIs to fetch the latest event, movie, and TV series data. All URLs are automatically generated with proper tracking parameters based on your partner configuration.

### Data Sources

The application fetches data from the following endpoints:
- Sports events: Internal Fubo API
- Movies: https://metadata-feeds.fubo.tv/Test/movies.json
- TV Series: https://metadata-feeds.fubo.tv/Test/series.json

### Impact Radius API Integration

The application integrates with the Impact Radius API to fetch and display all available landing pages. This integration provides:

- Real-time access to all landing pages in the Impact Radius platform
- Filtering by ad type, mobile readiness, and update date
- Direct links to landing pages for easy access
- Comprehensive details about each landing page

To configure the Impact Radius API integration:

1. Set your Account SID in the `.env` file as `REACT_APP_IMPACT_RADIUS_ACCOUNT_SID`
2. Set your Auth Token in the `.env` file as `REACT_APP_IMPACT_RADIUS_AUTH_TOKEN`
3. Start the CORS proxy server in a separate terminal with:
   ```
   npm run proxy
   ```
4. Start the React application with:
   ```
   npm start
   ```
5. Access the landing pages through the "Fubo Landing Pages" link in the navigation

If the proxy server is not running, the application will attempt to use a public CORS proxy. If that fails, it will fall back to using mock data.

#### Troubleshooting API Connection

If you're having trouble connecting to the Impact Radius API, try these steps:

1. Ensure the CORS proxy server is running with `npm run proxy` in a separate terminal
2. Check that your Account SID and Auth Token are correct in the `.env` file
3. Test the API connection directly by visiting `http://localhost:3001/test-impact` in your browser
4. Check the browser console for error messages
5. If using the proxy server, check the proxy server logs for error messages
6. Make sure your Impact Radius account has access to the Ads API
7. Try accessing the API with a tool like Postman to verify your credentials

Common issues:
- CORS restrictions: The proxy server helps bypass these
- Authentication errors: Check your Account SID and Auth Token
- Network connectivity: Ensure you have internet access
- API rate limiting: The Impact Radius API may have rate limits

### Last Updated

This application is regularly updated with the latest event information. 