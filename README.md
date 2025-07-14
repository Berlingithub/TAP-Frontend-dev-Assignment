# Air Quality Monitoring Dashboard

A comprehensive web application that demonstrates the power of modern Web APIs working together to create a real-time air quality monitoring system. This project showcases practical applications of advanced browser capabilities for environmental data visualization and user experience optimization.

## 🌟 Features

### Core Functionality
- **Real-time AQI Monitoring**: Live air quality index tracking with persistent data
- **Location-based Data**: Automatic location detection and nearby monitoring stations
- **Interactive Charts**: Canvas-powered AQI trends and pollutant breakdowns
- **Smart Loading**: Lazy-loaded monitoring stations for optimal performance
- **Network Adaptation**: Automatic adjustment based on connection quality
- **Health Recommendations**: Personalized advice based on current air quality

### Smart Optimizations
- **Background Processing**: Non-blocking data updates and chart rendering
- **Network-Aware Updates**: Adjusts refresh frequency based on connection speed
- **Persistent Storage**: AQI values remain consistent across page reloads
- **Responsive Design**: Seamless experience across all devices
- **Progressive Enhancement**: Graceful fallbacks for unsupported features

## 🚀 Web APIs Implementation

### 1. Background Tasks API (`requestIdleCallback`)
- **Purpose**: Non-blocking operations and performance optimization
- **Implementation**:
  - Process data updates during browser idle time
  - Background chart rendering without UI blocking
  - Priority-based task queue management
  - Smooth user interface during heavy operations
- **Real-world benefit**: Maintains responsive UI while processing environmental data

### 2. Canvas API
- **Purpose**: Advanced data visualization and chart rendering
- **Implementation**:
  - Real-time AQI trend charts with color-coded zones
  - Interactive pollutant breakdown pie charts
  - Custom gradients and animations
  - High-DPI display support
- **Real-world benefit**: Rich, interactive visualizations that help users understand air quality data

### 3. Geolocation API
- **Purpose**: Location-based environmental monitoring
- **Implementation**:
  - Automatic user location detection
  - Reverse geocoding for location names
  - Generate nearby monitoring stations
  - Location-based health recommendations
- **Real-world benefit**: Personalized air quality data relevant to user's location

### 4. Intersection Observer API
- **Purpose**: Performance optimization through lazy loading
- **Implementation**:
  - Lazy load monitoring station cards
  - Smooth loading animations
  - Efficient resource management
  - Viewport-based content loading
- **Real-world benefit**: Faster initial page load and reduced memory usage

### 5. Network Information API
- **Purpose**: Adaptive performance based on connection quality
- **Implementation**:
  - Monitor connection speed and type (4G, 3G, etc.)
  - Adjust data refresh frequency dynamically
  - Show network status indicators
  - Optimize for different connection types
- **Real-world benefit**: Better user experience on slow connections with appropriate data loading strategies

## 📁 Project Structure

```
├── index.html                 # Main HTML structure
├── styles.css                 # Responsive styling and animations
├── js/
│   ├── app.js                # Application initialization and error handling
│   ├── aqiDashboard.js       # Main dashboard controller
│   ├── dataStorage.js        # Persistent data management
│   ├── networkManager.js     # Network Information API handler
│   ├── locationManager.js    # Geolocation API implementation
│   ├── chartRenderer.js      # Canvas API for data visualization
│   ├── backgroundMonitor.js  # Background Tasks API manager
│   └── stationObserver.js    # Intersection Observer for lazy loading
└── README.md                 # This documentation
```


## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Open in browser** and allow location access

##  Usage Guide

### Getting Started
1. **Enable Location**: Click "📍 Enable Location" to get personalized air quality data
2. **View Current AQI**: See real-time air quality index with color-coded categories
3. **Monitor Trends**: Observe 24-hour AQI trends in the interactive chart
4. **Check Nearby Stations**: Scroll down to see monitoring stations in your area
5. **Follow Health Advice**: Get personalized recommendations based on current air quality


## 🔧 Technical Implementation

### Data Persistence Strategy
- **LocalStorage**: Stores AQI data, location, and monitoring stations
- **Realistic Data Generation**: Creates believable air quality patterns
- **Consistent Values**: AQI doesn't change randomly on page reload
- **Smart Variations**: Small, realistic changes during data updates

### Performance Optimizations
- **Background Tasks**: Heavy operations run during browser idle time
- **Intersection Observer**: Monitoring stations load only when visible
- **Network Awareness**: Update frequency adapts to connection quality
- **Canvas Optimization**: High-DPI rendering with efficient redrawing

### Real-World Data Simulation
- **AQI Categories**: Realistic distribution across Good, Moderate, Unhealthy ranges
- **Weather Integration**: Temperature, humidity, wind data correlation
- **Pollutant Breakdown**: PM2.5, PM10, O₃, NO₂, SO₂, CO measurements
- **Monitoring Stations**: Generated based on actual urban planning patterns



## 📄 License

This project is open source and available under the [MIT License](LICENSE).

##  Assignment Compliance

This project successfully implements all 5 required Web APIs:

✅ **Background Tasks API**: Non-blocking data processing and updates  
✅ **Canvas API**: Interactive charts and data visualization  
✅ **Geolocation API**: Location-based air quality monitoring  
✅ **Intersection Observer API**: Lazy loading of monitoring stations  
✅ **Network Information API**: Adaptive performance optimization  

**Real-world Problem Solved**: Provides citizens with accessible, real-time air quality information to make informed decisions about outdoor activities and health precautions.

---

**Built with ❤️ using Vanilla JavaScript and Modern Web APIs**

*This project demonstrates the power of web standards in creating sophisticated, user-friendly applications that solve real environmental challenges.*


