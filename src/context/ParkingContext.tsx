
import { createContext, useContext, useState, ReactNode } from "react";

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
}

interface Reservation {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  spotNumber: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  cost: number;
  status: "pending" | "confirmed" | "completed" | "canceled";
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
  createReservation: (reservation: Omit<Reservation, "id" | "status">) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<void>;
  calculateParkingCost: (parkingLotId: string, hours: number) => number;
  favoriteLocations: string[];
  addFavoriteLocation: (location: string) => void;
  removeFavoriteLocation: (location: string) => void;
}

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
    images: ["/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"],
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
    images: ["/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"],
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
    images: ["/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"],
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
    images: ["/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"],
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
    images: ["/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png"],
    rating: 4.7,
    amenities: ["Covered", "Security", "Valet", "Car Wash", "EV Charging"],
    operatingHours: "9:00 AM - 11:00 PM"
  }
];

// Create context
const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(MOCK_PARKING_LOTS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>(["Andheri East", "Bandra West"]);

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
        const updatedLots = MOCK_PARKING_LOTS.map(lot => ({
          ...lot,
          distance: parseFloat((Math.random() * 5).toFixed(1)),
          availableSpots: Math.floor(Math.random() * lot.totalSpots)
        }));
        
        setParkingLots(updatedLots);
        resolve(updatedLots);
      }, 1500);
    });
  };

  // Get a parking lot by ID
  const getParkingLotById = (id: string): ParkingLot | undefined => {
    return parkingLots.find(lot => lot.id === id);
  };

  // Create a reservation
  const createReservation = async (reservationData: Omit<Reservation, "id" | "status">): Promise<Reservation> => {
    const newReservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      status: "confirmed"
    };
    
    setReservations(prev => [...prev, newReservation]);
    return newReservation;
  };

  // Cancel a reservation
  const cancelReservation = async (id: string): Promise<void> => {
    setReservations(prev => 
      prev.map(res => res.id === id ? { ...res, status: "canceled" } : res)
    );
  };

  // Calculate parking cost
  const calculateParkingCost = (parkingLotId: string, hours: number): number => {
    const lot = parkingLots.find(lot => lot.id === parkingLotId);
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
    nearbyParkingLots: parkingLots,
    searchParkingLots,
    getParkingLotById,
    reservations,
    createReservation,
    cancelReservation,
    calculateParkingCost,
    favoriteLocations,
    addFavoriteLocation,
    removeFavoriteLocation
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
