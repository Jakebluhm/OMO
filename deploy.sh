#!/bin/bash
git fetch --all
git checkout barebonesGame
git pull
npm ci
cd client
NODE_OPTIONS="--max-old-space-size=4096" npm run build
cd ..
node server.js

