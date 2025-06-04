import { createContext, useContext, useState } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { useAuth } from "./AuthContext";

// Types
interface ParkingLot {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number;
  dailyRate: number;
  distance?: number;
  images?: string[];
  rating?: number;
  amenities?: string[];
  operatingHours?: string;
  slots?: ParkingSlot[];
}

interface ParkingSlot {
  id: string;
  name: string;
  isAvailable: boolean;
  type: "standard" | "disabled" | "electric" | "family";
  floor?: string;
}

interface Reservation {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  slotId?: string;
  slotName?: string;
  spotNumber?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  cost: number;
  status: "pending" | "confirmed" | "completed" | "canceled" | "pending_payment";
  paymentMethod?: string;
  vehicleDetails?: {
    model: string;
    type: string;
    licensePlate: string;
  };
}

interface ParkingContextType {
  nearbyParkingLots: ParkingLot[];
  searchParkingLots: (location: string) => Promise<ParkingLot[]>;
  getParkingLotById: (id: string) => ParkingLot | undefined;
  reservations: Reservation[];
  createReservation: (reservation: Omit<Reservation, "id">) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<void>;
  calculateParkingCost: (parkingLotId: string, hours: number) => number;
  favoriteLocations: string[];
  addFavoriteLocation: (location: string) => void;
  removeFavoriteLocation: (location: string) => void;
  selectedSlot: ParkingSlot | null;
  setSelectedSlot: (slot: ParkingSlot | null) => void;
  temporaryVehicleDetails: { model: string; licensePlate: string; type: string } | null;
  setTemporaryVehicleDetails: (details: { model: string; licensePlate: string; type: string } | null) => void;
}

// Generate parking slots for a lot
const generateParkingSlots = (lotId: string, totalSlots: number): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  
  // Determine how many slots should be unavailable (20-40%)
  const unavailableCount = Math.floor(totalSlots * (0.2 + Math.random() * 0.2));
  const unavailableIndices = new Set<number>();
  
  // Randomly select indices to be unavailable
  while (unavailableIndices.size < unavailableCount) {
    unavailableIndices.add(Math.floor(Math.random() * totalSlots));
  }
  
  // Generate slot types distribution
  const standardCount = Math.floor(totalSlots * 0.8);
  const disabledCount = Math.floor(totalSlots * 0.1);
  const electricCount = Math.floor(totalSlots * 0.07);
  const familyCount = totalSlots - standardCount - disabledCount - electricCount;
  
  let slotIndex = 0;
  
  // Generate standard slots
  for (let i = 0; i < standardCount; i++) {
    const slotNum = i + 1;
    slots.push({
      id: `${lotId}-slot-${slotNum}`,
      name: `A${slotNum}`,
      isAvailable: !unavailableIndices.has(slotIndex),
      type: "standard",
      floor: "1"
    });
    slotIndex++;
  }
  
  // Generate disabled slots
  for (let i = 0; i < disabledCount; i++) {
    const slotNum = i + 1;
    slots.push({
      id: `${lotId}-disabled-${slotNum}`,
      name: `D${slotNum}`,
      isAvailable: !unavailableIndices.has(slotIndex),
      type: "disabled",
      floor: "1"
    });
    slotIndex++;
  }
  
  // Generate electric vehicle slots
  for (let i = 0; i < electricCount; i++) {
    const slotNum = i + 1;
    slots.push({
      id: `${lotId}-electric-${slotNum}`,
      name: `E${slotNum}`,
      isAvailable: !unavailableIndices.has(slotIndex),
      type: "electric",
      floor: "1"
    });
    slotIndex++;
  }
  
  // Generate family slots
  for (let i = 0; i < familyCount; i++) {
    const slotNum = i + 1;
    slots.push({
      id: `${lotId}-family-${slotNum}`,
      name: `F${slotNum}`,
      isAvailable: !unavailableIndices.has(slotIndex),
      type: "family",
      floor: "1"
    });
    slotIndex++;
  }
  
  return slots;
};

