class DataStorage {
    constructor() {
        this.storageKey = 'airQualityData';
        this.locationKey = 'userLocation';
        this.stationsKey = 'monitoringStations';
        this.init();
    }

    init() {
        // Initialize storage if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        const currentAQI = this.generateRealisticAQI();
        const temperature = this.generateTemperature();
        const humidity = this.generateHumidity();
        const windSpeed = this.generateWindSpeed();
        const windDirection = this.generateWindDirection();
        const visibility = this.generateVisibility();
        const pollutants = this.generatePollutants();
        const historicalData = this.generateHistoricalData(currentAQI);
        
        const defaultData = {
            currentAQI: currentAQI,
            lastUpdated: new Date().toISOString(),
            temperature: temperature,
            humidity: humidity,
            windSpeed: windSpeed,
            windDirection: windDirection,
            visibility: visibility,
            pollutants: pollutants,
            historicalData: historicalData,
            trend: this.calculateTrend(historicalData)
        };

        localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
    }

    generateRealisticAQI() {
        // Generate AQI based on realistic distribution
        // Most cities have moderate air quality (51-100)
        const random = Math.random();
        
        if (random < 0.3) {
            return Math.floor(Math.random() * 50) + 1; // Good (1-50)
        } else if (random < 0.7) {
            return Math.floor(Math.random() * 50) + 51; // Moderate (51-100)
        } else if (random < 0.85) {
            return Math.floor(Math.random() * 50) + 101; // Unhealthy for Sensitive (101-150)
        } else if (random < 0.95) {
            return Math.floor(Math.random() * 50) + 151; // Unhealthy (151-200)
        } else if (random < 0.99) {
            return Math.floor(Math.random() * 100) + 201; // Very Unhealthy (201-300)
        } else {
            return Math.floor(Math.random() * 200) + 301; // Hazardous (301-500)
        }
    }

    generateTemperature() {
        // Generate realistic temperature based on season
        const month = new Date().getMonth();
        let baseTemp;
        
        if (month >= 2 && month <= 4) { // Spring
            baseTemp = 18;
        } else if (month >= 5 && month <= 7) { // Summer
            baseTemp = 28;
        } else if (month >= 8 && month <= 10) { // Fall
            baseTemp = 20;
        } else { // Winter
            baseTemp = 8;
        }
        
        return Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10;
    }

    generateHumidity() {
        return Math.floor(Math.random() * 40) + 40; // 40-80%
    }

    generateWindSpeed() {
        return Math.round((Math.random() * 25 + 5) * 10) / 10; // 5-30 km/h
    }

    generateWindDirection() {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    generateVisibility() {
        return Math.round((Math.random() * 15 + 5) * 10) / 10; // 5-20 km
    }

    generatePollutants() {
        return {
            pm25: Math.round((Math.random() * 50 + 10) * 10) / 10,
            pm10: Math.round((Math.random() * 80 + 20) * 10) / 10,
            o3: Math.round((Math.random() * 120 + 30) * 10) / 10,
            no2: Math.round((Math.random() * 60 + 15) * 10) / 10,
            so2: Math.round((Math.random() * 40 + 5) * 10) / 10,
            co: Math.round((Math.random() * 8 + 2) * 100) / 100
        };
    }

    generateHistoricalData(baseAQI = null) {
        const data = [];
        const now = new Date();
        const currentAQI = baseAQI || 75; // Use provided AQI or default to 75
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const variation = (Math.random() - 0.5) * 30;
            const aqi = Math.max(1, Math.min(500, Math.round(currentAQI + variation)));
            
            data.push({
                time: time.toISOString(),
                aqi: aqi,
                hour: time.getHours()
            });
        }
        
        return data;
    }

