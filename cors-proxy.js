// Simple CORS proxy server
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Enable CORS for all routes during development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin');
      return callback(null, true);
    }
    
    // Log the origin for debugging
    console.log('Request origin:', origin);
    
    // Check if the origin matches *.fubo.tv or *.fubo.tv:<port>
    if (origin.match(/^https?:\/\/([a-zA-Z0-9-]+\.)*fubo\.tv(:\d+)?$/)) {
      console.log('Origin matches *.fubo.tv pattern');
      return callback(null, true);
    } else {
      // For development, allow all origins but log the mismatch
      console.log('Origin does not match *.fubo.tv pattern, allowing anyway for development');
      return callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the public directory for /api/Test paths
app.use('/api/Test', express.static(path.join(__dirname, 'public/api/Test')));

// Metadata feeds proxy middleware options
const metadataFeedsOptions = {
  target: 'https://metadata-feeds.fubo.tv',
  changeOrigin: true,
  pathRewrite: {
    '^/metadata-feeds': '', // Remove /metadata-feeds prefix
  },
  onProxyReq: function(proxyReq, req, res) {
    // Add Test prefix if accessing matches.json directly
    if (proxyReq.path === '/matches.json') {
      proxyReq.path = '/Test/matches.json';
    }
    
    console.log(`Proxying to metadata feeds: ${proxyReq.method} ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    console.log('Metadata feeds request headers:', req.headers);
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    console.log(`Metadata feeds response status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: function(err, req, res) {
    console.error('Metadata feeds proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(`Metadata Feeds Proxy Error: ${err.message}`);
  }
};

// Impact API proxy middleware options
const impactApiOptions = {
  target: 'https://api.impact.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/impact': '', // Remove /api/impact prefix
  },
  onProxyReq: function(proxyReq, req, res) {
    console.log(`Proxying to Impact API: ${proxyReq.method} ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    
    if (proxyReq.path.includes('undefined')) {
      console.error('ERROR: URL contains undefined values. Check your environment variables.');
    }
    
    console.log('Impact API request headers:', req.headers);
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    console.log(`Impact API response status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    console.log('Impact API response headers:', proxyRes.headers);
  },
  onError: function(err, req, res) {
    console.error('Impact API proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(`Impact API Proxy Error: ${err.message}`);
  },
  logLevel: 'debug'
};

// Create the proxy middlewares - each with their own specific path filter
const metadataFeedsProxy = createProxyMiddleware('/metadata-feeds', metadataFeedsOptions);
const impactApiProxy = createProxyMiddleware('/api/impact', impactApiOptions);

// Apply the proxies to their specific routes only
app.use('/metadata-feeds', metadataFeedsProxy);
app.use('/api/impact', impactApiProxy);

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'CORS proxy server is running correctly' });
});

// Add a test endpoint for metadata feeds
app.get('/test-metadata', (req, res) => {
  const https = require('https');
  const options = {
    hostname: 'metadata-feeds.fubo.tv',
    path: '/Test/matches.json',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  console.log('Making test request to Metadata Feeds with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('Metadata Feeds test response status:', response.statusCode);
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error testing Metadata Feeds:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

// Add a direct endpoint for matches.json
app.get('/matches.json', (req, res) => {
  const https = require('https');
  const options = {
    hostname: 'metadata-feeds.fubo.tv',
    path: '/Test/matches.json',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  console.log('Making direct request to matches.json with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('matches.json response status:', response.statusCode);
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error fetching matches.json:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

// Add a specific endpoint for /api/Test/matches.json
app.get('/api/Test/matches.json', (req, res) => {
  const https = require('https');
  const options = {
    hostname: 'metadata-feeds.fubo.tv',
    path: '/Test/matches.json',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  console.log('Making request to /api/Test/matches.json with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    console.log(`Response status from metadata-feeds.fubo.tv: ${response.statusCode}`);
    console.log('Response headers:', response.headers);
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('/api/Test/matches.json response status:', response.statusCode);
      
      // Log a sample of the response data for debugging
      console.log('Response data sample (first 200 chars):', data.substring(0, 200));
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error fetching /api/Test/matches.json:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

// Add a specific endpoint for /metadata-feeds/Test/matches.json
app.get('/metadata-feeds/Test/matches.json', (req, res) => {
  const https = require('https');
  const options = {
    hostname: 'metadata-feeds.fubo.tv',
    path: '/Test/matches.json',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  console.log('Making request to /metadata-feeds/Test/matches.json with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    console.log(`Response status from metadata-feeds.fubo.tv: ${response.statusCode}`);
    console.log('Response headers:', response.headers);
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('/metadata-feeds/Test/matches.json response status:', response.statusCode);
      
      // Log a sample of the response data for debugging
      console.log('Response data sample (first 200 chars):', data.substring(0, 200));
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error fetching /metadata-feeds/Test/matches.json:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

// Add a direct test endpoint for Impact Radius API
app.get('/test-impact', (req, res) => {
  const accountSid = process.env.REACT_APP_IMPACT_RADIUS_ACCOUNT_SID || 'IRuPEN2Q6um2355896YQMXzk3eWNzUXRV1';
  const authToken = process.env.REACT_APP_IMPACT_RADIUS_AUTH_TOKEN || '9ttadtffjpq#MkVgU2FgPMtzRfj_KRuz';
  
  // Create Basic Auth header
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  
  // Make a request to Impact Radius API
  const https = require('https');
  const options = {
    hostname: 'api.impact.com',
    path: `/Advertisers/${accountSid}/Ads`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`
    }
  };
  
  console.log('Making test request to Impact Radius API with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('Impact Radius API test response status:', response.statusCode);
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error testing Impact Radius API:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CORS Proxy server running on port ${PORT}`);
  console.log(`Test the proxy at: http://localhost:${PORT}/test`);
  console.log(`Test Metadata Feeds at: http://localhost:${PORT}/test-metadata`);
  console.log(`Test Impact Radius API at: http://localhost:${PORT}/test-impact`);
}); 