
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircle, UserPlus, Search } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-gray-200 min-h-screen p-4">
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <UserCircle className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-medium">name of doctor</h2>
          </div>
        </div>
        
        <div className="text-sm space-y-1">
          <p>Doctor Id:</p>
          <p>department:</p>
          <p>Specialization in:</p>
        </div>
      </div>
      
      <div className="bg-gray-300 rounded-xl p-4">
        <nav className="space-y-4">
          <Link
            to="/new-patient"
            className={`block py-2 px-4 rounded-lg ${
              isActive("/new-patient") ? "font-bold underline" : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>New Patient</span>
            </div>
          </Link>
          
          <Link
            to="/search-patient"
            className={`block py-2 px-4 rounded-lg ${
              isActive("/search-patient") ? "font-bold underline" : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search patient</span>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
