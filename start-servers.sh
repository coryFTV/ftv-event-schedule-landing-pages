#!/bin/bash

# Kill any existing servers
echo "Killing any existing servers..."
pkill -f "node cors-proxy.js" || true
pkill -f "react-scripts start" || true

# Start the CORS proxy
echo "Starting CORS proxy server..."
node cors-proxy.js &
PROXY_PID=$!

# Start the React app
echo "Starting React app server..."
npx react-scripts start &
REACT_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $PROXY_PID $REACT_PID 2>/dev/null
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Servers started. Press Ctrl+C to stop both servers."
wait 