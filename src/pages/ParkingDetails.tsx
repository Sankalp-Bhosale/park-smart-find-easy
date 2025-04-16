
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, Car, Star, Info, Share2, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/context/ParkingContext";
import { Map } from "@/components/ui/map";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ParkingSlotsView from "@/components/parking/ParkingSlotsView";

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingLotById, calculateParkingCost, selectedSlot } = useParking();
  const [parkingLot, setParkingLot] = useState(getParkingLotById(id || ""));
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!parkingLot) {
      navigate("/find-parking");
      toast({
        title: "Error",
        description: "Parking lot not found",
        variant: "destructive",
      });
    } else {
      // Calculate initial cost
      setTotalCost(calculateParkingCost(parkingLot.id, selectedDuration));
    }
  }, [parkingLot, navigate]);

  useEffect(() => {
    if (parkingLot) {
      setTotalCost(calculateParkingCost(parkingLot.id, selectedDuration));
    }
  }, [selectedDuration, parkingLot]);

  if (!parkingLot) {
    return null;
  }

  const handleShareClick = () => {
    toast({
      title: "Share",
      description: `Sharing link to ${parkingLot.name}`,
    });
  };

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? 
        `${parkingLot.name} has been removed from your favorites` :
        `${parkingLot.name} has been added to your favorites`,
    });
  };

  const durations = [1, 2, 3, 4];

  const handleBookNow = () => {
    if (!selectedSlot) {
      setActiveTab("slots");
      toast({
        title: "Select a slot",
        description: "Please select a parking slot before proceeding"
      });
      return;
    }
    
    navigate(`/book/${parkingLot.id}?duration=${selectedDuration}&slotId=${selectedSlot.id}`);
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 z-10 bg-white shadow-md rounded-full h-10 w-10"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={20} />
      </Button>
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-md rounded-full h-10 w-10"
          onClick={handleShareClick}
        >
          <Share2 size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`${isFavorite ? 'bg-pink-50' : 'bg-white'} shadow-md rounded-full h-10 w-10`}
          onClick={handleFavoriteClick}
        >
          <Heart 
            size={18} 
            className={isFavorite ? 'text-red-500 fill-red-500' : ''}
          />
        </Button>
      </div>

      {/* Map Preview */}
      <div className="h-64 w-full">
        <Map
          className="h-full"
          center={parkingLot.location}
          zoom={16}
          interactive={false}
          markers={[
            {
              id: parkingLot.id,
              position: parkingLot.location,
              title: parkingLot.name,
            },
          ]}
        />
      </div>

      {/* Details Card */}
      <div className="flex-grow bg-white rounded-t-3xl -mt-8 p-6 z-10 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{parkingLot.name}</h1>
          
          <div className="flex items-center gap-1 text-gray-500 mb-2">
            <MapPin size={16} />
            <span className="text-sm">{parkingLot.address}</span>
          </div>
          
          {parkingLot.rating && (
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{parkingLot.rating}</span>
              <span className="text-sm text-gray-500">• {parkingLot.totalSpots} spots</span>
            </div>
          )}
        </div>

        {/* Tabs for Details */}
        <Tabs 
          defaultValue="details" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Address</h3>
              <p className="text-sm text-gray-600 mb-2">{parkingLot.address}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Operation</h3>
              <p className="text-sm text-gray-600">
                {parkingLot.operatingHours || "Open Now: 10:00 AM - 11:30 PM"}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Availability</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-green-600">{parkingLot.availableSpots}</span> spots available out of {parkingLot.totalSpots}
              </p>
            </div>
            
            {parkingLot.amenities && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {parkingLot.amenities.map((amenity, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg px-3 py-1 text-xs border border-gray-200"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="photos">
            <div className="grid grid-cols-2 gap-2">
              {parkingLot.images && parkingLot.images.length > 0 ? (
                parkingLot.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${parkingLot.name} view ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-gray-400">
                  No photos available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="slots">
            <ParkingSlotsView parkingLotId={parkingLot.id} />
          </TabsContent>
        </Tabs>

        {/* Selected Slot Info (if any) */}
        {selectedSlot && (
          <div className="mb-6 p-4 border border-park-yellow rounded-lg bg-park-yellow/10">
            <h3 className="font-medium mb-2">Selected Slot</h3>
            <div className="flex justify-between">
              <p className="text-lg font-bold">Slot {selectedSlot.name}</p>
              <p className="text-sm">
                {selectedSlot.type.charAt(0).toUpperCase() + selectedSlot.type.slice(1)} spot
              </p>
            </div>
          </div>
        )}

        {/* Select Parking Duration */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Select Parking Duration</h2>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((hours) => (
              <button
                key={hours}
                onClick={() => setSelectedDuration(hours)}
                className={`py-3 rounded-lg text-center ${
                  selectedDuration === hours
                    ? "bg-park-yellow text-black font-medium"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {hours} hr
              </button>
            ))}
          </div>
        </div>

        {/* Price Information */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold">₹{totalCost}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar size={16} />
              <span>{selectedDuration} {selectedDuration === 1 ? 'hour' : 'hours'}</span>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button 
          className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
          onClick={handleBookNow}
        >
          {selectedSlot ? `Book Slot ${selectedSlot.name}` : `Book Now`}
        </Button>
      </div>
    </div>
  );
};

export default ParkingDetails;