    calculateTrend(historicalData = null) {
        const histData = historicalData || (this.getCurrentData() && this.getCurrentData().historicalData);
        if (!histData || histData.length < 2) {
            return 'stable';
        }
        
        const recent = histData.slice(-3);
        const older = histData.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, item) => sum + item.aqi, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + item.aqi, 0) / older.length;
        
        const difference = recentAvg - olderAvg;
        
        if (difference > 5) return 'increasing';
        if (difference < -5) return 'decreasing';
        return 'stable';
    }

    getCurrentData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    updateData(newData) {
        const currentData = this.getCurrentData() || {};
        const updatedData = {
            ...currentData,
            ...newData,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
        return updatedData;
    }

    refreshData() {
        // Simulate data refresh with slight variations
        const currentData = this.getCurrentData();
        if (!currentData) {
            this.initializeDefaultData();
            return this.getCurrentData();
        }

        // Add small variations to simulate real-time updates
        const variations = {
            currentAQI: Math.max(1, Math.min(500, currentData.currentAQI + (Math.random() - 0.5) * 10)),
            temperature: Math.round((currentData.temperature + (Math.random() - 0.5) * 2) * 10) / 10,
            humidity: Math.max(20, Math.min(100, currentData.humidity + (Math.random() - 0.5) * 5)),
            windSpeed: Math.max(0, Math.round((currentData.windSpeed + (Math.random() - 0.5) * 3) * 10) / 10),
            visibility: Math.max(1, Math.round((currentData.visibility + (Math.random() - 0.5) * 2) * 10) / 10)
        };

        // Update historical data
        const newHistoricalPoint = {
            time: new Date().toISOString(),
            aqi: Math.round(variations.currentAQI),
            hour: new Date().getHours()
        };

        const updatedHistorical = [...currentData.historicalData.slice(1), newHistoricalPoint];

        return this.updateData({
            ...variations,
            historicalData: updatedHistorical,
            trend: this.calculateTrend(updatedHistorical),
            pollutants: this.generatePollutants()
        });
    }

    saveLocation(location) {
        localStorage.setItem(this.locationKey, JSON.stringify(location));
    }

    getLocation() {
        const location = localStorage.getItem(this.locationKey);
        return location ? JSON.parse(location) : null;
    }

    generateMonitoringStations(userLat, userLon) {
        const stations = [];
        const stationNames = [
            'Central Monitoring Station',
            'Industrial District Monitor',
            'Residential Area Station',
            'Traffic Junction Monitor',
            'Park Environmental Station',
            'University Campus Monitor',
            'Hospital District Station',
            'Commercial Zone Monitor'
        ];

        for (let i = 0; i < 6; i++) {
            // Generate stations within 20km radius
            const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5;
            const distance = Math.random() * 15 + 2; // 2-17 km
            
            const lat = userLat + (distance / 111) * Math.cos(angle);
            const lon = userLon + (distance / (111 * Math.cos(userLat * Math.PI / 180))) * Math.sin(angle);
            
            stations.push({
                id: i + 1,
                name: stationNames[i],
                latitude: lat,
                longitude: lon,
                distance: Math.round(distance * 10) / 10,
                aqi: this.generateRealisticAQI(),
                status: Math.random() > 0.1 ? 'active' : 'maintenance'
            });
        }

        // Sort by distance
        stations.sort((a, b) => a.distance - b.distance);
        
        localStorage.setItem(this.stationsKey, JSON.stringify(stations));
        return stations;
    }

    getMonitoringStations() {
        const stations = localStorage.getItem(this.stationsKey);
        return stations ? JSON.parse(stations) : [];
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return { category: 'Good', class: 'aqi-good' };
        if (aqi <= 100) return { category: 'Moderate', class: 'aqi-moderate' };
        if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', class: 'aqi-unhealthy-sensitive' };
        if (aqi <= 200) return { category: 'Unhealthy', class: 'aqi-unhealthy' };
        if (aqi <= 300) return { category: 'Very Unhealthy', class: 'aqi-very-unhealthy' };
        return { category: 'Hazardous', class: 'aqi-hazardous' };
    }

    getHealthRecommendations(aqi) {
        const recommendations = [];
        
        if (aqi <= 50) {
            recommendations.push({
                icon: '🏃‍♂️',
                text: 'Perfect day for outdoor activities and exercise!'
            });
            recommendations.push({
                icon: '🌳',
                text: 'Great time to spend time in parks and gardens.'
            });
        } else if (aqi <= 100) {
            recommendations.push({
                icon: '👥',
                text: 'Generally safe for most people to be outdoors.'
            });
            recommendations.push({
                icon: '⚠️',
                text: 'Sensitive individuals should consider reducing prolonged outdoor exertion.'
            });
        } else if (aqi <= 150) {
            recommendations.push({
                icon: '🏠',
                text: 'Sensitive groups should limit outdoor activities.'
            });
            recommendations.push({
                icon: '😷',
                text: 'Consider wearing a mask if you must go outside.'
            });
        } else if (aqi <= 200) {
            recommendations.push({
                icon: '🚫',
                text: 'Everyone should avoid prolonged outdoor exertion.'
            });
            recommendations.push({
                icon: '🏠',
                text: 'Stay indoors and keep windows closed.'
            });
        } else if (aqi <= 300) {
            recommendations.push({
                icon: '⚠️',
                text: 'Health alert: everyone may experience serious health effects.'
            });
            recommendations.push({
                icon: '🏥',
                text: 'Avoid all outdoor activities. Seek medical attention if experiencing symptoms.'
            });
        } else {
            recommendations.push({
                icon: '🚨',
                text: 'Emergency conditions: everyone should avoid outdoor activities.'
            });
            recommendations.push({
                icon: '🏥',
                text: 'Health warnings of emergency conditions. Consult healthcare provider.'
            });
        }
        
        return recommendations;
    }
}