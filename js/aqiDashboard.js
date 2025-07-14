class AQIDashboard {
    constructor() {
        this.dataStorage = new DataStorage();
        this.networkManager = new NetworkManager();
        this.locationManager = new LocationManager();
        this.chartRenderer = new ChartRenderer();
        this.backgroundMonitor = new BackgroundMonitor();
        this.stationObserver = new StationObserver();
        
        this.currentData = null;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startBackgroundMonitoring();
        
        // Make globally accessible
        window.aqiDashboard = this;
        window.networkManager = this.networkManager;
    }

    setupEventListeners() {
        // Location button
        const locationBtn = document.getElementById('locationBtn');
        locationBtn.addEventListener('click', () => this.enableLocation());

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => this.refreshData());

        // Time range selector
        const timeRange = document.getElementById('timeRange');
        timeRange.addEventListener('change', (e) => this.changeTimeRange(e.target.value));
    }

    async enableLocation() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.add('show');

        try {
            const success = await this.locationManager.enableLocation();
            if (success) {
                // Update monitoring stations
                const location = this.locationManager.getCurrentLocation();
                if (location) {
                    const stations = this.dataStorage.generateMonitoringStations(
                        location.latitude,
                        location.longitude
                    );
                    this.updateMonitoringStations(stations);
                }
                
                // Update health recommendations based on location
                this.updateHealthRecommendations();
            }
        } catch (error) {
            console.error('Error enabling location:', error);
        } finally {
            loadingIndicator.classList.remove('show');
        }
    }

    loadInitialData() {
        this.currentData = this.dataStorage.getCurrentData();
        
        if (this.currentData) {
            this.updateUI();
            this.renderCharts();
            this.updateHealthRecommendations();
        }
    }

    updateUI() {
        if (!this.currentData) return;

        // Update main AQI display
        const currentAQI = document.getElementById('currentAQI');
        const aqiCategory = document.getElementById('aqiCategory');
        const lastUpdated = document.getElementById('lastUpdated');
        const aqiTrend = document.getElementById('aqiTrend');

        currentAQI.textContent = this.currentData.currentAQI;
        
        const aqiInfo = this.dataStorage.getAQICategory(this.currentData.currentAQI);
        aqiCategory.textContent = aqiInfo.category;
        aqiCategory.className = `aqi-category ${aqiInfo.class}`;
        
        lastUpdated.textContent = `Last updated: ${new Date(this.currentData.lastUpdated).toLocaleTimeString()}`;
        
        // Update trend indicator
        const trendIcons = {
            'increasing': '📈',
            'decreasing': '📉',
            'stable': '➡️'
        };
        aqiTrend.textContent = trendIcons[this.currentData.trend] || '➡️';

        // Update weather metrics
        document.getElementById('temperature').textContent = `${this.currentData.temperature}°C`;
        document.getElementById('feelsLike').textContent = `${Math.round(this.currentData.temperature + (Math.random() - 0.5) * 3)}°C`;
        document.getElementById('humidity').textContent = `${this.currentData.humidity}%`;
        document.getElementById('windSpeed').textContent = `${this.currentData.windSpeed} km/h`;
        document.getElementById('windDirection').textContent = this.currentData.windDirection;
        document.getElementById('visibility').textContent = `${this.currentData.visibility} km`;
    }

    renderCharts() {
        if (!this.currentData) return;

        // Schedule chart rendering in background
        this.backgroundMonitor.scheduleChartUpdate(this.chartRenderer, this.currentData);
    }

    updateHealthRecommendations() {
        if (!this.currentData) return;

        // Schedule health recommendations update in background
        this.backgroundMonitor.scheduleHealthRecommendations(this.currentData.currentAQI);
    }

    updateMonitoringStations(stations) {
        // Use intersection observer to render stations
        this.stationObserver.renderStations(stations);
    }

    refreshData() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.add('show');

        // Schedule data refresh in background
        this.backgroundMonitor.addTask(async () => {
            try {
                // Simulate network delay
                await this.simulateNetworkDelay();
                
                // Refresh data
                this.currentData = this.dataStorage.refreshData();
                
                // Update UI
                this.updateUI();
                this.renderCharts();
                this.updateHealthRecommendations();
                
                // Update stations if location is enabled
                if (this.locationManager.isLocationEnabled()) {
                    const location = this.locationManager.getCurrentLocation();
                    if (location) {
                        const stations = this.dataStorage.generateMonitoringStations(
                            location.latitude,
                            location.longitude
                        );
                        this.updateMonitoringStations(stations);
                    }
                }
                
                console.log('📊 Data refreshed successfully');
                return true;
                
            } catch (error) {
                console.error('Error refreshing data:', error);
                throw error;
            }
        }, 'high').finally(() => {
            loadingIndicator.classList.remove('show');
        });
    }

    changeTimeRange(range) {
        // This would typically fetch different historical data
        console.log(`📊 Time range changed to: ${range}`);
        
        // For demo purposes, we'll just re-render with current data
        this.renderCharts();
    }

    startBackgroundMonitoring() {
        // Start background data monitoring
        this.backgroundMonitor.startDataMonitoring(() => {
            this.refreshData();
        });
    }

    updateRefreshInterval(newInterval) {
        this.backgroundMonitor.updateFrequency(newInterval);
    }

    async simulateNetworkDelay() {
        const quality = this.networkManager.getQuality();
        const delays = {
            'high': 200,
            'medium': 500,
            'low': 1000,
            'very-low': 2000,
            'offline': 0
        };
        
        const delay = delays[quality] || 500;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    getCurrentData() {
        return this.currentData;
    }

    // Cleanup method
    destroy() {
        this.backgroundMonitor.destroy();
        this.stationObserver.disconnect();
        this.locationManager.stopWatching();
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}