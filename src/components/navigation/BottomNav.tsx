
import { Home, Search, Clock, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/find-parking", label: "Find", icon: Search },
    { path: "/history", label: "History", icon: Clock },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-4 ${
                isActive ? "text-park-yellow" : "text-gray-500"
              }`}
            >
              <item.icon size={20} className={isActive ? "fill-park-yellow" : ""} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
