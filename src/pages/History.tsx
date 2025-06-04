
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParking } from "@/context/ParkingContext";
import BottomNav from "@/components/navigation/BottomNav";

const History = () => {
  const navigate = useNavigate();
  const { reservations } = useParking();
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active");

  console.log("All reservations in History:", reservations);

  const filteredReservations = reservations.filter(reservation => {
    console.log("Filtering reservation:", reservation.id, "status:", reservation.status, "activeTab:", activeTab);
    
    if (activeTab === "active") {
      // Show confirmed and pending_payment as active
      return reservation.status === "confirmed" || reservation.status === "pending_payment" || reservation.status === "pending";
    }
    if (activeTab === "completed") {
      return reservation.status === "completed";
    }
    if (activeTab === "cancelled") {
      return reservation.status === "canceled";
    }
    return true;
  });

  console.log("Filtered reservations:", filteredReservations);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Active", className: "bg-green-100 text-green-800" };
      case "pending_payment":
        return { label: "Pending Payment", className: "bg-yellow-100 text-yellow-800" };
      case "pending":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-800" };
      case "completed":
        return { label: "Completed", className: "bg-blue-100 text-blue-800" };
      case "canceled":
        return { label: "Cancelled", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-park-yellow p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center mb-6">
          <h1 className="text-xl font-bold text-black">Parking History</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search parking history"
            className="w-full h-12 pl-10 pr-4 rounded-full shadow-md border-none"
          />
        </div>
      </div>
      
      <div className="px-6 -mt-6">
        <Tabs
          defaultValue="active"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "active" | "completed" | "cancelled")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredReservations.length > 0 ? (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => {
                  const statusInfo = getStatusDisplay(reservation.status);
                  return (
                    <Card
                      key={reservation.id}
                      className="overflow-hidden border-none shadow-sm rounded-lg cursor-pointer"
                      onClick={() => navigate(`/confirmation/${reservation.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold">{reservation.parkingLotName}</h3>
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${statusInfo.className}
                          `}>
                            {statusInfo.label}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
                          <Clock size={14} />
                          <span>
                            {formatDate(reservation.startTime)} • {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">Spot</p>
                            <p className="font-medium">{reservation.spotNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="font-medium">{reservation.duration} hr{reservation.duration > 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">₹{reservation.cost}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Clock size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No reservations found</p>
                <p className="text-sm text-gray-400 mb-6">
                  {activeTab === "active" ? "You don't have any active reservations" : 
                   activeTab === "completed" ? "No completed reservations yet" :
                   "No cancelled reservations"}
                </p>
                {activeTab === "active" && (
                  <Button
                    onClick={() => navigate("/find-parking")}
                    className="bg-park-yellow text-black"
                  >
                    Find Parking
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default History;
