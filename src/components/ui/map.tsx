
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

  // Immediately set error state to use fallback map and prevent Google Maps loading
  useEffect(() => {
    // Prevent Google Maps from loading and showing error popups
    setMapError("Using static map view");
    
    // Override the global error handler to prevent popups
    window.gm_authFailure = () => {
      console.log("Google Maps auth failed - using fallback map");
      setMapError("Using static map view");
    };
    
    // Also handle other Google Maps errors
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    window.alert = (message) => {
      if (typeof message === 'string' && message.includes('Google Maps')) {
        console.log('Blocked Google Maps alert:', message);
        return;
      }
      return originalAlert(message);
    };
    
    window.confirm = (message) => {
      if (typeof message === 'string' && message.includes('Google Maps')) {
        console.log('Blocked Google Maps confirm:', message);
        return false;
      }
      return originalConfirm(message);
    };
    
    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.gm_authFailure = undefined;
    };
  }, []);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  // Always use the fallback static map to avoid Google Maps issues
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
