import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const NewPatient = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodPressure: "",
    disease: "",
    prescription: ""
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic check for name and age
    if (!formData.name || !formData.age) {
      toast({
        title: "Error",
        description: "Patient name and age are required",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add a patient",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Add patient to Firestore
      const patientsCollection = collection(db, "patients");
      const docRef = await addDoc(patientsCollection, {
        ...formData,
        // Additional fields
        doctorId: currentUser.uid,
        createdAt: new Date().toISOString(),
        lastVisitDate: new Date().toISOString(),
      });
      
      toast({
        title: "Success",
        description: "Patient added successfully!",
      });
      
      // Navigate to Search Patient page with this new doc ID
      navigate(`/search-patient?patientId=${docRef.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
      console.error("Error adding patient:", error);
    } finally {
      setIsLoading(false);
    }
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
              <div>name of doctor</div>
              <div className="text-sm">specialist</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserCircle className="h-8 w-8" />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Patient Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-medium">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bloodPressure" className="block text-sm font-medium">
                  Blood Pressure
                </label>
                <input
                  id="bloodPressure"
                  name="bloodPressure"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 120/80"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="disease" className="block text-sm font-medium">
                  Disease
                </label>
                <input
                  id="disease"
                  name="disease"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.disease}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="prescription" className="block text-sm font-medium">
                  Prescription
                </label>
                <textarea
                  id="prescription"
                  name="prescription"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.prescription}
                  onChange={handleChange}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-medical-green text-black hover:bg-green-500"
              >
                {isLoading ? "Saving..." : "Save Patient"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewPatient;