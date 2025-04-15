
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, Car, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/context/ParkingContext";
import { Map } from "@/components/ui/map";

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingLotById } = useParking();
  const [parkingLot, setParkingLot] = useState(getParkingLotById(id || ""));

  useEffect(() => {
    if (!parkingLot) {
      // If parking lot not found, redirect to find parking
      navigate("/find-parking");
    }
  }, [parkingLot, navigate]);

  if (!parkingLot) {
    return null; // Or a loading spinner
  }

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

        {/* Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Details</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-black">Address:</span> {parkingLot.address}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-black">Total Spots:</span> {parkingLot.totalSpots}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-black">Available:</span> {parkingLot.availableSpots} spots
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-black">Operation:</span> {parkingLot.operatingHours || "24/7"}
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Price Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Hourly Rate</p>
              <p className="text-xl font-bold">₹{parkingLot.hourlyRate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Daily Rate</p>
              <p className="text-xl font-bold">₹{parkingLot.dailyRate}</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {parkingLot.amenities && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {parkingLot.amenities.map((amenity, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg px-4 py-2 text-sm"
                >
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button 
          className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
          onClick={() => navigate(`/book/${parkingLot.id}`)}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default ParkingDetails;
