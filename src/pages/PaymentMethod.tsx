
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, CreditCard, Wallet, ParkingMeter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParking } from "@/context/ParkingContext";

interface LocationState {
  reservation: {
    parkingLotId: string;
    parkingLotName: string;
    slotId?: string;
    slotName?: string;
    spotNumber?: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    cost: number;
  };
}

const PaymentMethod = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { createReservation, temporaryVehicleDetails } = useParking();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  
  const locationState = location.state as LocationState | undefined;
  const reservation = locationState?.reservation;
  
  if (!reservation) {
    navigate(`/book/${id}`);
    return null;
  }

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      console.log("Creating reservation with data:", {
        ...reservation,
        paymentMethod: paymentMethod === "parking" ? "pay_at_parking" : paymentMethod,
        status: paymentMethod === "parking" ? "pending_payment" : "confirmed",
        vehicleDetails: temporaryVehicleDetails
      });
      
      // Create reservation with selected payment method
      const createdReservation = await createReservation({
        ...reservation,
        paymentMethod: paymentMethod === "parking" ? "pay_at_parking" : paymentMethod,
        status: paymentMethod === "parking" ? "pending_payment" : "confirmed",
        vehicleDetails: temporaryVehicleDetails ? {
          model: temporaryVehicleDetails.model,
          type: temporaryVehicleDetails.type,
          licensePlate: temporaryVehicleDetails.licensePlate
        } : undefined
      });
      
      console.log("Reservation created successfully:", createdReservation);
      navigate(`/confirmation/${createdReservation.id}`);
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-xl font-bold">Payment Method</h1>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-3">Booking Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Parking Lot</span>
              <span className="font-medium">{reservation.parkingLotName}</span>
            </div>
            {reservation.slotName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Slot</span>
                <span className="font-medium">{reservation.slotName}</span>
              </div>
            )}
            {reservation.spotNumber && !reservation.slotName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Spot</span>
                <span className="font-medium">{reservation.spotNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">{reservation.duration} hour{reservation.duration > 1 ? 's' : ''}</span>
            </div>
            {temporaryVehicleDetails && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium">{temporaryVehicleDetails.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License Plate</span>
                  <span className="font-medium">{temporaryVehicleDetails.licensePlate}</span>
                </div>
              </>
            )}
            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold">₹{reservation.cost}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>
        
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={setPaymentMethod}
          className="space-y-4"
        >
          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${paymentMethod === 'parking' ? 'border-park-yellow bg-park-yellow/10' : 'border-gray-200'}`}>
            <RadioGroupItem value="parking" id="parking" />
            <Label htmlFor="parking" className="flex items-center gap-3 cursor-pointer flex-grow">
              <ParkingMeter className="h-5 w-5" />
              <div>
                <p className="font-medium">Pay at Parking</p>
                <p className="text-xs text-gray-500">Pay on-site when you arrive</p>
              </div>
            </Label>
          </div>

          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${paymentMethod === 'card' ? 'border-park-yellow bg-park-yellow/10' : 'border-gray-200'}`}>
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-grow">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
              </div>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${paymentMethod === 'upi' ? 'border-park-yellow bg-park-yellow/10' : 'border-gray-200'}`}>
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-grow">
              <img src="/placeholder.svg" alt="UPI" className="h-5 w-5" />
              <div>
                <p className="font-medium">UPI Payment</p>
                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
              </div>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${paymentMethod === 'wallet' ? 'border-park-yellow bg-park-yellow/10' : 'border-gray-200'}`}>
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-grow">
              <Wallet className="h-5 w-5" />
              <div>
                <p className="font-medium">ParkSmart Wallet</p>
                <p className="text-xs text-gray-500">Balance: ₹500</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        {/* Pay Button */}
        <div className="mt-10">
          <Button 
            className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : paymentMethod === 'parking' 
              ? `Reserve Slot (Pay ₹${reservation.cost} at parking)` 
              : `Pay & Reserve (₹${reservation.cost})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
