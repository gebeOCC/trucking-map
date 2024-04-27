import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS

mapboxgl.accessToken = 'pk.eyJ1IjoiMWJhcnJ5MTIzIiwiYSI6ImNsdmdpa2IzcjA2YzYya255dDZtb3FueHMifQ.9TtR0xoQt9Mi8B9-Gpb0MA';

function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(122.9545); // Center longitude for Philippines
    const [lat, setLat] = useState(12.8797); // Center latitude for Philippines
    const [zoom, setZoom] = useState(5); // Zoom level for Philippines
    const [mapStyle, setMapStyle] = useState('mapbox://styles/1barry123/clvi2k5vd00an01ob3n2e2qmu');
    const [pickup, setPickup] = useState([124.45771485849178, 8.596826464192702]);
    const [dropoff, setDropoff] = useState([124.5723121079061, 8.521490348231794]);

    useEffect(() => {
        // Initialize map when component mounts
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: [lng, lat],
            zoom: zoom,
            maxBounds: [
                [116.95, 4.6],
                [127.3, 21.7]
            ]
        });

        map.current.addControl(new mapboxgl.NavigationControl());

        // Update map coordinates on move
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
        addMarkers();

        // Clean up map instance when component unmounts
        return () => {
            if (map.current) {
                map.current.remove(); // Remove map instance
            }
        };
    }, [mapStyle]); // Run whenever mapStyle changes

    const addMarkers = () => {
        // Create Marker instances and add them to the map
        const marker1 = new mapboxgl.Marker({ draggable: true })
            .setLngLat(pickup)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3 style="color: blue;">From</h3>`))
            .addTo(map.current);

        const marker2 = new mapboxgl.Marker({ draggable: true })
            .setLngLat(dropoff)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3 style="color: blue;">To</h3>`))
            .addTo(map.current);

        // Add dragend event listeners to update marker positions
        marker1.on('dragend', () => {
            const lngLat = marker1.getLngLat();
            setPickup([lngLat.lng, lngLat.lat]); // Update pickup state
        });

        marker2.on('dragend', () => {
            const lngLat = marker2.getLngLat();
            setDropoff([lngLat.lng, lngLat.lat]); // Update dropoff state
        });
    };

    const handleMapStyleChange = (style) => {
        setMapStyle(style);
    };

    const getMarkerCoordinates = () => {
        if (pickup && dropoff) {
            console.log('Marker 1 coordinates:', pickup);
            console.log('Marker 2 coordinates:', dropoff);
        }
    };

    return (
        <div className="h-screen w-screen">
            <div ref={mapContainer} className="h-full w-full" />

            <div className="bg-blue-700 bg-opacity-90 text-white p-3 font-mono z-10 absolute top-4 left-4 rounded-md">
                <div>
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>
                <div className="mt-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2" onClick={() => handleMapStyleChange('mapbox://styles/1barry123/clvi2k5vd00an01ob3n2e2qmu')}>
                        Street
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={() => handleMapStyleChange('mapbox://styles/1barry123/clvi1sfb2013x01q1bgcx7zy7')}>
                        Satellite
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ml-2" onClick={getMarkerCoordinates}>
                        Get Marker Coordinates
                    </button>
                </div>
            </div>

            {/* Display marker positions */}
            <div className="bg-white p-4 fixed bottom-4 left-4 rounded-md">
                <h3 className="font-semibold mb-2">Marker Positions</h3>
                <p>Marker 1: {pickup}</p>
                <p>Marker 2: {dropoff}</p>
            </div>
        </div>
    );
}

export default App;