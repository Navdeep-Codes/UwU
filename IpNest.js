// Simple Node.js script to get your public IP address
const https = require('https');

// Function to get public IP using ipify API
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Your public IP address is:', data);
        resolve(data);
      });
    }).on('error', (err) => {
      console.error('Error fetching IP:', err.message);
      reject(err);
    });
  });
}

// Also get local IP addresses
function getLocalIPs() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  console.log('\nYour local IP addresses:');
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (non-public) addresses
      if (!net.internal) {
        console.log(`- Interface: ${name}, IP: ${net.address} (${net.family})`);
      }
    }
  }
}

// Execute
getPublicIP()
  .then(() => getLocalIPs())
  .catch(err => console.error('Something went wrong:', err));