const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const HealthData = require('./health-data'); // Assuming this is your Mongoose model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('./db');  // Ensure your MongoDB connection is established

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route to serve detailhealth.html directly
app.get('/detailhealth.html', (req, res) => {
    res.sendFile(__dirname + '/public/detailhealth.html');
});

// Route to fetch health data from MongoDB
app.get('/health-data', async (req, res) => {
    try {
        const healthData = await HealthData.find({});
        res.json(healthData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});

io.on('connection', async (socket) => {
    console.log('New client connected');

    // Fetch the latest data from MongoDB
    try {
        const latestData = await HealthData.findOne().sort({ DateTime: -1 });
        if (latestData) {
            socket.emit('healthDataUpdate', latestData);
        }
    } catch (err) {
        console.error('Error fetching latest data:', err);
    }

    const changeStream = HealthData.watch();

    changeStream.on('change', (change) => {
        if (change.operationType === 'insert' || change.operationType === 'update') {
            console.log('New or updated data:', change.fullDocument);
            socket.emit('healthDataUpdate', change.fullDocument);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        changeStream.close();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
