
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus, Compass, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { toast } from "@/components/ui/use-toast";

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
    mapInitError?: boolean;
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
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadRetry, setLoadRetry] = useState(0);

  // Initialize the map
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if we've previously seen an error with Google Maps
        if (window.mapInitError) {
          console.log("Using fallback map due to previous initialization error");
          setMapError("Using fallback map due to previous initialization error");
          return;
        }

        if (!window.google && !document.getElementById('google-maps-script')) {
          const script = document.createElement('script');
          script.id = 'google-maps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyClawIm_JLwUOmt_W7S3wbf2CnAKdj3orI&libraries=places&callback=initMap`;
          script.async = true;
          script.defer = true;
          
          // Track loading errors
          script.onerror = () => {
            console.error("Error loading Google Maps script");
            setMapError("Failed to load Google Maps API");
            window.mapInitError = true;
          };
          
          window.initMap = () => {
            setIsLoaded(true);
          };
          
          document.body.appendChild(script);
          
          // Set a timeout to detect if Google Maps doesn't load in reasonable time
          const timeoutId = setTimeout(() => {
            if (!window.google?.maps) {
              console.error("Google Maps timeout - using fallback");
              setMapError("Google Maps failed to load in time");
              window.mapInitError = true;
            }
          }, 5000);
          
          return () => clearTimeout(timeoutId);
        } else if (window.google) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Error initializing map");
        window.mapInitError = true;
      }
    };
    
    loadGoogleMaps();
    
    return () => {
      window.initMap = () => {};
    };
  }, [loadRetry]);

  // Create the map instance once Google Maps is loaded
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
          
          // Add search box functionality if interactive
          if (interactive && searchInputRef.current) {
            try {
              if (window.google.maps.places) {
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
              console.error("Error initializing search box:", error);
              setMapError("Search functionality limited");
            }
          }
          
          // Add error listener
          mapInstance.addListener('error', (e: any) => {
            console.error("Map error:", e);
            setMapError("Error displaying the map");
          });
        } catch (error) {
          console.error("Error creating map instance:", error);
          setMapError("Failed to create map");
          window.mapInitError = true;
        }
      } else {
        setMapError("Google Maps API not available");
        window.mapInitError = true;
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError("Error initializing Google Maps");
      window.mapInitError = true;
    }
  }, [isLoaded, center, zoom, interactive, onSearch, mapError]);

  // Update markers whenever the markers prop changes
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

  // Update map center when center prop changes
  useEffect(() => {
    if (map && isLoaded && window.google && !mapError) {
      map.setCenter(center);
    }
  }, [map, center, isLoaded, mapError]);

  // Handle map errors from Google API
  useEffect(() => {
    const handleMapErrors = (event: ErrorEvent) => {
      if (event.error && event.error.toString().includes("Google Maps")) {
        console.error("Google Maps error detected:", event);
        setMapError("Google Maps API error. Please check your API key configuration.");
        window.mapInitError = true;
      }
    };

    window.addEventListener('error', handleMapErrors);
    
    return () => {
      window.removeEventListener('error', handleMapErrors);
    };
  }, []);

  const handleRetryMap = () => {
    // Clear error state and retry loading
    setMapError(null);
    window.mapInitError = false;
    setLoadRetry(prev => prev + 1);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation && map && !mapError) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(16);
          
          // If we have a search handler, let's search for parking in this area
          if (onSearch) {
            onSearch("parking near me");
            toast({
              title: "Location Found",
              description: "Showing parking spots near your current location",
            });
          }
        },
        () => {
          console.error("Error: The Geolocation service failed.");
          toast({
            title: "Location Error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
        }
      );
    } else if (onSearch) {
      onSearch("parking near me");
      toast({
        title: "Searching",
        description: "Showing parking spots near you",
      });
    }
  };

  const handleZoomIn = () => {
    if (map && !mapError) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    if (map && !mapError) map.setZoom(map.getZoom() - 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  // If there's a map error, display fallback UI with a static map image
  if (mapError) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className} flex flex-col items-center justify-center bg-gray-100 p-6`}>
        <div className="w-full h-full absolute">
          <img 
            src="/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"
            alt="Static map"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center p-4 bg-white/80 rounded-lg shadow-md">
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Display Limited</h3>
          <p className="text-sm text-gray-600 mb-4">
            The interactive map is currently unavailable. We're using a static map view.
          </p>
          <Button 
            onClick={handleRetryMap}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            Retry Loading Map
          </Button>
          
          {onSearch && (
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to park?"
                  className="w-full h-12 pl-10 pr-4 rounded-full border border-gray-300 text-sm"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 text-xs bg-park-yellow text-black rounded-full"
                >
                  Search
                </Button>
              </div>
            </form>
          )}
        </div>
        
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
  }

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
      
      {/* Search box - hidden because we're using the one in FindParking.tsx */}
      {interactive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md hidden">
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
