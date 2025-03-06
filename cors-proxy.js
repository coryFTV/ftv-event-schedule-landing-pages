// Simple CORS proxy server
const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Simple in-memory cache with expiration
const cache = {
  data: {},
  set: function(key, value, ttlSeconds = 300) { // Default 5 minute cache
    this.data[key] = {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    };
  },
  get: function(key) {
    const item = this.data[key];
    if (!item) return null;
    
    // Return null if expired
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    
    return item.value;
  },
  clear: function() {
    this.data = {};
  }
};

// Unified request handler for all Fubo TV API endpoints
const handleFuboTvRequest = (endpoint, res) => {
  // Check cache first
  const cachedData = cache.get(endpoint);
  if (cachedData) {
    console.log(`Serving cached data for ${endpoint}`);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'HIT'
    });
    return res.end(cachedData);
  }
  
  const options = {
    hostname: 'metadata-feeds.fubo.tv',
    path: `/Test/${endpoint}`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Sports-Schedule-App/1.0'
    },
    timeout: 10000 // 10 second timeout
  };
  
  console.log(`Making request to Fubo TV API: ${endpoint} with options:`, options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    // Handle streaming data
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    // Handle request completion
    response.on('end', () => {
      console.log(`Fubo TV API response for ${endpoint} - Status: ${response.statusCode}`);
      
      // Only cache successful responses
      if (response.statusCode === 200) {
        try {
          // Validate JSON before caching
          JSON.parse(data);
          cache.set(endpoint, data);
        } catch (e) {
          console.error(`Invalid JSON received for ${endpoint}:`, e.message);
        }
      }
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS'
      });
      
      res.end(data);
    });
  });
  
  // Handle request errors
  request.on('error', (error) => {
    console.error(`Error fetching from Fubo TV API (${endpoint}):`, error);
    
    // Return a more detailed error response
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.end(JSON.stringify({ 
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      endpoint: endpoint
    }));
  });
  
  // Handle timeout
  request.on('timeout', () => {
    request.destroy();
    console.error(`Request timeout for ${endpoint}`);
    
    res.writeHead(504, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.end(JSON.stringify({ 
      error: 'Request timed out',
      code: 'TIMEOUT',
      endpoint: endpoint
    }));
  });
  
  request.end();
};

// Add endpoint for matches.json
app.get('/matches.json', (req, res) => {
  handleFuboTvRequest('matches.json', res);
});

// Add endpoint for movies.json
app.get('/movies.json', (req, res) => {
  handleFuboTvRequest('movies.json', res);
});

// Add endpoint for series.json
app.get('/series.json', (req, res) => {
  handleFuboTvRequest('series.json', res);
});

// Add endpoint to clear cache
app.get('/clear-cache', (req, res) => {
  cache.clear();
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({ message: 'Cache cleared successfully' }));
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`CORS Proxy running on port ${port}`);
}); 