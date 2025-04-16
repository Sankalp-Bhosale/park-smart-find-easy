
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, Bell, Car, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useParking } from "@/context/ParkingContext";
import BottomNav from "@/components/navigation/BottomNav";
import { toast } from "@/components/ui/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { nearbyParkingLots, reservations, favoriteLocations, searchParkingLots } = useParking();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch nearby parking when the component mounts
  useEffect(() => {
    const fetchNearby = async () => {
      setIsLoading(true);
      try {
        await searchParkingLots("parking near me");
      } catch (error) {
        console.error("Error fetching nearby parking:", error);
        toast({
          title: "Error",
          description: "Failed to load nearby parking lots",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearby();
  }, [searchParkingLots]);

  const activeReservations = reservations.filter(
    (res) => res.status === "confirmed"
  );

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    navigate("/find-parking", { state: { query: searchQuery } });
  };

  const handleParkingLotClick = (id: string) => {
    navigate(`/parking/${id}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-park-yellow p-6 pb-12 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-black text-sm">Welcome back</p>
            <h1 className="text-lg font-bold text-black">
              {user?.name || "Guest User"}
            </h1>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-black"
            onClick={() => navigate("/profile")}
          >
            <Bell size={24} />
          </Button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where do you want to park?"
            className="w-full h-12 pl-10 pr-4 rounded-full shadow-md border-none"
          />
        </form>
      </div>

      <div className="p-6 -mt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading parking information...</p>
          </div>
        ) : (
          <>
            {/* Active Reservation Card */}
            {activeReservations.length > 0 && (
              <Card className="p-4 mb-6 shadow-md rounded-xl border-none">
                <h2 className="text-lg font-bold mb-2">Active Reservation</h2>
                <div className="flex items-center gap-4">
                  <div className="bg-park-yellow rounded-full p-3">
                    <Car size={24} className="text-black" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{activeReservations[0].parkingLotName}</p>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <Clock size={14} />
                      <span>
                        {formatDate(activeReservations[0].startTime)} - {formatDate(activeReservations[0].endTime)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/confirmation/${activeReservations[0].id}`)} 
                    className="bg-park-yellow text-black"
                  >
                    View
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Locations */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Recent Locations</h2>
              {favoriteLocations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {favoriteLocations.map((location, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex justify-start items-center gap-3 h-12 px-4 border-gray-200"
                      onClick={() => navigate("/find-parking", { state: { query: location } })}
                    >
                      <MapPin size={18} className="text-gray-500" />
                      <span className="truncate">{location}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No recent locations</p>
                  <p className="text-sm">Search for parking to save locations</p>
                </div>
              )}
            </div>

            {/* Nearby Parking */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Nearby Parking</h2>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/find-parking")} 
                  className="text-park-teal"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {nearbyParkingLots.slice(0, 3).map((lot) => (
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
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
