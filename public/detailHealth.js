document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from the server
    fetch('/health-data')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => new Date(item.DateTime).toISOString());
            const heartRates = data.map(item => item.HealthData.HeartRate);
            const oxygenLevels = data.map(item => item.HealthData.OxygenLevel);

            // Populate the table
            const tableBody = document.getElementById('healthDataTableBody');
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(item.DateTime).toISOString()}</td>
                    <td>${item.HealthData.HeartRate}</td>
                    <td>${item.HealthData.OxygenLevel}</td>
                    <td>${item.HealthData.AccelerometerData.Ax}</td>
                    <td>${item.HealthData.AccelerometerData.Ay}</td>
                    <td>${item.HealthData.AccelerometerData.Az}</td>
                `;
                tableBody.appendChild(row);
            });

            // Create the chart
            const ctx = document.getElementById('healthChart').getContext('2d');
            const healthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Heart Rate',
                        data: heartRates.map((value, index) => ({ x: labels[index], y: value })),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }, {
                        label: 'Oxygen Saturation',
                        data: oxygenLevels.map((value, index) => ({ x: labels[index], y: value })),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'minute',
                                tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                                displayFormats: {
                                    minute: 'yyyy-MM-dd HH:mm:ss'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            suggestedMin: Math.min(...heartRates, ...oxygenLevels) - 10,
                            suggestedMax: Math.max(...heartRates, ...oxygenLevels) + 10,
                        }
                    }
                }
            });

            // Listen for real-time updates using Socket.io
            const socket = io();

            socket.on('connect', () => {
                console.log('Connected to server');
            });

            socket.on('healthDataUpdate', function(updatedData) {
                console.log('Data received:', updatedData);
                if (updatedData.HealthData) {
                    const updatedTime = new Date(updatedData.DateTime).toISOString();

                    // Update chart data
                    healthChart.data.labels.push(updatedTime);
                    healthChart.data.datasets[0].data.push({ x: updatedTime, y: updatedData.HealthData.HeartRate });
                    healthChart.data.datasets[1].data.push({ x: updatedTime, y: updatedData.HealthData.OxygenLevel });
                    healthChart.update();

                    // Update table data
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${updatedTime}</td>
                        <td>${updatedData.HealthData.HeartRate}</td>
                        <td>${updatedData.HealthData.OxygenLevel}</td>
                        <td>${updatedData.HealthData.AccelerometerData.Ax}</td>
                        <td>${updatedData.HealthData.AccelerometerData.Ay}</td>
                        <td>${updatedData.HealthData.AccelerometerData.Az}</td>
                    `;
                    tableBody.appendChild(newRow);
                }
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });

            // Initialize date range picker
            $('#daterange').daterangepicker({
                timePicker: true,
                timePicker24Hour: true,
                startDate: moment().startOf('day'),
                endDate: moment().endOf('day'),
                locale: {
                    format: 'YYYY-MM-DD HH:mm:ss'
                }
            }, function(start, end, label) {
                const startDate = start.toISOString();
                const endDate = end.toISOString();
                console.log(`New date range selected: ${startDate} to ${endDate}`);

                const filteredLabels = labels.filter(label => label >= startDate && label <= endDate);
                const filteredHeartRates = heartRates.filter((value, index) => labels[index] >= startDate && labels[index] <= endDate);
                const filteredOxygenLevels = oxygenLevels.filter((value, index) => labels[index] >= startDate && labels[index] <= endDate);

                healthChart.data.labels = filteredLabels;
                healthChart.data.datasets[0].data = filteredHeartRates.map((value, index) => ({ x: filteredLabels[index], y: value }));
                healthChart.data.datasets[1].data = filteredOxygenLevels.map((value, index) => ({ x: filteredLabels[index], y: value }));
                healthChart.update();

                // Clear existing table data
                tableBody.innerHTML = '';
                filteredLabels.forEach((label, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${label}</td>
                        <td>${filteredHeartRates[index]}</td>
                        <td>${filteredOxygenLevels[index]}</td>
                        <td>${data[index].HealthData.AccelerometerData.Ax}</td>
                        <td>${data[index].HealthData.AccelerometerData.Ay}</td>
                        <td>${data[index].HealthData.AccelerometerData.Az}</td>
                    `;
                    tableBody.appendChild(row);
                });
            });
        })
        .catch(error => console.error('Error fetching health data:', error));
});
