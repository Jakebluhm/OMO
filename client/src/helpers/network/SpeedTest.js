import React, { useState } from 'react';
const NetworkSpeed = require('network-speed');
const testNetworkSpeed = new NetworkSpeed();

function SpeedTestComponent() {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);

  const getNetworkDownloadSpeed = async () => {
    const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';  // Example URL
    const fileSizeInBytes = 500000;
    const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
    setDownloadSpeed(speed.mbps);  // or .bps or .kbps, depending on your preference
  };

  const getNetworkUploadSpeed = async () => {
    const options = {
      hostname: 'www.google.com',  // This is just an example, you'd need your own server endpoint
      port: 80,
      path: '/catchers/544b09b4599c1d0200000289',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const fileSizeInBytes = 2000000;  // Example size
    const speed = await testNetworkSpeed.checkUploadSpeed(options, fileSizeInBytes);
    setUploadSpeed(speed.mbps);  // or .bps or .kbps, depending on your preference
  };

  return (
    <div>
      <button onClick={getNetworkDownloadSpeed}>Test Download Speed</button>
      <button onClick={getNetworkUploadSpeed}>Test Upload Speed</button>
      <div>Download Speed: {downloadSpeed} Mbps</div>
      <div>Upload Speed: {uploadSpeed} Mbps</div>
    </div>
  );
}

export default SpeedTestComponent;
