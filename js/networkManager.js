class NetworkManager {
    constructor() {
        this.connection = null;
        this.quality = 'high';
        this.updateFrequency = 30000; // Default 30 seconds
        this.init();
    }

    init() {
        // Check if Network Information API is supported
        if ('connection' in navigator) {
            this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            this.updateNetworkStatus();
            
            // Listen for network changes
            this.connection.addEventListener('change', () => {
                this.updateNetworkStatus();
                this.adjustUpdateFrequency();
            });
        }

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.updateNetworkStatus();
            this.resumeDataUpdates();
        });
        
        window.addEventListener('offline', () => {
            this.updateNetworkStatus();
            this.pauseDataUpdates();
        });
    }

    updateNetworkStatus() {
        const statusElement = document.getElementById('networkStatus');
        
        if (!navigator.onLine) {
            this.quality = 'offline';
            statusElement.textContent = '🔴 Offline Mode';
            statusElement.className = 'network-status offline';
            return;
        }

        if (this.connection) {
            const effectiveType = this.connection.effectiveType;
            const downlink = this.connection.downlink;
            const rtt = this.connection.rtt;
            
            // Determine quality based on connection
            if (effectiveType === '4g' && downlink > 10 && rtt < 100) {
                this.quality = 'high';
                statusElement.textContent = '🟢 Excellent Connection';
                statusElement.className = 'network-status fast';
            } else if (effectiveType === '4g' || (downlink > 5 && rtt < 200)) {
                this.quality = 'medium';
                statusElement.textContent = '🟡 Good Connection';
                statusElement.className = 'network-status slow';
            } else if (effectiveType === '3g' || (downlink > 1 && rtt < 500)) {
                this.quality = 'low';
                statusElement.textContent = '🟠 Slow Connection';
                statusElement.className = 'network-status slow';
            } else {
                this.quality = 'very-low';
                statusElement.textContent = '🔴 Very Slow Connection';
                statusElement.className = 'network-status offline';
            }
        } else {
            this.quality = 'high';
            statusElement.textContent = '🟢 Online';
            statusElement.className = 'network-status fast';
        }
    }

    adjustUpdateFrequency() {
        // Adjust data update frequency based on network quality
        switch (this.quality) {
            case 'high':
                this.updateFrequency = 15000; // 15 seconds
                break;
            case 'medium':
                this.updateFrequency = 30000; // 30 seconds
                break;
            case 'low':
                this.updateFrequency = 60000; // 1 minute
                break;
            case 'very-low':
                this.updateFrequency = 120000; // 2 minutes
                break;
            case 'offline':
                this.updateFrequency = 0; // No updates
                break;
        }

        // Notify dashboard about frequency change
        if (window.aqiDashboard) {
            window.aqiDashboard.updateRefreshInterval(this.updateFrequency);
        }
    }

    getDataLoadingStrategy() {
        // Return strategy for loading data based on network quality
        switch (this.quality) {
            case 'high':
                return {
                    loadCharts: true,
                    loadStations: true,
                    loadHistorical: true,
                    compressionLevel: 'none'
                };
            case 'medium':
                return {
                    loadCharts: true,
                    loadStations: true,
                    loadHistorical: true,
                    compressionLevel: 'light'
                };
            case 'low':
                return {
                    loadCharts: true,
                    loadStations: false,
                    loadHistorical: false,
                    compressionLevel: 'medium'
                };
            case 'very-low':
                return {
                    loadCharts: false,
                    loadStations: false,
                    loadHistorical: false,
                    compressionLevel: 'high'
                };
            default:
                return {
                    loadCharts: false,
                    loadStations: false,
                    loadHistorical: false,
                    compressionLevel: 'high'
                };
        }
    }

    getQuality() {
        return this.quality;
    }

    getUpdateFrequency() {
        return this.updateFrequency;
    }

    isOnline() {
        return navigator.onLine && this.quality !== 'offline';
    }

    pauseDataUpdates() {
        console.log('📡 Network offline - pausing data updates');
        // Show offline indicator
        this.showOfflineMessage();
    }

    resumeDataUpdates() {
        console.log('📡 Network back online - resuming data updates');
        // Hide offline indicator
        this.hideOfflineMessage();
        
        // Trigger immediate data refresh
        if (window.aqiDashboard) {
            window.aqiDashboard.refreshData();
        }
    }

    showOfflineMessage() {
        let offlineMsg = document.getElementById('offlineMessage');
        if (!offlineMsg) {
            offlineMsg = document.createElement('div');
            offlineMsg.id = 'offlineMessage';
            offlineMsg.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #d63031, #e84393);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    font-weight: 600;
                ">
                    📡 Offline - Using cached data
                </div>
            `;
            document.body.appendChild(offlineMsg);
        }
    }

    hideOfflineMessage() {
        const offlineMsg = document.getElementById('offlineMessage');
        if (offlineMsg) {
            offlineMsg.remove();
        }
    }

    getConnectionInfo() {
        if (!this.connection) {
            return {
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: 'unknown',
                rtt: 'unknown'
            };
        }

        return {
            type: this.connection.type || 'unknown',
            effectiveType: this.connection.effectiveType || 'unknown',
            downlink: this.connection.downlink || 'unknown',
            rtt: this.connection.rtt || 'unknown'
        };
    }
}