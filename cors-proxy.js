// Simple CORS proxy server
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

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
  
  console.log('Making request to Fubo TV API with options:', options);
  
  const request = https.request(options, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('Fubo TV API response status:', response.statusCode);
      
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
    });
  });
  
  request.on('error', (error) => {
    console.error('Error fetching from Fubo TV API:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: error.message }));
  });
  
  request.end();
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`CORS Proxy running on port ${port}`);
}); 