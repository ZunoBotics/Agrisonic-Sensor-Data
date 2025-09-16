const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Store data in memory (for production, use a database)
let sensorData = [];
let devices = [];

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, 
Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, 
OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Device registration endpoint (compatible with your existing code)
app.post('/api/sensors', (req, res) => {
    const device = {
        ...req.body,
        lastSeen: new Date().toISOString(),
        registered: new Date().toISOString()
    };

    // Update existing device or add new one
    const index = devices.findIndex(d => d.deviceId === device.deviceId);
    if (index >= 0) {
        devices[index] = device;
    } else {
        devices.push(device);
    }

    console.log('Device registered:', device.deviceId);
    res.status(201).json({ status: 'success', message: 'Device registered'
});
});

// Sensor data ingestion endpoint (compatible with your existing code)
app.post('/api/sensors/ingest', (req, res) => {
    const data = {
        ...req.body,
        serverTimestamp: new Date().toISOString(),
        id: Date.now() + Math.random() // Simple ID generation
    };

    sensorData.push(data);

    // Keep only last 1000 readings
    if (sensorData.length > 1000) {
        sensorData = sensorData.slice(-1000);
    }

    console.log('Data received from:', data.deviceId);
    res.json({ status: 'success', message: 'Data received' });
});

// Get all sensor data
app.get('/api/sensors/data', (req, res) => {
    const deviceId = req.query.deviceId;
    let data = sensorData;

    if (deviceId) {
        data = sensorData.filter(d => d.deviceId === deviceId);
    }

    res.json({
        count: data.length,
        data: data.slice(-100) // Return last 100 readings
    });
});

// Get registered devices
app.get('/api/devices', (req, res) => {
    res.json({
        count: devices.length,
        devices: devices
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ESP32 Soil Sensor Data Server',
        endpoints: {
            'POST /api/sensors': 'Register device',
            'POST /api/sensors/ingest': 'Submit sensor data',
            'GET /api/sensors/data': 'Get sensor data (optional 
?deviceId=xxx)',
            'GET /api/devices': 'Get registered devices'
        },
        stats: {
            totalDevices: devices.length,
            totalReadings: sensorData.length
        }
    });
});

app.listen(port, () => {
    console.log(`Soil sensor server running on port ${port}`);
});

