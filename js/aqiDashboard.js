// class AQIDashboard {
//     constructor() {
//         this.dataStorage = new DataStorage();
//         this.networkManager = new NetworkManager();
//         this.locationManager = new LocationManager();
//         this.chartRenderer = new ChartRenderer();
//         this.backgroundMonitor = new BackgroundMonitor();
//         this.stationObserver = new StationObserver();
        
//         this.currentData = null;
//         this.refreshInterval = null;
        
//         this.init();
//     }

//     init() {
//         this.setupEventListeners();
//         this.loadInitialData();
//         this.startBackgroundMonitoring();
        
//         // Make globally accessible
//         window.aqiDashboard = this;
//         window.networkManager = this.networkManager;
//     }

//     setupEventListeners() {
//         // Location button
//         const locationBtn = document.getElementById('locationBtn');
//         locationBtn.addEventListener('click', () => this.enableLocation());

//         // Refresh button
//         const refreshBtn = document.getElementById('refreshBtn');
//         refreshBtn.addEventListener('click', () => this.refreshData());

//         // Time range selector
//         const timeRange = document.getElementById('timeRange');
//         timeRange.addEventListener('change', (e) => this.changeTimeRange(e.target.value));
//     }

//     async enableLocation() {
//         const loadingIndicator = document.getElementById('loadingIndicator');
//         loadingIndicator.classList.add('show');

//         try {
//             const success = await this.locationManager.enableLocation();
//             if (success) {
//                 // Update monitoring stations
//                 const location = this.locationManager.getCurrentLocation();
//                 if (location) {
//                     const stations = this.dataStorage.generateMonitoringStations(
//                         location.latitude,
//                         location.longitude
//                     );
//                     this.updateMonitoringStations(stations);
//                 }
                
//                 // Update health recommendations based on location
//                 this.updateHealthRecommendations();
//             }
//         } catch (error) {
//             console.error('Error enabling location:', error);
//         } finally {
//             loadingIndicator.classList.remove('show');
//         }
//     }

//     loadInitialData() {
//         this.currentData = this.dataStorage.getCurrentData();
        
//         if (this.currentData) {
//             this.updateUI();
//             this.renderCharts();
//             this.updateHealthRecommendations();
//         }
//     }

//     updateUI() {
//         if (!this.currentData) return;

//         // Update main AQI display
//         const currentAQI = document.getElementById('currentAQI');
//         const aqiCategory = document.getElementById('aqiCategory');
//         const lastUpdated = document.getElementById('lastUpdated');
//         const aqiTrend = document.getElementById('aqiTrend');

//         currentAQI.textContent = this.currentData.currentAQI;
        
//         const aqiInfo = this.dataStorage.getAQICategory(this.currentData.currentAQI);
//         aqiCategory.textContent = aqiInfo.category;
//         aqiCategory.className = `aqi-category ${aqiInfo.class}`;
        
//         lastUpdated.textContent = `Last updated: ${new Date(this.currentData.lastUpdated).toLocaleTimeString()}`;
        
//         // Update trend indicator
//         const trendIcons = {
//             'increasing': '📈',
//             'decreasing': '📉',
//             'stable': '➡️'
//         };
//         aqiTrend.textContent = trendIcons[this.currentData.trend] || '➡️';

//         // Update weather metrics
//         document.getElementById('temperature').textContent = `${this.currentData.temperature}°C`;
//         document.getElementById('feelsLike').textContent = `${Math.round(this.currentData.temperature + (Math.random() - 0.5) * 3)}°C`;
//         document.getElementById('humidity').textContent = `${this.currentData.humidity}%`;
//         document.getElementById('windSpeed').textContent = `${this.currentData.windSpeed} km/h`;
//         document.getElementById('windDirection').textContent = this.currentData.windDirection;
//         document.getElementById('visibility').textContent = `${this.currentData.visibility} km`;
//     }

