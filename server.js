const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let sensorData = [];
let devices = [];

// Simple CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ESP32 endpoints
app.post('/api/sensors', (req, res) => {
    devices.push({...req.body, timestamp: new Date().toISOString()});
    console.log('Device registered:', req.body.deviceId);
    res.json({status: 'success'});
});

app.post('/api/sensors/ingest', (req, res) => {
    sensorData.push({...req.body, serverTime: new Date().toISOString()});
    if (sensorData.length > 500) sensorData = sensorData.slice(-500);
    console.log('Data from:', req.body.deviceId);
    res.json({status: 'success'});
});

app.get('/api/sensors/data', (req, res) => {
    res.json({count: sensorData.length, data: sensorData.slice(-50)});
});

app.get('/api/devices', (req, res) => {
    res.json({count: devices.length, devices: devices});
});

app.get('/', (req, res) => {
    res.json({message: 'ESP32 Server', devices: devices.length, readings:
sensorData.length});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
