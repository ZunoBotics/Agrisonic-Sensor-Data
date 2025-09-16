import { createServer } from 'http';
import { parse } from 'url';

let sensorData = [];
let devices = [];

function parseBody(req) {
  return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
          try {
              resolve(JSON.parse(body));
          } catch {
              resolve({});
          }
      });
  });
}

createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
  }

  // Device registration
  if (pathname === '/api/sensors' && req.method === 'POST') {
      const data = await parseBody(req);
      devices.push({...data, timestamp: new Date().toISOString()});
      console.log('Device registered:', data.deviceId);
      res.writeHead(201, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({status: 'success'}));
      return;
  }

  // Data ingestion
  if (pathname === '/api/sensors/ingest' && req.method === 'POST') {
      const data = await parseBody(req);
      sensorData.push({...data, serverTime: new Date().toISOString()});
      if (sensorData.length > 500) sensorData = sensorData.slice(-500);
      console.log('Data from:', data.deviceId);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({status: 'success'}));
      return;
  }

  // Get data
  if (pathname === '/api/sensors/data' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
          count: sensorData.length,
          data: sensorData.slice(-50)
      }));
      return;
  }

  // Get devices
  if (pathname === '/api/devices' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
          count: devices.length,
          devices: devices
      }));
      return;
  }

  // Root
  if (pathname === '/' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
          message: 'ESP32 Server',
          devices: devices.length,
          readings: sensorData.length
      }));
      return;
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');

}).listen(process.env.PORT, () => {
  console.log(`ESP32 server running on port ${process.env.PORT}`);
});