//     renderCharts() {
//         if (!this.currentData) return;

//         // Schedule chart rendering in background
//         this.backgroundMonitor.scheduleChartUpdate(this.chartRenderer, this.currentData);
//     }

//     updateHealthRecommendations() {
//         if (!this.currentData) return;

//         // Schedule health recommendations update in background
//         this.backgroundMonitor.scheduleHealthRecommendations(this.currentData.currentAQI);
//     }

//     updateMonitoringStations(stations) {
//         // Use intersection observer to render stations
//         this.stationObserver.renderStations(stations);
//     }

//     refreshData() {
//         const loadingIndicator = document.getElementById('loadingIndicator');
//         loadingIndicator.classList.add('show');

//         // Schedule data refresh in background
//         this.backgroundMonitor.addTask(async () => {
//             try {
//                 // Simulate network delay
//                 await this.simulateNetworkDelay();
                
//                 // Refresh data
//                 this.currentData = this.dataStorage.refreshData();
                
//                 // Update UI
//                 this.updateUI();
//                 this.renderCharts();
//                 this.updateHealthRecommendations();
                
//                 // Update stations if location is enabled
//                 if (this.locationManager.isLocationEnabled()) {
//                     const location = this.locationManager.getCurrentLocation();
//                     if (location) {
//                         const stations = this.dataStorage.generateMonitoringStations(
//                             location.latitude,
//                             location.longitude
//                         );
//                         this.updateMonitoringStations(stations);
//                     }
//                 }
                
//                 console.log('📊 Data refreshed successfully');
//                 return true;
                
//             } catch (error) {
//                 console.error('Error refreshing data:', error);
//                 throw error;
//             }
//         }, 'high').finally(() => {
//             loadingIndicator.classList.remove('show');
//         });
//     }

//     changeTimeRange(range) {
//         // This would typically fetch different historical data
//         console.log(`📊 Time range changed to: ${range}`);
        
//         // For demo purposes, we'll just re-render with current data
//         this.renderCharts();
//     }

//     startBackgroundMonitoring() {
//         // Start background data monitoring
//         this.backgroundMonitor.startDataMonitoring(() => {
//             this.refreshData();
//         });
//     }

//     updateRefreshInterval(newInterval) {
//         this.backgroundMonitor.updateFrequency(newInterval);
//     }

//     async simulateNetworkDelay() {
//         const quality = this.networkManager.getQuality();
//         const delays = {
//             'high': 200,
//             'medium': 500,
//             'low': 1000,
//             'very-low': 2000,
//             'offline': 0
//         };
        
//         const delay = delays[quality] || 500;
//         if (delay > 0) {
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }

//     getCurrentData() {
//         return this.currentData;
//     }

//     // Cleanup method
//     destroy() {
//         this.backgroundMonitor.destroy();
//         this.stationObserver.disconnect();
//         this.locationManager.stopWatching();
        
//         if (this.refreshInterval) {
//             clearInterval(this.refreshInterval);
//         }
//     }
// }



class AQIDashboard {
    constructor() {
        this.apiBaseUrl = 'https://your-backend.vercel.app/api'; // use your backend URL
        this.currentData = null;
        this.refreshInterval = null;

        this.dataStorage = new DataStorage();
        this.networkManager = new NetworkManager();
        this.locationManager = new LocationManager();
        this.chartRenderer = new ChartRenderer();
        this.backgroundMonitor = new BackgroundMonitor();
        this.stationObserver = new StationObserver();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startBackgroundMonitoring();

        // Make globally accessible for debug
        window.aqiDashboard = this;
    }

    setupEventListeners() {
        document.getElementById('locationBtn').addEventListener('click', () => this.enableLocation());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('timeRange').addEventListener('change', (e) => this.changeTimeRange(e.target.value));
    }

