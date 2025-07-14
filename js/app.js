// Initialize the Air Quality Dashboard application
document.addEventListener('DOMContentLoaded', () => {
    // Check for Web API support
    checkWebAPISupport();
    
    // Initialize the dashboard
    const dashboard = new AQIDashboard();
    
    console.log('🌍 Air Quality Dashboard initialized successfully!');
    
    // Add some helpful console commands for debugging
    window.debugDashboard = {
        refreshData: () => dashboard.refreshData(),
        getCurrentData: () => dashboard.getCurrentData(),
        getNetworkStatus: () => window.networkManager?.getQuality(),
        getLocationStatus: () => dashboard.locationManager.isLocationEnabled(),
        getQueueStatus: () => dashboard.backgroundMonitor.getQueueStatus()
    };
    
    console.log('🔧 Debug commands available: window.debugDashboard');
});

function checkWebAPISupport() {
    const supportStatus = {
        geolocation: !!navigator.geolocation,
        canvas: !!document.createElement('canvas').getContext,
        intersectionObserver: !!window.IntersectionObserver,
        networkInformation: !!navigator.connection,
        backgroundTasks: !!window.requestIdleCallback,
        localStorage: !!window.localStorage
    };

    console.log('🔍 Web API Support Status:', supportStatus);
    
    // Show warnings for critical unsupported APIs
    const warnings = [];
    
    if (!supportStatus.geolocation) {
        warnings.push('Geolocation API not supported - location features disabled');
    }
    
    if (!supportStatus.canvas) {
        warnings.push('Canvas API not supported - charts will not render');
    }
    
    if (!supportStatus.intersectionObserver) {
        warnings.push('Intersection Observer API not supported - using fallback loading');
    }
    
    if (!supportStatus.networkInformation) {
        warnings.push('Network Information API not supported - using default update frequency');
    }
    
    if (!supportStatus.backgroundTasks) {
        warnings.push('Background Tasks API not supported - using standard processing');
    }
    
    if (!supportStatus.localStorage) {
        warnings.push('Local Storage not supported - data will not persist');
    }
    
    if (warnings.length > 0) {
        console.warn('⚠️ Some features may be limited:', warnings);
        
        // Show user-friendly warning
        showCompatibilityWarning(warnings);
    } else {
        console.log('✅ All Web APIs supported - full functionality available');
    }
}

function showCompatibilityWarning(warnings) {
    const warningDiv = document.createElement('div');
    warningDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #fdcb6e, #e17055);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 500px;
            text-align: center;
            font-weight: 600;
        ">
            ⚠️ Some features may be limited in this browser
            <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.9;">
                For the best experience, use a modern browser
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                margin-top: 10px;
                cursor: pointer;
            ">Dismiss</button>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (warningDiv.parentElement) {
            warningDiv.remove();
        }
    }, 10000);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Application error:', event.error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, #d63031, #e84393);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            max-width: 300px;
        ">
            ⚠️ Something went wrong
            <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.9;">
                Please refresh the page
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up resources
    if (window.aqiDashboard) {
        window.aqiDashboard.destroy();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.aqiDashboard) {
        if (document.hidden) {
            // Page is hidden, reduce update frequency
            console.log('📱 Page hidden - reducing update frequency');
        } else {
            // Page is visible, resume normal updates
            console.log('📱 Page visible - resuming normal updates');
            window.aqiDashboard.refreshData();
        }
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        if (window.aqiDashboard) {
            window.aqiDashboard.refreshData();
        }
    }
    
    // Ctrl/Cmd + L for location
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        if (window.aqiDashboard) {
            window.aqiDashboard.enableLocation();
        }
    }
});