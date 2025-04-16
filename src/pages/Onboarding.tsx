
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingSlide {
  title: string;
  description: string;
  image: string;
  bgColor: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: "Find the nearest parking lot",
      description: "Avoid parking hassle by finding a parking spot near you",
      image: "/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png",
      bgColor: "bg-park-yellow",
    },
    {
      title: "Book your Slot on the go",
      description: "Reserve your spot and enjoy hassle-free parking",
      image: "/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png",
      bgColor: "bg-park-yellow",
    },
    {
      title: "Search, Discover & Park",
      description: "Reserve your spot and enjoy hassle-free parking",
      image: "/lovable-uploads/50563028-a53f-4a0b-b78f-a3001097274d.png",
      bgColor: "bg-park-yellow",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/register");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={`min-h-screen ${slides[currentSlide].bgColor} flex flex-col`}>
      {currentSlide > 0 && (
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-black"
          onClick={prevSlide}
        >
          <ChevronLeft size={24} />
        </Button>
      )}
      
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-black"
        onClick={goToLogin}
      >
        Skip
      </Button>
      
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mb-8 flex justify-center">
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title}
            className="h-64 object-contain" 
          />
        </div>
        
        <h1 className="text-2xl font-bold mb-3 text-center text-black">
          {slides[currentSlide].title}
        </h1>
        
        <p className="text-center text-black mb-12 max-w-xs">
          {slides[currentSlide].description}
        </p>
        
        <div className="flex justify-center space-x-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full ${
                currentSlide === index ? "w-8 bg-black" : "w-2 bg-black/30"
              } transition-all`}
            />
          ))}
        </div>
        
        <Button
          className="w-full max-w-xs bg-black text-white rounded-full py-6"
          onClick={nextSlide}
        >
          {currentSlide < slides.length - 1 ? (
            <>Next <ChevronRight size={20} /></>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
