// src/components/MapSelector.jsx (Enhanced with better feedback)
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// GeoJSON is dynamically imported to avoid bundling the large file in the initial JS

const MapSelector = ({ onCountrySelect, selectedCountry, supportedCountries }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    import('../assets/world-countries.json')
      .then(mod => {
        const data = mod.default || mod;
        if (mounted) setGeoData(data);
      })
      .catch(err => {
        console.error('Failed to load world GeoJSON:', err);
        if (mounted) setGeoError(true);
      });

    return () => { mounted = false; };
  }, []);

  const isCountrySupported = (countryName) => {
    return supportedCountries.includes(countryName);
  };

  const getCountryStyle = (feature) => {
    const countryName = feature.properties.NAME || feature.properties.name;
    const isSupported = isCountrySupported(countryName);
    
    if (selectedCountry === countryName) {
      return {
        fillColor: '#ff7800',
        weight: 3,
        color: '#ffffff',
        fillOpacity: 0.8
      };
    }
    
    if (hoveredCountry === countryName) {
      return {
        fillColor: isSupported ? '#ffaa00' : '#ff6b6b',
        weight: 2,
        color: '#ffffff',
        fillOpacity: 0.6
      };
    }
    
    return {
      fillColor: isSupported ? '#3388ff' : '#666666',
      weight: 1,
      color: '#ffffff',
      fillOpacity: isSupported ? 0.4 : 0.2
    };
  };

  // Calculate country centroid for label placement
  const getCentroid = (feature) => {
    const coords = feature.geometry.coordinates;
    let bounds = [Infinity, Infinity, -Infinity, -Infinity];

    const flattenCoords = (arr) => {
      arr.forEach(coord => {
        if (typeof coord[0] === 'number') {
          bounds[0] = Math.min(bounds[0], coord[0]);
          bounds[1] = Math.min(bounds[1], coord[1]);
          bounds[2] = Math.max(bounds[2], coord[0]);
          bounds[3] = Math.max(bounds[3], coord[1]);
        } else {
          flattenCoords(coord);
        }
      });
    };

    flattenCoords(coords);
    return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
  };

  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.NAME || feature.properties.name;
    const isSupported = isCountrySupported(countryName);
    
    layer.on({
      click: () => {
        if (isSupported) {
          onCountrySelect(countryName);
        }
      },
      mouseover: () => {
        setHoveredCountry(countryName);
        layer.setStyle({
          fillColor: isSupported ? '#ffaa00' : '#ff6b6b',
          fillOpacity: 0.6,
          cursor: isSupported ? 'pointer' : 'not-allowed'
        });
      },
      mouseout: () => {
        setHoveredCountry(null);
        layer.setStyle(getCountryStyle(feature));
      }
    });

    // Enhanced tooltip
    const tooltipText = isSupported 
      ? `${countryName} - Click to explore`
      : `${countryName} - Not available`;
    
    layer.bindTooltip(tooltipText, {
      permanent: false,
      direction: 'center',
      className: isSupported ? 'country-tooltip' : 'country-tooltip-disabled'
    });

    // Add country name label at centroid
    const [lon, lat] = getCentroid(feature);
    const label = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'country-label',
        html: `<div style="
          font-size: 10px;
          font-weight: bold;
          color: #333;
          text-align: center;
          pointer-events: none;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
          white-space: nowrap;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${countryName}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
      })
    });
    label.addTo(layer._map || mapRef.current);
  };

  return (
    <div className="map-container">
      {!geoData && !geoError && (
        <div className="geo-loading">Loading map data...</div>
      )}
      {geoError && (
        <div className="geo-error">Failed to load map data.</div>
      )}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color supported"></div>
          <span>Available Countries</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unsupported"></div>
          <span>Not Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>
      
      <MapContainer 
        ref={mapRef}
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '500px', width: '100%' }}
        className="world-map"
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        touchZoom={true}
        boxZoom={false}
        keyboard={false}
        zoomControl={true}
        wheelPxPerZoomLevel={200}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={getCountryStyle}
            onEachFeature={onEachCountry}
          />
        )}
      </MapContainer>
      
      {selectedCountry && (
        <div className="selected-country-info">
          <h3>🎬 {selectedCountry}</h3>
          <p>Exploring cinema from {selectedCountry}</p>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
