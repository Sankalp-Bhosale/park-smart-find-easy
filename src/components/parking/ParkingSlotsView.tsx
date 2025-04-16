
import { useParking } from "@/context/ParkingContext";
import { useState } from "react";
import { Car, Users, Battery, Accessibility } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ParkingSlotsViewProps {
  parkingLotId: string;
}

const ParkingSlotsView = ({ parkingLotId }: ParkingSlotsViewProps) => {
  const { getParkingLotById, setSelectedSlot } = useParking();
  const parkingLot = getParkingLotById(parkingLotId);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  if (!parkingLot || !parkingLot.slots) {
    return (
      <div className="py-6 text-center">
        <p>No parking slots information available.</p>
      </div>
    );
  }

  const slotTypes = [
    { id: "standard", label: "Standard", icon: <Car size={16} /> },
    { id: "disabled", label: "Disabled", icon: <Accessibility size={16} /> },
    { id: "electric", label: "Electric", icon: <Battery size={16} /> },
    { id: "family", label: "Family", icon: <Users size={16} /> },
  ];

  const filteredSlots = selectedType 
    ? parkingLot.slots.filter(slot => slot.type === selectedType)
    : parkingLot.slots;

  const handleSlotClick = (slot: any) => {
    if (!slot.isAvailable) {
      toast({
        title: "Slot not available",
        description: "Please select an available parking slot",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedSlot(slot);
    toast({
      title: "Slot selected",
      description: `You've selected parking slot ${slot.name}`,
    });
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-3">Select a Parking Slot</h3>
      
      {/* Slot type filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedType(null)}
          className={`px-3 py-1 text-sm rounded-full 
            ${!selectedType ? 'bg-park-yellow text-black' : 'bg-gray-100 text-gray-700'}`}
        >
          All Slots
        </button>
        
        {slotTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3 py-1 text-sm rounded-full flex items-center gap-1
              ${selectedType === type.id ? 'bg-park-yellow text-black' : 'bg-gray-100 text-gray-700'}`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
          <span>Occupied</span>
        </div>
      </div>
      
      {/* Parking layout */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="w-full py-2 bg-gray-300 mb-6 text-center font-bold text-sm">
          ENTRANCE
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {filteredSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className={`aspect-square rounded flex flex-col items-center justify-center text-white
                ${slot.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 cursor-not-allowed'}`}
            >
              <span className="text-xs">{slot.name}</span>
              {slot.type === "disabled" && <Accessibility size={12} />}
              {slot.type === "electric" && <Battery size={12} />}
              {slot.type === "family" && <Users size={12} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkingSlotsView;
