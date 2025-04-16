
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/home");
    } catch (error) {
      setError("Invalid email or password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  // Demo login for testing
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login("demo@parksmart.com", "password");
      toast({
        title: "Demo login successful",
        description: "Welcome to ParkSmart!",
      });
      navigate("/home");
    } catch (error) {
      setError("Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={() => navigate("/onboarding")}
      >
        <ChevronLeft size={24} />
      </Button>
      
      <div className="flex-grow flex flex-col mt-16">
        <h1 className="text-2xl font-bold mb-8">Sign in</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              EMAIL
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aryanparihar@gmail.com"
              className="w-full h-12 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              PASSWORD
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pr-10 rounded-md"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button
            type="submit"
            className="w-full bg-black text-white rounded-full py-6 mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-black text-black rounded-full py-6"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Demo Login
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button onClick={handleRegister} className="text-blue-600 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
