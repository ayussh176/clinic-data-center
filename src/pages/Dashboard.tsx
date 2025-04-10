
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [doctorData, setDoctorData] = useState({
    name: "Loading...",
    specialization: "Loading...",
    department: "Loading...",
    doctorId: "Loading...",
    appointments: 0,
    surgeries: 0,
    meetings: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, "doctors", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDoctorData({ ...docSnap.data() as any });
        } else {
          toast({
            title: "Error",
            description: "No doctor profile found!",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorData();
  }, [currentUser, toast]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleNewPatient = () => {
    navigate("/new-patient");
  };
  
  const handleSearchPatient = () => {
    navigate("/search-patient");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-medical-blue text-white p-4 flex justify-between items-center">
          <button className="rounded-full bg-white p-2">
            <Bell className="h-6 w-6 text-medical-blue" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div>{doctorData.name}</div>
              <div className="text-sm">{doctorData.specialization}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserCircle className="h-8 w-8" />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6">
          {/* Doctor info card */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <UserCircle className="h-12 w-12 text-gray-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium">{doctorData.name}</h2>
                <p className="text-gray-600">Doctor Id: {doctorData.doctorId?.substring(0, 8)}</p>
                <p className="text-gray-600">Department: {doctorData.department}</p>
                <p className="text-gray-600">Specialization in: {doctorData.specialization}</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 text-center">
                <div className="text-2xl font-semibold">{doctorData.appointments}</div>
              </div>
              <div className="bg-medical-red text-white p-2 text-center">
                Appointments
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 text-center">
                <div className="text-2xl font-semibold">{doctorData.surgeries}</div>
              </div>
              <div className="bg-medical-red text-white p-2 text-center">
                Surgery
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 text-center">
                <div className="text-2xl font-semibold">{doctorData.meetings}</div>
              </div>
              <div className="bg-medical-red text-white p-2 text-center">
                Meetings
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleNewPatient}
              className="w-full md:w-72 bg-medical-green text-black hover:bg-green-500 h-12 rounded-full"
            >
              Enter New Patient
            </Button>
            
            <Button
              onClick={handleSearchPatient}
              className="w-full md:w-72 bg-medical-green text-black hover:bg-green-500 h-12 rounded-full"
            >
              Search Patient
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
