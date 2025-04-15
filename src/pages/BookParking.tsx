
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/context/ParkingContext";

const BookParking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingLotById, calculateParkingCost } = useParking();
  const parkingLot = getParkingLotById(id || "");
  
  const [selectedDuration, setSelectedDuration] = useState(1); // Default 1 hour
  const durations = [1, 2, 3, 4, 5, 8, 24]; // Hours
  
  if (!parkingLot) {
    navigate("/find-parking");
    return null;
  }
  
  const estimatedCost = calculateParkingCost(parkingLot.id, selectedDuration);
  
  const handleBooking = () => {
    const reservationData = {
      parkingLotId: parkingLot.id,
      parkingLotName: parkingLot.name,
      spotNumber: `F2-${Math.floor(Math.random() * 10) + 1}`,
      startTime: new Date(),
      endTime: new Date(Date.now() + selectedDuration * 60 * 60 * 1000),
      duration: selectedDuration,
      cost: estimatedCost,
    };
    
    // Navigate to the payment page with reservation details
    navigate(`/payment/${parkingLot.id}`, { state: { reservation: reservationData } });
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white p-4 flex items-center border-b">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Select Parking Duration</h1>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <div className="bg-park-yellow/10 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-1">{parkingLot.name}</h2>
          <p className="text-sm text-gray-600">{parkingLot.address}</p>
          <p className="text-sm mt-2">
            <span className="font-medium">Operating Hours:</span> {parkingLot.operatingHours || "24/7"}
          </p>
        </div>
        
        {/* Duration Selection */}
        <h2 className="text-lg font-bold mb-3">Select Parking Duration</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          {durations.map((hours) => (
            <Button
              key={hours}
              variant={selectedDuration === hours ? "default" : "outline"}
              className={`rounded-lg flex-1 min-w-[70px] ${
                selectedDuration === hours ? "bg-park-yellow text-black" : ""
              }`}
              onClick={() => setSelectedDuration(hours)}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">{hours}</span>
                <span className="text-xs">hr{hours > 1 ? "s" : ""}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Cost Estimation */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-gray-500" />
              <span>Duration</span>
            </div>
            <span className="font-bold">
              {selectedDuration} hour{selectedDuration > 1 ? "s" : ""}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span>Rate</span>
            <span>₹{parkingLot.hourlyRate} / hour</span>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Cost</span>
              <span className="font-bold text-lg">₹{estimatedCost}</span>
            </div>
          </div>
        </div>
        
        {/* Vehicle Selection Placeholder (could be expanded) */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="font-bold mb-3">Vehicle Details</h3>
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex-grow">
              <p className="text-sm font-medium">Maruti Swift</p>
              <p className="text-xs text-gray-500">GJ 02 DG 6578</p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </div>
        
        {/* Book Button */}
        <Button 
          className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
          onClick={handleBooking}
        >
          Book Spot (₹{estimatedCost})
        </Button>
      </div>
    </div>
  );
};

export default BookParking;
