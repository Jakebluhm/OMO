#!/bin/bash


# Navigate to the root directory of the repository

cd ~/htdocs/OMO


echo "Fetching changes from remote..."

git fetch --all

git checkout flutterRefactor

git pull
npm ci
echo "Killing the existing Node.js server process..."

pkill -f "node server.js"

echo "Deploying and serving OMO..."

nohup node server.js > server.log 2>&1 &

echo "Deployment complete."

