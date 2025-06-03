
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search, Plus, Minus, Compass, AlertCircle, Car } from "lucide-react";
import { Button } from "./button";
import { toast } from "@/components/ui/sonner";

// Google Maps integration
interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    onClick?: () => void;
  }>;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
  interactive?: boolean;
  onSearch?: (query: string) => void;
}

const Map: React.FC<MapProps> = ({
  center = { lat: 19.0760, lng: 72.8777 },
  zoom = 14,
  markers = [],
  onMarkerClick,
  className = "",
  interactive = true,
  onSearch,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Initialize Mapbox
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control to track user location
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      
      map.current.addControl(geolocate, 'top-right');

      map.current.on('load', () => {
        setIsLoaded(true);
        console.log('Mapbox map loaded successfully');
      });

      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      toast("Error loading map. Please check your Mapbox token.");
    }
  }, [mapboxToken, center.lat, center.lng, zoom]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        background-color: #9333ea;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      
      const icon = document.createElement('div');
      icon.innerHTML = '📍';
      icon.style.fontSize = '16px';
      el.appendChild(icon);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.position.lng, markerData.position.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${markerData.title}</h3>`))
        .addTo(map.current!);

      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData.id);
        }
      });

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded, onMarkerClick]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          if (map.current) {
            map.current.flyTo({
              center: [pos.lng, pos.lat],
              zoom: 15
            });
          }
          
          if (onSearch) {
            onSearch("parking near me");
            toast("Showing parking spots near your current location");
          }
        },
        () => {
          console.error("Error: The Geolocation service failed.");
          toast("Unable to get your current location.");
          
          if (onSearch) {
            onSearch("parking");
          }
        }
      );
    } else if (onSearch) {
      onSearch("parking");
      toast("Showing parking spots near you");
    }
  };

  if (showTokenInput && !mapboxToken) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className} flex flex-col items-center justify-center bg-gray-100 p-6`}>
        <div className="text-center max-w-md">
          <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Setup Real-time Map</h3>
          <p className="text-sm text-gray-600 mb-4">
            To show real-time maps, please enter your Mapbox public token. 
            Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a>
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter your Mapbox public token (pk.xxx...)"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setMapboxToken(mapboxToken)}
                disabled={!mapboxToken}
                className="flex-1"
              >
                Load Map
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowTokenInput(false)}
                className="flex-1"
              >
                Use Static Map
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    // Fallback to static map
    return (
      <div className={`relative overflow-hidden rounded-lg ${className} flex flex-col items-center justify-center bg-gray-100 p-6`}>
        <div className="w-full h-full absolute">
          <img 
            src="/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"
            alt="Static map"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        {/* Markers representation on the static map */}
        {markers && markers.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            {markers.map((marker, index) => (
              <div 
                key={marker.id}
                className="absolute rounded-full w-6 h-6 bg-purple-600 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto flex items-center justify-center"
                style={{
                  top: `${(Math.random() * 60) + 20}%`,
                  left: `${(Math.random() * 60) + 20}%`,
                }}
                onClick={() => onMarkerClick && onMarkerClick(marker.id)}
              >
                <MapPin size={16} className="text-white" />
              </div>
            ))}
          </div>
        )}
        
        {interactive && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white shadow-md"
              onClick={() => setShowTokenInput(true)}
            >
              Enable Real Map
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {interactive && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            variant="outline" 
            className="bg-white shadow-md"
            onClick={handleCurrentLocation}
          >
            <Compass size={18} className="mr-2" />
            My Location
          </Button>
        </div>
      )}
      
      {markers && markers.length > 0 && (
        <div className="absolute bottom-20 left-4 bg-white/80 p-2 rounded-lg shadow-md">
          <p className="font-medium text-sm">Found {markers.length} parking spots</p>
        </div>
      )}
    </div>
  );
};

export { Map };
