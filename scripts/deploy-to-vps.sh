#!/bin/bash

# Stop execution if any command fails
set -e

echo "Starting deployment process..."

# Pull latest changes from GitHub
echo "Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Restart the application using PM2
echo "Restarting the application..."
pm2 restart ecosystem.config.js

echo "Deployment completed successfully!"