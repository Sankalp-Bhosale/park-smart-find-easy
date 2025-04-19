import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, MapPin, Clock, Calendar, Car, Share2, ChevronLeft, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/context/ParkingContext";
import { toast } from "@/components/ui/use-toast";

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reservations, getParkingLotById } = useParking();
  const [reservation, setReservation] = useState(reservations.find(res => res.id === id));
  const [parkingLot, setParkingLot] = useState(
    reservation ? getParkingLotById(reservation.parkingLotId) : undefined
  );

  useEffect(() => {
    if (!reservation) {
      toast({
        title: "Booking not found",
        description: "Unable to find your booking details",
        variant: "destructive"
      });
      navigate("/history");
    } else if (!parkingLot) {
      const lot = getParkingLotById(reservation.parkingLotId);
      setParkingLot(lot);
    }
  }, [reservation, parkingLot, getParkingLotById, navigate]);

  if (!reservation || !parkingLot) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Parking Reservation',
        text: `I've booked a parking spot at ${parkingLot.name} for ${formatDate(reservation.startTime)} at ${formatTime(reservation.startTime)}`,
        url: window.location.href,
      })
      .catch((error) => {
        toast({
          title: "Share failed",
          description: "Unable to share booking details",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Share",
        description: "Sharing booking details",
      });
    }
  };

  const generateQrCode = () => {
    return (
      <div className="border-2 border-black rounded-lg p-2 w-full h-full flex flex-col items-center justify-center">
        <QrCode size={160} className="mb-2"/>
        <p className="text-xs font-mono">{reservation.id}</p>
      </div>
    );
  };

  const isPayAtParking = reservation.paymentMethod === 'pay_at_parking';

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 flex items-center border-b">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/home")}
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Booking Confirmation</h1>
      </div>
      
      <div className="flex flex-col items-center justify-center py-8 bg-park-yellow/10">
        <div className="bg-park-yellow rounded-full p-3 mb-4">
          <Check size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">
          {isPayAtParking ? 'Slot Reserved Successfully!' : 'Reservation Successful!'}
        </h2>
        <p className="text-gray-600">
          {isPayAtParking 
            ? 'Please pay at the parking location' 
            : 'Your parking spot has been reserved'}
        </p>
      </div>
      
      <div className="p-6 flex flex-col items-center border-b border-gray-100">
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-64 h-64 flex items-center justify-center">
          {generateQrCode()}
        </div>
        <p className="text-sm text-gray-500">Show this QR code at the entrance</p>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg mb-4">Booking Details</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="bg-gray-100 rounded-full p-3 h-fit">
              <MapPin size={20} className="text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">{parkingLot.name}</h4>
              <p className="text-sm text-gray-500">{parkingLot.address}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-gray-100 rounded-full p-3 h-fit">
              <Calendar size={20} className="text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">{formatDate(reservation.startTime)}</h4>
              <p className="text-sm text-gray-500">
                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-gray-100 rounded-full p-3 h-fit">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">{reservation.duration} hour{reservation.duration > 1 ? 's' : ''}</h4>
              <p className="text-sm text-gray-500">Total Duration</p>
            </div>
          </div>
          
          {reservation.vehicleDetails && (
            <div className="flex gap-4">
              <div className="bg-gray-100 rounded-full p-3 h-fit">
                <Car size={20} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium">{reservation.vehicleDetails.model}</h4>
                <p className="text-sm text-gray-500">{reservation.vehicleDetails.licensePlate}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            {reservation.slotName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Slot Number</span>
                <span className="font-bold">{reservation.slotName}</span>
              </div>
            )}
            {!reservation.slotName && reservation.spotNumber && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Spot Number</span>
                <span className="font-bold">{reservation.spotNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold">₹{reservation.cost}</span>
            </div>
            {reservation.paymentMethod && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Payment Status</span>
                <span className="font-medium">
                  {isPayAtParking 
                    ? 'Pay at parking location' 
                    : 'Paid'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline"
          className="w-full mt-8 border-gray-300"
          onClick={handleShare}
        >
          <Share2 size={18} className="mr-2" />
          Share Booking Details
        </Button>
        
        <Button 
          className="w-full bg-park-yellow text-black font-bold py-6 rounded-xl mt-4"
          onClick={() => navigate("/home")}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