    async enableLocation() {
        this.showLoading(true);
        try {
            const location = await this.locationManager.enableLocation();
            if (location) {
                await this.fetchAndUpdateData(location);
                this.updateMonitoringStations(location);
            }
        } catch (err) {
            console.error('Enable location error:', err);
        } finally {
            this.showLoading(false);
        }
    }

    async loadInitialData() {
        const saved = this.dataStorage.getCurrentData();
        if (saved) {
            this.currentData = saved;
            this.updateUI();
            this.renderCharts();
        } else {
            // Try to fetch fresh data if location is available
            const location = this.locationManager.getCurrentLocation();
            if (location) {
                await this.fetchAndUpdateData(location);
            }
        }
    }

    async refreshData() {
        this.showLoading(true);
        try {
            const location = this.locationManager.getCurrentLocation();
            if (location) {
                await this.fetchAndUpdateData(location);
                this.updateMonitoringStations(location);
            } else {
                console.warn('No location. Ask user to enable location.');
            }
        } catch (err) {
            console.error('Refresh data error:', err);
        } finally {
            this.showLoading(false);
        }
    }

    async fetchAndUpdateData(location) {
        try {
            // Fetch AQI & weather from backend API
            const response = await fetch(`${this.apiBaseUrl}/aqi?lat=${location.latitude}&lon=${location.longitude}`);
            if (!response.ok) throw new Error('API fetch failed');
            const data = await response.json();

            this.currentData = {
                currentAQI: data.aqi,
                temperature: data.temperature,
                humidity: data.humidity,
                windSpeed: data.windSpeed,
                windDirection: data.windDirection,
                visibility: data.visibility,
                trend: data.trend || 'stable',
                lastUpdated: Date.now()
            };

            // Save for offline
            this.dataStorage.saveCurrentData(this.currentData);

            // Update UI
            this.updateUI();
            this.renderCharts();
        } catch (err) {
            console.error('Fetch & update error:', err);
        }
    }

    updateUI() {
        if (!this.currentData) return;

        const { currentAQI, temperature, humidity, windSpeed, visibility, lastUpdated, trend } = this.currentData;

        document.getElementById('currentAQI').textContent = currentAQI;
        document.getElementById('temperature').textContent = `${temperature}°C`;
        document.getElementById('feelsLike').textContent = `${Math.round(temperature + (Math.random() - 0.5) * 3)}°C`;
        document.getElementById('humidity').textContent = `${humidity}%`;
        document.getElementById('windSpeed').textContent = `${windSpeed} km/h`;
        document.getElementById('visibility').textContent = `${visibility} km`;
        document.getElementById('lastUpdated').textContent = `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`;

        const trendIcons = { increasing: '📈', decreasing: '📉', stable: '➡️' };
        document.getElementById('aqiTrend').textContent = trendIcons[trend] || '➡️';

        const aqiInfo = this.dataStorage.getAQICategory(currentAQI);
        const aqiCategory = document.getElementById('aqiCategory');
        aqiCategory.textContent = aqiInfo.category;
        aqiCategory.className = `aqi-category ${aqiInfo.class}`;
    }

    renderCharts() {
        if (this.currentData) {
            this.backgroundMonitor.scheduleChartUpdate(this.chartRenderer, this.currentData);
        }
    }

    updateMonitoringStations(location) {
        const stations = this.dataStorage.generateMonitoringStations(location.latitude, location.longitude);
        this.stationObserver.renderStations(stations);
    }

    changeTimeRange(range) {
        console.log(`Time range changed to: ${range}`);
        this.renderCharts();
    }

    startBackgroundMonitoring() {
        this.backgroundMonitor.startDataMonitoring(() => this.refreshData());
    }

    showLoading(isLoading) {
        const loading = document.getElementById('loadingIndicator');
        loading.classList.toggle('show', isLoading);
    }

    destroy() {
        this.backgroundMonitor.destroy();
        this.stationObserver.disconnect();
        this.locationManager.stopWatching();
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }
}
