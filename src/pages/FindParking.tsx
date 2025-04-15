
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Search, MapPin, Filter, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParking } from "@/context/ParkingContext";
import { Map } from "@/components/ui/map";
import BottomNav from "@/components/navigation/BottomNav";

interface LocationState {
  query?: string;
}

const FindParking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nearbyParkingLots } = useParking();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"list" | "map">("map");
  const [selectedParkingLot, setSelectedParkingLot] = useState<string | null>(null);
  
  // Get query from location state if available
  const locationState = location.state as LocationState | undefined;
  
  useEffect(() => {
    if (locationState?.query) {
      setSearchQuery(locationState.query);
    }
  }, [locationState]);

  // Filter parking lots based on search query
  const filteredParkingLots = searchQuery
    ? nearbyParkingLots.filter(lot => 
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nearbyParkingLots;

  const handleParkingLotClick = (id: string) => {
    navigate(`/parking/${id}`);
  };

  const handleMarkerClick = (id: string) => {
    setSelectedParkingLot(id);
    setSelectedTab("map");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-20 relative">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={24} />
          </Button>
          
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for parking"
              className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200 text-sm"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="ml-2">
            <Filter size={20} />
          </Button>
        </div>
        
        <Tabs
          defaultValue="map"
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as "list" | "map")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Map View */}
      {selectedTab === "map" && (
        <div className="h-[calc(100vh-180px)]">
          <Map
            className="h-full w-full"
            markers={filteredParkingLots.map(lot => ({
              id: lot.id,
              position: lot.location,
              title: lot.name,
            }))}
            onMarkerClick={handleMarkerClick}
          />
          
          {/* Selected Parking Lot Card */}
          {selectedParkingLot && (
            <div className="absolute bottom-20 left-0 right-0 p-4">
              {filteredParkingLots
                .filter(lot => lot.id === selectedParkingLot)
                .map(lot => (
                  <Card 
                    key={lot.id}
                    className="p-4 shadow-lg rounded-xl border-none cursor-pointer"
                    onClick={() => handleParkingLotClick(lot.id)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{lot.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 gap-1 mt-1">
                          <MapPin size={14} />
                          <span>{lot.address}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-bold">₹{lot.hourlyRate}/hr</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="font-bold">{lot.distance} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Available</p>
                            <p className="font-bold">{lot.availableSpots} spots</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="bg-park-yellow text-black h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/book/${lot.id}`);
                        }}
                      >
                        Book
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}
      
      {/* List View */}
      {selectedTab === "list" && (
        <div className="p-4">
          {filteredParkingLots.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredParkingLots.map((lot) => (
                <Card
                  key={lot.id}
                  className="overflow-hidden border-none shadow-md rounded-lg cursor-pointer"
                  onClick={() => handleParkingLotClick(lot.id)}
                >
                  <div className="flex h-28">
                    <div className="w-28 h-full bg-gray-200 overflow-hidden">
                      <img
                        src={lot.images?.[0] || "/placeholder.svg"}
                        alt={lot.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow p-3">
                      <h3 className="font-bold">{lot.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{lot.address}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500">From</p>
                          <p className="font-bold">₹{lot.hourlyRate}/hr</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <MapPin size={12} />
                          <span>{lot.distance} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Car size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No parking spots found</p>
              <p className="text-sm text-gray-400">Try a different search</p>
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default FindParking;
