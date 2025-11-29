#!/bin/bash

echo "🚀 Starting ResearchOS..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed!"
    echo "Please run: ./setup.sh"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ Environment file missing!"
    echo "Please run: ./setup.sh"
    exit 1
fi

echo "Starting development server..."
echo "Press Ctrl+C to stop"
echo ""
echo "🌐 Opening at: http://localhost:3000"
echo ""

npm run dev
