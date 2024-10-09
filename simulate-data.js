const mongoose = require('mongoose');
const axios = require('axios');  // Import axios for HTTP requests
const HealthData = require('./health-data'); 
require('./db'); 

function simulateDataInsertion() {
    // Determine if this data point should have an anomalous heart rate
    const isAnomalous = Math.random() < 0.1;  // 10% chance of having an anomalous heart rate

    let heartRate;

    if (isAnomalous) {
        // Generate anomalous heart rate
        heartRate = Math.random() < 0.5 ? Math.floor(Math.random() * 15) + 30 : Math.floor(Math.random() * 15) + 115;
    } else {
        // Generate normal heart rate
        heartRate = Math.floor(Math.random() * 40) + 60;  // Normal heart rate between 60 and 100
    }

    // Oxygen level remains within a normal range
    const oxygenLevel = Math.floor(Math.random() * 10) + 90;  // Normal oxygen level between 90 and 100

    const newData = {
        DateTime: new Date(),  // Current date and time
        DeviceID: "device12345",  // Example Device ID
        HealthData: {
            HeartRate: heartRate,
            OxygenLevel: oxygenLevel,
            AccelerometerData: {
                Ax: (Math.random() * (0.2) - 0.1).toFixed(3),  // Random Ax between -0.1 and 0.1
                Ay: (Math.random() * (0.2) - 0.1).toFixed(3),  // Random Ay between -0.1 and 0.1
                Az: (Math.random() * (0.2) - 0.1).toFixed(3)   // Random Az between -0.1 and 0.1
            }
        }
    };

    // Save to MongoDB
    new HealthData(newData).save()
        .then(doc => {
            console.log('Simulated data inserted:', doc);

            // Send data to Flask API in the expected format
            axios.post('http://localhost:5000/anomaly_detect', {
                HeartRate: doc.HealthData.HeartRate,
                RR_Interval: 60 / doc.HealthData.HeartRate  // Example: Using the heart rate to calculate RR interval
            })
            .then(response => {
                console.log('Flask API response:', response.data);
            })
            .catch(err => {
                console.error('Error sending data to Flask API:', err);
            });
        })
        .catch(err => console.error('Error inserting simulated data:', err));
}

setInterval(simulateDataInsertion, 5000);  // Run every 5 seconds