// Sample data with improved details matching the design
const MOCK_PARKING_LOTS: ParkingLot[] = [
  {
    id: "parking-1",
    name: "D-Mart Mall Parking",
    address: "Sakinaka Rd, Powai Circle, Mumbai",
    location: { lat: 19.0760, lng: 72.8777 },
    totalSpots: 120,
    availableSpots: 45,
    hourlyRate: 50,
    dailyRate: 150,
    distance: 0.5,
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"],
    rating: 4.2,
    amenities: ["EV Charging", "Security", "Camera", "Covered"],
    operatingHours: "Open Now: 10:00 AM - 11:30 PM"
  },
  {
    id: "parking-2",
    name: "Central Plaza Parking",
    address: "Andheri East, Mumbai",
    location: { lat: 19.1136, lng: 72.8697 },
    totalSpots: 200,
    availableSpots: 75,
    hourlyRate: 60,
    dailyRate: 200,
    distance: 1.2,
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"],
    rating: 4.5,
    amenities: ["Covered", "Security", "Valet", "EV Charging"],
    operatingHours: "Open 24 Hours"
  },
  {
    id: "parking-3",
    name: "Metro Station Parking",
    address: "Ghatkopar West, Mumbai",
    location: { lat: 19.0877, lng: 72.9088 },
    totalSpots: 150,
    availableSpots: 30,
    hourlyRate: 40,
    dailyRate: 120,
    distance: 2.5,
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"],
    rating: 3.8,
    amenities: ["Open Air", "Security"],
    operatingHours: "6:00 AM - 12:00 AM"
  },
  {
    id: "parking-4",
    name: "City Center Parking",
    address: "Kurla West, Mumbai",
    location: { lat: 19.0728, lng: 72.8826 },
    totalSpots: 80,
    availableSpots: 25,
    hourlyRate: 30,
    dailyRate: 100,
    distance: 1.8,
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"],
    rating: 3.5,
    amenities: ["Open Air", "CCTV", "24/7 Security"],
    operatingHours: "Open 24 Hours"
  },
  {
    id: "parking-5",
    name: "Mall of Mumbai Parking",
    address: "BKC, Bandra East, Mumbai",
    location: { lat: 19.0607, lng: 72.8681 },
    totalSpots: 300,
    availableSpots: 120,
    hourlyRate: 70,
    dailyRate: 250,
    distance: 3.2,
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"],
    rating: 4.7,
    amenities: ["Covered", "Security", "Valet", "Car Wash", "EV Charging"],
    operatingHours: "9:00 AM - 11:00 PM"
  }
].map(lot => ({
  ...lot,
  slots: generateParkingSlots(lot.id, lot.totalSpots)
}));

