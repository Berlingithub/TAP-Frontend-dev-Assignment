class ChartRenderer {
    constructor() {
        this.aqiChart = null;
        this.pollutantChart = null;
        this.aqiCanvas = document.getElementById('aqiChart');
        this.pollutantCanvas = document.getElementById('pollutantChart');
        this.aqiCtx = this.aqiCanvas.getContext('2d');
        this.pollutantCtx = this.pollutantCanvas.getContext('2d');
        
        this.init();
    }

    init() {
        // Set up canvas properties
        this.setupCanvas();
        
        // Set up responsive behavior
        this.setupResponsive();
    }

    setupCanvas() {
        // Set canvas resolution for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        
        // AQI Chart
        const aqiRect = this.aqiCanvas.getBoundingClientRect();
        this.aqiCanvas.width = aqiRect.width * dpr;
        this.aqiCanvas.height = aqiRect.height * dpr;
        this.aqiCtx.scale(dpr, dpr);
        
        // Pollutant Chart
        const pollutantRect = this.pollutantCanvas.getBoundingClientRect();
        this.pollutantCanvas.width = pollutantRect.width * dpr;
        this.pollutantCanvas.height = pollutantRect.height * dpr;
        this.pollutantCtx.scale(dpr, dpr);
    }

    setupResponsive() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.redrawCharts();
        });
    }

    renderAQIChart(historicalData) {
        if (!historicalData || historicalData.length === 0) return;

        const ctx = this.aqiCtx;
        const canvas = this.aqiCanvas;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart dimensions
        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Data processing
        const maxAQI = Math.max(...historicalData.map(d => d.aqi), 300);
        const minAQI = 0;
        const aqiRange = maxAQI - minAQI;

        // Draw background zones
        this.drawAQIZones(ctx, padding, padding, chartWidth, chartHeight, maxAQI);

        // Draw grid lines
        this.drawGrid(ctx, padding, padding, chartWidth, chartHeight, maxAQI);

        // Draw AQI line
        this.drawAQILine(ctx, historicalData, padding, padding, chartWidth, chartHeight, aqiRange, minAQI);

        // Draw axes
        this.drawAxes(ctx, historicalData, padding, padding, chartWidth, chartHeight, maxAQI);

        // Draw current value indicator
        this.drawCurrentIndicator(ctx, historicalData, padding, padding, chartWidth, chartHeight, aqiRange, minAQI);
    }

    drawAQIZones(ctx, x, y, width, height, maxAQI) {
        const zones = [
            { max: 50, color: 'rgba(0, 184, 148, 0.1)' },
            { max: 100, color: 'rgba(253, 203, 110, 0.1)' },
            { max: 150, color: 'rgba(225, 112, 85, 0.1)' },
            { max: 200, color: 'rgba(214, 48, 49, 0.1)' },
            { max: 300, color: 'rgba(162, 155, 254, 0.1)' },
            { max: 500, color: 'rgba(45, 52, 54, 0.1)' }
        ];

        let lastY = y + height;
        zones.forEach(zone => {
            if (zone.max <= maxAQI) {
                const zoneY = y + height - (zone.max / maxAQI) * height;
                
                ctx.fillStyle = zone.color;
                ctx.fillRect(x, zoneY, width, lastY - zoneY);
                
                lastY = zoneY;
            }
        });
    }

    drawGrid(ctx, x, y, width, height, maxAQI) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        const gridLines = [50, 100, 150, 200, 250, 300];
        gridLines.forEach(value => {
            if (value <= maxAQI) {
                const gridY = y + height - (value / maxAQI) * height;
                ctx.beginPath();
                ctx.moveTo(x, gridY);
                ctx.lineTo(x + width, gridY);
                ctx.stroke();
            }
        });

        // Vertical grid lines (every 4 hours)
        for (let i = 0; i <= 24; i += 4) {
            const gridX = x + (i / 24) * width;
            ctx.beginPath();
            ctx.moveTo(gridX, y);
            ctx.lineTo(gridX, y + height);
            ctx.stroke();
        }
    }

    drawAQILine(ctx, data, x, y, width, height, aqiRange, minAQI) {
        if (data.length < 2) return;

        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, 'rgba(116, 185, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(116, 185, 255, 0.05)');

        ctx.beginPath();
        
        // Draw line and area
        data.forEach((point, index) => {
            const pointX = x + (index / (data.length - 1)) * width;
            const pointY = y + height - ((point.aqi - minAQI) / aqiRange) * height;
            
            if (index === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        });

        // Stroke the line
        ctx.stroke();

        // Fill area under line
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw data points
        ctx.fillStyle = '#74b9ff';
        data.forEach((point, index) => {
            const pointX = x + (index / (data.length - 1)) * width;
            const pointY = y + height - ((point.aqi - minAQI) / aqiRange) * height;
            
            ctx.beginPath();
            ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawAxes(ctx, data, x, y, width, height, maxAQI) {
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.font = '12px Segoe UI';
        ctx.fillStyle = '#636e72';

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();

        // X-axis
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();

        // Y-axis labels
        const yLabels = [0, 50, 100, 150, 200, 250, 300];
        yLabels.forEach(value => {
            if (value <= maxAQI) {
                const labelY = y + height - (value / maxAQI) * height;
                ctx.fillText(value.toString(), x - 30, labelY + 4);
            }
        });

        // X-axis labels (time)
        const timeLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
        timeLabels.forEach((label, index) => {
            const labelX = x + (index / 4) * width;
            ctx.fillText(label, labelX - 15, y + height + 20);
        });
    }

    drawCurrentIndicator(ctx, data, x, y, width, height, aqiRange, minAQI) {
        if (data.length === 0) return;

        const currentData = data[data.length - 1];
        const currentX = x + width;
        const currentY = y + height - ((currentData.aqi - minAQI) / aqiRange) * height;

        // Draw indicator line
        ctx.strokeStyle = '#e84393';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(currentX, y);
        ctx.lineTo(currentX, y + height);
        ctx.stroke();
        
        ctx.setLineDash([]);

        // Draw current value circle
        ctx.fillStyle = '#e84393';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw current value label
        ctx.fillStyle = '#2d3436';
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillText(`${currentData.aqi}`, currentX + 10, currentY + 5);
    }

    renderPollutantChart(pollutants) {
        if (!pollutants) return;

        const ctx = this.pollutantCtx;
        const canvas = this.pollutantCanvas;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart data
        const data = [
            { name: 'PM2.5', value: pollutants.pm25, color: '#e17055', unit: 'μg/m³' },
            { name: 'PM10', value: pollutants.pm10, color: '#fdcb6e', unit: 'μg/m³' },
            { name: 'O₃', value: pollutants.o3, color: '#00b894', unit: 'μg/m³' },
            { name: 'NO₂', value: pollutants.no2, color: '#74b9ff', unit: 'μg/m³' },
            { name: 'SO₂', value: pollutants.so2, color: '#a29bfe', unit: 'μg/m³' },
            { name: 'CO', value: pollutants.co, color: '#fd79a8', unit: 'mg/m³' }
        ];

        // Calculate total for percentages
        const total = data.reduce((sum, item) => sum + item.value, 0);

        // Draw pie chart
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;

        let currentAngle = -Math.PI / 2; // Start from top

        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw slice border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw center circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw center text
        ctx.fillStyle = '#2d3436';
        ctx.font = 'bold 16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Pollutants', centerX, centerY - 5);
        ctx.font = '12px Segoe UI';
        ctx.fillText('Breakdown', centerX, centerY + 10);
    }

    redrawCharts() {
        // Redraw with current data
        if (window.aqiDashboard) {
            const data = window.aqiDashboard.getCurrentData();
            if (data) {
                this.renderAQIChart(data.historicalData);
                this.renderPollutantChart(data.pollutants);
            }
        }
    }

    updatePollutantValues(pollutants) {
        // Update the pollutant values in the UI
        document.getElementById('pm25Value').textContent = `${pollutants.pm25} μg/m³`;
        document.getElementById('pm10Value').textContent = `${pollutants.pm10} μg/m³`;
        document.getElementById('o3Value').textContent = `${pollutants.o3} μg/m³`;
        document.getElementById('no2Value').textContent = `${pollutants.no2} μg/m³`;
        document.getElementById('so2Value').textContent = `${pollutants.so2} μg/m³`;
        document.getElementById('coValue').textContent = `${pollutants.co} mg/m³`;
    }
}