import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/context/ParkingContext";
import VehicleDetailsForm from "@/components/parking/VehicleDetailsForm";
import { toast } from "@/components/ui/sonner";

const BookParking = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getParkingLotById, calculateParkingCost, selectedSlot, setSelectedSlot } = useParking();
  const parkingLot = getParkingLotById(id || "");
  
  const preSelectedDuration = searchParams.get('duration') 
    ? parseInt(searchParams.get('duration') || "1") 
    : 1;
    
  const slotId = searchParams.get('slotId');
  
  const [selectedDuration, setSelectedDuration] = useState(preSelectedDuration); // Default or from URL
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const durations = [1, 2, 3, 4, 5, 8, 24]; // Hours
  
  // Find and set the selected slot if slotId is provided
  useEffect(() => {
    if (parkingLot && parkingLot.slots && slotId && (!selectedSlot || selectedSlot.id !== slotId)) {
      const slot = parkingLot.slots.find(s => s.id === slotId);
      if (slot) {
        console.log("Setting selected slot from URL parameter:", slot);
        setSelectedSlot(slot);
      }
    }
  }, [parkingLot, slotId, selectedSlot, setSelectedSlot]);
  
  // If there's no parking lot or no selected slot, redirect back
  useEffect(() => {
    if (!parkingLot) {
      navigate("/find-parking");
      toast("Parking lot not found");
      return;
    }
    
    if (!selectedSlot && !slotId) {
      navigate(`/parking/${id}`);
      toast("Please select a parking slot first");
    }
  }, [parkingLot, selectedSlot, slotId, id, navigate]);
  
  if (!parkingLot) {
    return null;
  }
  
  const estimatedCost = calculateParkingCost(parkingLot.id, selectedDuration);
  
  const handleContinue = () => {
    setShowVehicleForm(true);
  };
  
  const handleVehicleDetailSubmit = () => {
    // This function is called when the vehicle details form is submitted
    // The form itself handles saving the vehicle details to the context
    
    const reservationData = {
      parkingLotId: parkingLot.id,
      parkingLotName: parkingLot.name,
      slotId: selectedSlot?.id,
      slotName: selectedSlot?.name,
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
        <h1 className="text-xl font-bold">
          {showVehicleForm ? "Vehicle Details" : "Select Parking Duration"}
        </h1>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {!showVehicleForm ? (
          <>
            <div className="bg-park-yellow/10 p-4 rounded-lg mb-6">
              <h2 className="font-bold mb-1">{parkingLot.name}</h2>
              <p className="text-sm text-gray-600">{parkingLot.address}</p>
              {selectedSlot && (
                <p className="text-sm mt-2 font-medium">
                  Selected Slot: {selectedSlot.name} ({selectedSlot.type})
                </p>
              )}
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
            
            {/* Continue Button */}
            <Button 
              className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </>
        ) : (
          <VehicleDetailsForm onSubmit={handleVehicleDetailSubmit} />
        )}
      </div>
    </div>
  );
};

export default BookParking;