// Create context
const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { useParking, useBookings, useCreateBooking } = useDatabase();
  
  // Fetch parking locations from the database
  const { data: parkingLocationsData = [] } = useParking();
  
  // Fetch user bookings if user is authenticated
  const { data: userBookings = [] } = useBookings(user?.id || "");
  
  // Transform database bookings to our Reservation structure
  const databaseReservations: Reservation[] = userBookings.map(booking => {
    console.log("Processing booking:", booking);
    return {
      id: booking.id,
      parkingLotId: booking.parking_location_id,
      parkingLotName: booking.parking_locations?.name || 'Unknown Location',
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      duration: Math.ceil((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60)),
      cost: booking.amount,
      status: booking.status as "pending" | "confirmed" | "completed" | "canceled" | "pending_payment",
      spotNumber: `A${Math.floor(Math.random() * 100) + 1}`, // Generate spot number since it's not in DB
      paymentMethod: booking.payment_status === 'pending' ? 'pay_at_parking' : 'paid'
    };
  });
  
  console.log("Database reservations:", databaseReservations);
  
  // Transform database parking locations to our ParkingLot structure
  const parkingLocations = parkingLocationsData.map(loc => ({
    id: loc.id,
    name: loc.name,
    address: loc.address,
    location: { lat: loc.lat, lng: loc.lng },
    totalSpots: loc.total_spots,
    availableSpots: loc.available_spots,
    hourlyRate: loc.price_per_hour,
    dailyRate: loc.price_per_hour * 8, // Estimate daily rate
    distance: 1.0, // Default distance
    images: ["/lovable-uploads/40da5286-6726-44b4-8089-65e57c79f277.png"], // Default image
    rating: 4.0, // Default rating
    amenities: ["Security", "CCTV"],
    operatingHours: "Open 24 Hours",
    slots: generateParkingSlots(loc.id, loc.total_spots)
  }));
  
  // State variables
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>(["Andheri East", "Bandra West"]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [temporaryVehicleDetails, setTemporaryVehicleDetails] = useState<{ model: string; licensePlate: string; type: string } | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(MOCK_PARKING_LOTS);

  // Combine database reservations with local ones
  const allReservations = [...databaseReservations, ...localReservations];
  console.log("All reservations:", allReservations);

  const createBookingMutation = useCreateBooking();

  // Search for parking lots near a location
  const searchParkingLots = async (location: string): Promise<ParkingLot[]> => {
    // In a real app, this would make an API call to get parking lots near the location
    // For now, we'll simulate a delay and return filtered lots
    return new Promise((resolve) => {
      setTimeout(() => {
        // Add the search query to favorites
        if (!favoriteLocations.includes(location) && location !== "parking near me") {
          setFavoriteLocations(prev => [...prev, location]);
        }
        
        // Update distances randomly to simulate different locations
        const updatedLots = MOCK_PARKING_LOTS.map(lot => {
          // Regenerate slots to simulate different availability each time
          const slots = generateParkingSlots(lot.id, lot.totalSpots);
          const availableSlots = slots.filter(slot => slot.isAvailable).length;
          
          return {
            ...lot,
            slots,
            distance: parseFloat((Math.random() * 5).toFixed(1)),
            availableSpots: availableSlots
          };
        });
        
        setParkingLots(updatedLots);
        resolve(updatedLots);
      }, 1500);
    });
  };

  // Get a parking lot by ID
  const getParkingLotById = (id: string): ParkingLot | undefined => {
    // First try to find in real data
    const realLot = parkingLocations.find(loc => loc.id === id);
    if (realLot) return realLot;
    
    // Fall back to mock data
    return parkingLots.find(lot => lot.id === id);
  };

  // Create a reservation
  const createReservation = async (reservationData: Omit<Reservation, "id">): Promise<Reservation> => {
    console.log("Creating reservation with data:", reservationData);
    
    try {
      // Try to create in database first
      if (user?.id) {
        const dbBooking = await createBookingMutation.mutateAsync({
          parking_location_id: reservationData.parkingLotId,
          start_time: reservationData.startTime.toISOString(),
          end_time: reservationData.endTime.toISOString(),
          amount: reservationData.cost,
          status: reservationData.status || "confirmed",
          payment_status: reservationData.paymentMethod === 'pay_at_parking' ? 'pending' : 'paid'
        });

        console.log("Database booking created:", dbBooking);

        // Return the created reservation with database ID
        return {
          id: dbBooking.id,
          parkingLotId: reservationData.parkingLotId,
          parkingLotName: dbBooking.parking_locations?.name || reservationData.parkingLotName,
          slotId: reservationData.slotId,
          slotName: reservationData.slotName,
          spotNumber: reservationData.spotNumber || `A${Math.floor(Math.random() * 100) + 1}`,
          startTime: reservationData.startTime,
          endTime: reservationData.endTime,
          duration: reservationData.duration,
          cost: reservationData.cost,
          status: reservationData.status || "confirmed",
          paymentMethod: reservationData.paymentMethod,
          vehicleDetails: reservationData.vehicleDetails
        };
      }
    } catch (error) {
      console.error("Failed to create booking in database:", error);
    }

    // Fallback to local storage if database fails or user not logged in
    const spotNumber = reservationData.spotNumber || 
                      (reservationData.slotName ? reservationData.slotName : `A${Math.floor(Math.random() * 100)}`);
    
    const newReservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      status: reservationData.status || "confirmed",
      spotNumber: spotNumber
    };
    
    setLocalReservations(prev => [...prev, newReservation]);
    
    // If this reservation includes a slot, mark it as unavailable
    if (reservationData.slotId) {
      setParkingLots(prev => prev.map(lot => {
        if (lot.id === reservationData.parkingLotId && lot.slots) {
          return {
            ...lot,
            slots: lot.slots.map(slot => 
              slot.id === reservationData.slotId 
                ? { ...slot, isAvailable: false } 
                : slot
            ),
            availableSpots: lot.availableSpots - 1
          };
        }
        return lot;
      }));
    }
    
    return newReservation;
  };

  // Cancel a reservation
  const cancelReservation = async (id: string): Promise<void> => {
    // Find the reservation first to get the slot details
    const reservation = allReservations.find(res => res.id === id);
    
    // Update local reservations
    setLocalReservations(prev => 
      prev.map(res => res.id === id ? { ...res, status: "canceled" } : res)
    );
    
    // If there was a slot reserved, make it available again
    if (reservation && reservation.slotId) {
      setParkingLots(prev => prev.map(lot => {
        if (lot.id === reservation.parkingLotId && lot.slots) {
          return {
            ...lot,
            slots: lot.slots.map(slot => 
              slot.id === reservation.slotId 
                ? { ...slot, isAvailable: true } 
                : slot
            ),
            availableSpots: lot.availableSpots + 1
          };
        }
        return lot;
      }));
    }
  };

  // Calculate parking cost
  const calculateParkingCost = (parkingLotId: string, hours: number): number => {
    const lot = getParkingLotById(parkingLotId);
    if (!lot) return 0;
    
    if (hours <= 24) {
      return lot.hourlyRate * hours;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return (days * lot.dailyRate) + (remainingHours * lot.hourlyRate);
    }
  };

  // Manage favorite locations
  const addFavoriteLocation = (location: string) => {
    if (!favoriteLocations.includes(location)) {
      setFavoriteLocations(prev => [...prev, location]);
    }
  };

  const removeFavoriteLocation = (location: string) => {
    setFavoriteLocations(prev => prev.filter(loc => loc !== location));
  };

  const contextValue: ParkingContextType = {
    nearbyParkingLots: parkingLocations.length > 0 ? parkingLocations : parkingLots,
    searchParkingLots,
    getParkingLotById,
    reservations: allReservations,
    createReservation,
    cancelReservation,
    calculateParkingCost,
    favoriteLocations,
    addFavoriteLocation,
    removeFavoriteLocation,
    selectedSlot,
    setSelectedSlot,
    temporaryVehicleDetails,
    setTemporaryVehicleDetails
  };

  return (
    <ParkingContext.Provider value={contextValue}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParking must be used within a ParkingProvider");
  }
  return context;
}
