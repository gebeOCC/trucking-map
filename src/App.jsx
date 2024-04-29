import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS

mapboxgl.accessToken = 'pk.eyJ1IjoiMWJhcnJ5MTIzIiwiYSI6ImNsdmdpa2IzcjA2YzYya255dDZtb3FueHMifQ.9TtR0xoQt9Mi8B9-Gpb0MA';

import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(122.9545); // Center longitude for Philippines
    const [lat, setLat] = useState(12.8797); // Center latitude for Philippines
    const [zoom, setZoom] = useState(4); // Zoom level for Philippines
    const [mapStyle, setMapStyle] = useState('mapbox://styles/1barry123/clvi2k5vd00an01ob3n2e2qmu');
    const [pickup, setPickup] = useState([124.45771485849178, 8.596826464192702]);
    const [dropoff, setDropoff] = useState([124.5723121079061, 8.521490348231794]);
    const [distance, storeDistance] = useState('')
    const [duration, storeDuration] = useState('')

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
            setZoom(map.current.getZoom().toFixed(zoom));
        });
        addMarkers();
        // getRoute(); // Call getRoute after addMarkers

        // Clean up map instance when component unmounts
        return () => {
            if (map.current) {
                map.current.remove(); // Remove map instance
            }
        };
    }, [mapStyle]);

    useEffect(() => {
        getRoute();
    }, [pickup, dropoff]);

    useEffect(() => {
        const timer = setTimeout(() => {
            getRoute();
        }, 1000); // 1000 milliseconds = 1 second

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    const getRoute = () => {
        console.log('Getting route...');
        console.log('Pickup:', pickup);
        console.log('Dropoff:', dropoff);

        
        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
            controls: {
                instructions: false,
                inputs: false,
                distance: false, // Add this line to include the distance
            },
            interactive: false,
        });

        console.log('Adding directions control...');
        map.current.addControl(directions, 'top-right');

        // Set origin and destination
        directions.setOrigin(pickup);
        directions.setDestination(dropoff);

        directions.on('route', (event) => {
            const route = event.route[0]; // Assuming you only have one route
            const distanceMeters = route.distance;
            const durationSeconds = route.duration;
        
            const distanceKilometers = metersToKilometers(distanceMeters);
            const durationMinutes = secondsToMinutes(durationSeconds);
        
            console.log('Distance:', distanceKilometers + ' km');
            console.log('Duration:', durationMinutes + ' min');
        
            
            storeDistance(distanceKilometers);
            storeDuration(durationMinutes);
        });
    };

    // Function to convert meters to kilometers
    function metersToKilometers(meters) {
        return (meters / 1000).toFixed(1); // Keep one decimal place
    }

    // Function to convert seconds to minutes
    function secondsToMinutes(seconds) {
        return Math.round(seconds / 60); // Round to nearest minute
    }

    const addMarkers = () => {
        // Create Marker instances and add them to the map
        const marker1 = new mapboxgl.Marker({ draggable: true, color: 'cyan' })
            .setLngLat(pickup)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3 style="color: blue;">From</h3>`))
            .addTo(map.current);

        const marker2 = new mapboxgl.Marker({ draggable: true, color: 'orange' })
            .setLngLat(dropoff)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3 style="color: blue;">To</h3>`))
            .addTo(map.current);

        // Add dragend event listeners to update marker positions
        marker1.on('dragend', () => {
            const lngLat = marker1.getLngLat();
            setPickup([lngLat.lng, lngLat.lat]); // Update pickup state
            updateMapBounds(); // Update map bounds whenever pickup marker is dragged
        });

        marker2.on('dragend', () => {
            const lngLat = marker2.getLngLat();
            setDropoff([lngLat.lng, lngLat.lat]); // Update dropoff state
            updateMapBounds(); // Update map bounds whenever dropoff marker is dragged
        });

        // Function to update map bounds based on current pickup and dropoff locations
        const updateMapBounds = () => {
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend(pickup);
            bounds.extend(dropoff);

            // Fit map to the bounding box containing both pickup and dropoff locations
            map.current.fitBounds(bounds, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Adjust padding as needed
                maxZoom: 11, // Adjust max zoom level as desired
                essential: true // This ensures smooth animation
            });
        };

        // Initially center and fit map to both pickup and dropoff locations
        updateMapBounds();
        // getRoute();
    };


    const handleMapStyleChange = (style) => {
        setMapStyle(style);
    };

    return (
        <div className="h-screen w-screen">
            <div ref={mapContainer} className="h-full w-full" />

            <div className="bg-blue-700 bg-opacity-90 text-white p-3 font-mono z-10 absolute top-4 left-4 rounded-md">
                <div className="mt-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2" onClick={() => handleMapStyleChange('mapbox://styles/1barry123/clvi2k5vd00an01ob3n2e2qmu')}>
                        Street
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2" onClick={() => handleMapStyleChange('mapbox://styles/1barry123/clvi1sfb2013x01q1bgcx7zy7')}>
                        Satellite
                    </button>
                </div>
            </div>

            {/* Display marker positions */}
            <div className="bg-white p-4 fixed bottom-4 left-4 rounded-md">
                <h3 className="font-semibold mb-2">Marker Positions</h3>
                <p>Pickup: {pickup}</p>
                <p>Drop off: {dropoff}</p>
                <p>Distance: {distance} km</p>
                <p>Duration: {duration} min</p>
            </div>
        </div>
    );
}

export default App;