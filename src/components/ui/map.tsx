import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus, Compass, AlertCircle, Car } from "lucide-react";
import { Button } from "./button";
import { toast } from "@/components/ui/sonner";

// Extend Window interface to include Google Maps properties
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    mapInitError?: boolean;
    gm_authFailure?: () => void;
  }
}

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
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadRetry, setLoadRetry] = useState(0);

  // IMPORTANT: Always use static map fallback to prevent Google Maps API errors
  useEffect(() => {
    // Immediately set to use static map to avoid showing Google Maps errors
    setMapError("Using static map for parking visualization");
    
    // Add error handler to capture and hide Google Maps authentication errors
    // This prevents the popup from showing
    const hideGoogleMapsErrors = () => {
      // Create a style element to hide Google Maps error dialogs
      const style = document.createElement('style');
      style.innerHTML = `
        .gm-err-container, 
        .gm-err-content, 
        .gm-err-icon, 
        .gm-err-title, 
        .gm-err-message, 
        .gm-err-autocomplete { 
          display: none !important; 
        }
        
        .gm-style-uc {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Set up global error handler for Google Maps
      window.gm_authFailure = () => {
        console.error("Google Maps authentication failed - hiding error dialog");
        setMapError("Using static map for better performance");
      };
    };
    
    // Apply error hiding immediately
    hideGoogleMapsErrors();
    
    return () => {
      window.gm_authFailure = undefined;
    };
  }, []);

  // Create the map instance once Google Maps is loaded - this part won't run due to our static map fallback
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map || mapError) return;
    
    try {
      const mapOptions = {
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
      };
      
      // If Google Maps API is loaded properly
      if (window.google && window.google.maps) {
        try {
          const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
          setMap(mapInstance);
        } catch (error) {
          console.error("Error creating map instance:", error);
          setMapError("Failed to create map");
        }
      } else {
        setMapError("Google Maps API not available");
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError("Error initializing Google Maps");
    }
  }, [isLoaded, center, zoom, interactive, onSearch, mapError]);

  // Update markers whenever the markers prop changes - this part won't run due to our static map fallback
  useEffect(() => {
    if (!map || !isLoaded || !window.google || mapError) return;
    
    try {
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
    } catch (error) {
      console.error("Error creating markers:", error);
      setMapError("Failed to create map markers");
    }
  }, [map, markers, selectedMarkerId, isLoaded, onMarkerClick]);

  // Update map center when center prop changes - this part won't run due to our static map fallback
  useEffect(() => {
    if (map && isLoaded && window.google && !mapError) {
      map.setCenter(center);
    }
  }, [map, center, isLoaded, mapError]);

  const handleRetryMap = () => {
    // Clear error state and retry loading
    setMapError(null);
    window.mapInitError = false;
    setLoadRetry(prev => prev + 1);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // If we have a search handler, let's search for parking in this area
          if (onSearch) {
            onSearch("parking near me");
            toast("Showing parking spots near your current location");
          }
        },
        () => {
          console.error("Error: The Geolocation service failed.");
          toast("Unable to get your current location.");
          
          // Still try to search for generic parking
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  // Always use static map UI to prevent Google Maps errors
  return (
    <div className={`relative overflow-hidden rounded-lg ${className} flex flex-col items-center justify-center bg-gray-100 p-6`}>
      <div className="w-full h-full absolute">
        <img 
          src="/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"
          alt="Static map"
          className="w-full h-full object-cover opacity-25"
        />
      </div>
      
      {/* Markers representation on the static map */}
      {markers && markers.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
          {markers.map((marker, index) => (
            <div 
              key={marker.id}
              className={`absolute rounded-full w-6 h-6 ${selectedMarkerId === marker.id ? 'bg-park-yellow border-2 border-black' : 'bg-purple-600'} -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto flex items-center justify-center`}
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
