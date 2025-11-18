// scripts/downloadGeoData.js
const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

https.get(url, (response) => {
  let data = '';
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    fs.writeFileSync('src/assets/world-countries.json', data);
    console.log('World countries GeoJSON downloaded successfully!');
  });
}).on('error', (err) => {
  console.error('Error downloading GeoJSON:', err);
});
