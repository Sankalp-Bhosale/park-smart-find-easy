
import { useToast as useHookToast, toast as hookToast } from "@/hooks/use-toast";

// Re-export the hooks
export const useToast = useHookToast;
export const toast = hookToast;
