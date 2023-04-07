Steps to build and run

Clone this repo

Check if you have node by running "node -v" in terminal

Download node if you dont have it, I used Chocolaty to download node

run "npm install" inside local repo

run "npm start" inside local repo to run server code

cd client

run "npm start" again to run website code

Should open browser window

#Lightsail details
Public static IP address
This static IP is available for public connection worldwide.

3.136.49.106
Attach to an instance
Attaching a static IP replaces that instance's dynamic IP address.

OMOServer
OMOServer

Detach
512 MB RAM, 1 vCPU, 20 GB SSD

to build in lightsail
NODE_OPTIONS="--max-old-space-size=4096" npm run build
