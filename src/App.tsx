
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ParkingProvider } from "./context/ParkingContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import FindParking from "./pages/FindParking";
import ParkingDetails from "./pages/ParkingDetails";
import BookParking from "./pages/BookParking";
import PaymentMethod from "./pages/PaymentMethod";
import BookingConfirmation from "./pages/BookingConfirmation";
import History from "./pages/History";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ParkingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/find-parking" element={<FindParking />} />
              <Route path="/parking/:id" element={<ParkingDetails />} />
              <Route path="/book/:id" element={<BookParking />} />
              <Route path="/payment/:id" element={<PaymentMethod />} />
              <Route path="/confirmation/:id" element={<BookingConfirmation />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </ParkingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
