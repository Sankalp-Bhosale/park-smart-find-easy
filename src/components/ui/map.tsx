
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Search } from "lucide-react";
import { Button } from "./button";

// Mock Google Maps integration
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
}

const Map: React.FC<MapProps> = ({
  center = { lat: 19.0760, lng: 72.8777 },
  zoom = 14,
  markers = [],
  onMarkerClick,
  className = "",
  interactive = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const handleMarkerClick = (id: string) => {
    setSelectedMarkerId(id);
    if (onMarkerClick) onMarkerClick(id);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-200 ${className}`}>
      {/* Mock Map - In a real app, this would be a Google Maps component */}
      <div ref={mapRef} className="w-full h-full bg-[#e8ecef] relative">
        {/* Mock markers */}
        {markers.map((marker) => (
          <div 
            key={marker.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 
                      ${selectedMarkerId === marker.id ? 'scale-125' : ''}`}
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
                <div className="bg-white p-2 rounded-md shadow-md mt-1 text-xs font-medium">
                  {marker.title}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Map controls */}
        {interactive && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="outline" className="bg-white shadow-md h-10 w-10">
              <Navigation size={20} />
            </Button>
            <Button size="icon" variant="outline" className="bg-white shadow-md h-10 w-10">
              +
            </Button>
            <Button size="icon" variant="outline" className="bg-white shadow-md h-10 w-10">
              -
            </Button>
          </div>
        )}
        
        {/* Search box */}
        {interactive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Where do you want to park?"
                className="w-full h-12 pl-10 pr-4 rounded-full shadow-md border-none bg-white text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Map };
