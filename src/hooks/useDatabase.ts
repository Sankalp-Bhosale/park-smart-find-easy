
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useDatabase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch parking locations
  const useParking = () => {
    return useQuery({
      queryKey: ['parking-locations'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('parking_locations')
          .select('*');
        
        if (error) {
          toast({
            title: "Error fetching parking locations",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        return data;
      },
    });
  };

  // Fetch user bookings with parking location details
  const useBookings = (userId: string) => {
    return useQuery({
      queryKey: ['bookings', userId],
      queryFn: async () => {
        console.log("Fetching bookings for user:", userId);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            parking_locations (
              id,
              name,
              address
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching bookings:", error);
          toast({
            title: "Error fetching bookings",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        console.log("Fetched bookings:", data);
        return data;
      },
      enabled: !!userId,
    });
  };

  // Create booking
  const useCreateBooking = () => {
    return useMutation({
      mutationFn: async (booking: {
        parking_location_id: string;
        start_time: string;
        end_time: string;
        amount: number;
        status: string;
        payment_status: string;
      }) => {
        // Get current user ID
        const userId = user?.id;
        
        if (!userId) {
          throw new Error("User must be logged in to create a booking");
        }
        
        // Add user_id to the booking
        const bookingWithUser = {
          ...booking,
          user_id: userId
        };

        console.log("Creating booking:", bookingWithUser);

        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingWithUser)
          .select(`
            *,
            parking_locations (
              id,
              name,
              address
            )
          `)
          .single();

        if (error) {
          console.error("Error creating booking:", error);
          toast({
            title: "Error creating booking",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }

        console.log("Created booking:", data);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast({
          title: "Booking created",
          description: "Your booking has been created successfully.",
        });
      },
    });
  };

  // Update user profile
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (profile: { id: string; name?: string; phone?: string }) => {
        const { data, error } = await supabase
          .from('profiles')
          .update(profile)
          .eq('id', profile.id)
          .select()
          .single();

        if (error) {
          toast({
            title: "Error updating profile",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }

        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      },
    });
  };

  return {
    useParking,
    useBookings,
    useCreateBooking,
    useUpdateProfile,
  };
};
