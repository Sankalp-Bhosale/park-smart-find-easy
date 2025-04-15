
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, CreditCard, Car, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/navigation/BottomNav";

const ProfileItem = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ComponentType<any>,
  title: string,
  description?: string,
  onClick: () => void
}) => (
  <div 
    className="flex items-center gap-4 p-4 border-b cursor-pointer"
    onClick={onClick}
  >
    <div className="bg-gray-100 rounded-full p-3">
      <Icon size={20} className="text-gray-600" />
    </div>
    <div className="flex-grow">
      <h3 className="font-medium">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <ChevronRight size={20} className="text-gray-400" />
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    navigate("/login");
    setIsLoading(false);
  };

  const profileItems = [
    {
      icon: User,
      title: "Personal Information",
      description: "Update your personal details",
      onClick: () => alert("Navigate to personal information page")
    },
    {
      icon: Car,
      title: "My Vehicles",
      description: "Manage your vehicle information",
      onClick: () => alert("Navigate to vehicles page")
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      description: "Add or remove payment methods",
      onClick: () => alert("Navigate to payment methods page")
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Update your notification preferences",
      onClick: () => alert("Navigate to notifications page")
    },
    {
      icon: Settings,
      title: "Settings",
      description: "App settings and preferences",
      onClick: () => alert("Navigate to settings page")
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-park-yellow p-6 flex flex-col items-center pt-12">
        <div className="bg-white h-24 w-24 rounded-full flex items-center justify-center mb-4 shadow-md">
          <User size={40} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-black">{user?.name || "Guest User"}</h1>
        <p className="text-sm text-gray-700">{user?.email || "guest@example.com"}</p>
      </div>
      
      <div className="p-6">
        {/* Profile Items */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {profileItems.map((item, index) => (
            <ProfileItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              onClick={item.onClick}
            />
          ))}
        </div>
        
        {/* App Info */}
        <div className="mb-8">
          <h3 className="font-medium mb-2">App Information</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Version</span>
            <span>1.0.0</span>
          </div>
        </div>
        
        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full border-red-500 text-red-500 flex items-center justify-center gap-2"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut size={18} />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
