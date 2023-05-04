#!/bin/bash
echo "Fetching changes from remote..."
git fetch --all
git checkout debugMobile
git pull
npm ci
cd client
NODE_OPTIONS="--max-old-space-size=4096" npm run build
cd .. 
echo "Deploying and serving OMO..."
nohup node server.js > server.log 2>&1 &

