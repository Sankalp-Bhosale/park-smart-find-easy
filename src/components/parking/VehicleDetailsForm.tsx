
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { useParking } from "@/context/ParkingContext";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleDetailsFormProps {
  onSubmit: () => void;
}

const VehicleDetailsForm = ({ onSubmit }: VehicleDetailsFormProps) => {
  const { setTemporaryVehicleDetails } = useParking();
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("sedan");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!model.trim() || !licensePlate.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all vehicle details",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Save the vehicle details in the context for later use
    setTemporaryVehicleDetails({
      model: model.trim(),
      licensePlate: licensePlate.trim(),
      type: vehicleType
    });
    
    // Simulate a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 500);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Car size={20} className="text-gray-600" />
        <h3 className="font-bold text-lg">Vehicle Details</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="carModel">Car Model</Label>
          <Input
            id="carModel"
            placeholder="e.g. Maruti Swift"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate Number</Label>
          <Input
            id="licensePlate"
            placeholder="e.g. MH 01 AB 1234"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Continue to Payment"}
        </Button>
      </form>
    </div>
  );
};

export default VehicleDetailsForm;
