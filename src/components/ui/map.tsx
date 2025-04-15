
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus, Compass } from "lucide-react";
import { Button } from "./button";

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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
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
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyClawIm_JLwUOmt_W7S3wbf2CnAKdj3orI&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setIsLoaded(true);
      };
      
      document.body.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }
    
    return () => {
      window.initMap = () => {};
    };
  }, []);

  // Create the map instance once Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;
    
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            "featureType": "poi.business",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "transit",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
          }
        ]
      });
      
      setMap(mapInstance);
      
      // Add search box functionality if interactive
      if (interactive && searchInputRef.current) {
        const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
        mapInstance.controls[window.google.maps.ControlPosition.TOP_CENTER].push(searchInputRef.current);
        
        mapInstance.addListener('bounds_changed', () => {
          searchBox.setBounds(mapInstance.getBounds());
        });
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;
          
          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;
          
          // If we have a search handler, call it with the place name
          if (onSearch) {
            onSearch(place.name);
          }
          
          // Center map on the selected place
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(16);
        });
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
    }
  }, [isLoaded, center, zoom, interactive, onSearch]);

  // Update markers whenever the markers prop changes
  useEffect(() => {
    if (!map || !isLoaded) return;
    
    // Clear existing markers
    googleMarkers.forEach(marker => marker.setMap(null));
    
    // Create new markers
    const newMarkers = markers.map(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: map,
        title: markerData.title,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: selectedMarkerId === markerData.id ? '#0ABAB5' : '#6B46C1',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10,
        }
      });
      
      // Create an info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div class="p-2 text-sm font-medium">${markerData.title}</div>`
      });
      
      // Add click listener
      marker.addListener('click', () => {
        if (selectedMarkerId === markerData.id) {
          setSelectedMarkerId(null);
          infoWindow.close();
        } else {
          setSelectedMarkerId(markerData.id);
          infoWindow.open(map, marker);
          if (onMarkerClick) onMarkerClick(markerData.id);
        }
      });
      
      // Show info window if this marker is selected
      if (selectedMarkerId === markerData.id) {
        infoWindow.open(map, marker);
      }
      
      return marker;
    });
    
    setGoogleMarkers(newMarkers);
  }, [map, markers, selectedMarkerId, isLoaded, onMarkerClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && isLoaded) {
      map.setCenter(center);
    }
  }, [map, center, isLoaded]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(16);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (map) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom(map.getZoom() - 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gray-200"
      />
      
      {/* Map controls */}
      {interactive && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white shadow-md h-10 w-10"
            onClick={handleCurrentLocation}
          >
            <Compass size={20} />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white shadow-md h-10 w-10"
            onClick={handleZoomIn}
          >
            <Plus size={20} />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white shadow-md h-10 w-10"
            onClick={handleZoomOut}
          >
            <Minus size={20} />
          </Button>
        </div>
      )}
      
      {/* Search box */}
      {interactive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where do you want to park?"
              className="w-full h-12 pl-10 pr-4 rounded-full shadow-md border-none bg-white text-sm"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 text-xs bg-park-yellow text-black rounded-full"
            >
              Search
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export { Map };
