#!/bin/bash

echo "🚀 Starting Sentinel AI Frontend Development Server"
echo "================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔥 Starting Vite development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "API proxy will forward requests to: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev