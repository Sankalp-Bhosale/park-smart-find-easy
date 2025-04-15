
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus, Compass } from "lucide-react";
import { Button } from "./button";

// Mock Google Maps integration with improved visuals
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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMarkerClick = (id: string) => {
    setSelectedMarkerId(id);
    if (onMarkerClick) onMarkerClick(id);
  };

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 1, 1));
  };

  const handleCurrentLocation = () => {
    // In a real implementation, this would use the browser's geolocation API
    console.log("Getting current location");
    // Mock updating location
    setTimeout(() => {
      console.log("Location found");
    }, 500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-200 ${className}`}>
      {/* Map background with roads */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-[#e8ecef] relative"
        style={{
          backgroundImage: `url('/lovable-uploads/f2af5d5e-ca7a-4579-b386-7dd4d9fe082d.png')`,
          backgroundSize: `${100 + (currentZoom - zoom) * 10}%`,
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay the interactive elements */}
        <div className="absolute inset-0 bg-transparent">
          {/* Mock markers */}
          {markers.map((marker) => (
            <div 
              key={marker.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-in-out cursor-pointer
                      ${selectedMarkerId === marker.id ? 'scale-125' : 'scale-100'}`}
              style={{ 
                left: `${((marker.position.lng - center.lng) * 100) + 50}%`, 
                top: `${50 - ((marker.position.lat - center.lat) * 100)}%` 
              }}
              onClick={() => handleMarkerClick(marker.id)}
            >
              <div className="flex flex-col items-center">
                <MapPin 
                  size={32} 
                  className={selectedMarkerId === marker.id ? 'text-park-teal fill-park-teal' : 'text-park-purple fill-park-purple'} 
                />
                {selectedMarkerId === marker.id && (
                  <div className="bg-white p-2 rounded-md shadow-md mt-1 text-xs font-medium animate-fade-in">
                    {marker.title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
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
    </div>
  );
};

export { Map };
