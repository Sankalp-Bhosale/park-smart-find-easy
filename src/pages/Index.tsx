import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (hasSeenOnboarding) {
      // If user has seen onboarding, check if logged in
      const user = localStorage.getItem("user");
      navigate(user ? "/home" : "/login");
    } else {
      // Otherwise show onboarding
      navigate("/onboarding");
    }
  }, [navigate]);

  return null;
};

export default Index;
