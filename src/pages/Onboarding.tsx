
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";

interface OnboardingSlide {
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  button?: {
    primary: string;
    secondary?: string;
  };
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null);
  
  const slides: OnboardingSlide[] = [
    {
      title: "Find the nearest parking lot",
      subtitle: "Avoiding getting late by finding a parking spot near you",
      image: "/lovable-uploads/f291d7c8-63d8-468e-a56c-779a2ac73725.png",
      bgColor: "bg-park-yellow",
      button: {
        primary: "Enable Location",
        secondary: "Not Now"
      }
    },
    {
      title: "Book your Slot on the go",
      subtitle: "Reserve your spot and enjoy hassle free parking",
      image: "/lovable-uploads/ab2c6a9a-5296-44c6-95df-8fbea5fb2430.png",
      bgColor: "bg-park-yellow",
    },
    {
      title: "Search,Discover & Park",
      subtitle: "Reserve your spot and enjoy hassle free parking",
      image: "/lovable-uploads/a1bee4e9-2429-446c-bbdc-33e3d4a11fc4.png",
      bgColor: "bg-park-yellow",
    },
  ];

  const startAutoSlide = useCallback(() => {
    // Clear any existing interval
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
    
    // Set new interval
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev < slides.length - 1 ? prev + 1 : prev;
        
        // If we've reached the last slide, clear the interval
        if (nextSlide === slides.length - 1) {
          clearInterval(interval);
        }
        
        return nextSlide;
      });
    }, 5000); // Change slide every 5 seconds
    
    setAutoSlideInterval(interval);
  }, [slides.length, autoSlideInterval]);

  // Start auto-slide on component mount
  useEffect(() => {
    startAutoSlide();
    
    // Cleanup interval on component unmount
    return () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
      }
    };
  }, [startAutoSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    
    // Reset auto-slide after manual navigation
    startAutoSlide();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      startAutoSlide();
    } else {
      navigate("/register");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen overflow-hidden">
      <Carousel className="h-full w-full" index={currentSlide} setIndex={setCurrentSlide}>
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full">
              <div className={`${slide.bgColor} h-full w-full flex flex-col px-6 py-12 relative`}>
                {index > 0 && (
                  <div className="absolute top-4 left-4">
                    {/* Intentionally left empty for the design */}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 text-black"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                
                <div className="flex-grow flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="h-64 object-contain" 
                    />
                  </div>
                  
                  <div className="mt-auto mb-16">
                    <h1 className="text-3xl font-bold mb-2 text-black">
                      {slide.title}
                    </h1>
                    
                    <p className="text-gray-600 mb-8">
                      {slide.subtitle}
                    </p>
                    
                    {slide.button && (
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-black text-white rounded-full py-6"
                          onClick={handleNext}
                        >
                          {slide.button.primary}
                        </Button>
                        
                        {slide.button.secondary && (
                          <Button
                            variant="ghost"
                            className="w-full text-black rounded-full py-6"
                            onClick={handleNext}
                          >
                            {slide.button.secondary}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-2 mb-8">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        className={`h-2 rounded-full transition-all ${
                          currentSlide === idx 
                            ? "w-6 bg-black" 
                            : "w-2 bg-black/30"
                        }`}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Onboarding;
