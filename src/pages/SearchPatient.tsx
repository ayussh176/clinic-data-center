import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Bell, UserCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

type Patient = {
  id: string;
  name: string;
  age: string;
  bloodPressure: string;
  disease: string;
  prescription: string;
  createdAt: string;      // from your screenshot
  doctorId: string;       // from your screenshot
  lastVisitDate: string;  // from your screenshot
};

const SearchPatient = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Optionally read "patientId" from the URL query param if you want
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  
  const [patientId, setPatientId] = useState(initialPatientId);
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [updateData, setUpdateData] = useState<Partial<Patient>>({});

  // Keep track of realtime subscription for cleanup
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState<(() => void) | null>(null);
  
  // Search for the patient by doc ID
  const handleSearch = async () => {
    if (!patientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient ID",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to search for patients",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Search for patient in Firestore by document ID (__name__)
      const patientsRef = collection(db, "patients");
      const q = query(
        patientsRef,
        where("doctorId", "==", currentUser.uid),
        where("__name__", "==", patientId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "Not found",
          description: "No patient found with that ID",
          variant: "destructive",
        });
        setPatient(null);
        // cleanup previous realtime listeners
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        return;
      }
      
      // Use the first matching document
      const docSnap = querySnapshot.docs[0];
      const foundDocId = docSnap.id;
      
      // Realtime listener
      if (unsubscribeSnapshot) unsubscribeSnapshot(); // clear any old listener
      const unsub = onSnapshot(doc(db, "patients", foundDocId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<Patient, "id">;
          setPatient({ id: foundDocId, ...data });
          // If not in edit mode, sync update data
          if (!editMode) {
            setUpdateData({ ...data });
          }
        } else {
          setPatient(null);
        }
      });
      setUnsubscribeSnapshot(() => unsub);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for patient",
        variant: "destructive",
      });
      console.error("Error searching for patient:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle toggling edit mode
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    if (editMode && patient) {
      // If turning edit mode off, reset fields to the actual patient data
      setUpdateData({ ...patient });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the Firestore document with new data
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    
    try {
      const patientRef = doc(db, "patients", patient.id);
      await updateDoc(patientRef, {
        ...updateData,
        lastVisitDate: new Date().toISOString(), // update lastVisitDate on each update
      });
      toast({
        title: "Success",
        description: "Patient information updated successfully!",
      });
      setEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
      console.error("Error updating patient:", error);
    }
  };

  // Cleanup listener on unmount or new search
  useEffect(() => {
    // If there's a patientId in query string, auto-search on mount
    if (initialPatientId) {
      handleSearch();
    }
    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
    // eslint-disable-next-line
  }, []);

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
          <h1 className="text-2xl font-bold mb-6">Search Patient</h1>
          
          <div className="mb-6 flex space-x-2">
            <input
              type="text"
              placeholder="enter patient ID:"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-900"
            >
              {isLoading ? "Searching..." : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  enter
                </>
              )}
            </Button>
          </div>
          
          {patient && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
              
              {/* Display patient details in a table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Patient ID</td>
                      <td className="py-2">{patient.id}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Name</td>
                      <td className="py-2">{patient.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Age</td>
                      <td className="py-2">{patient.age}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Blood Pressure</td>
                      <td className="py-2">{patient.bloodPressure}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Disease</td>
                      <td className="py-2">{patient.disease}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Prescription</td>
                      <td className="py-2">{patient.prescription}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">doctorId</td>
                      <td className="py-2">{patient.doctorId}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">createdAt</td>
                      <td className="py-2">{patient.createdAt}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">lastVisitDate</td>
                      <td className="py-2">
                        {new Date(patient.lastVisitDate).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Toggle Edit Mode */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={toggleEditMode}
                  className="bg-medical-green text-black hover:bg-green-500"
                >
                  {editMode ? "Cancel Edit" : "Edit Patient Information"}
                </Button>
              </div>
              
              {/* Edit form (if editMode is active) */}
              {editMode && (
                <form onSubmit={handleUpdatePatient} className="mt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={updateData.name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="age" className="block text-sm font-medium">
                        Age
                      </label>
                      <input
                        id="age"
                        name="age"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={updateData.age || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="bloodPressure" className="block text-sm font-medium">
                        Blood Pressure
                      </label>
                      <input
                        id="bloodPressure"
                        name="bloodPressure"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={updateData.bloodPressure || ""}
                        onChange={handleInputChange}
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
                        value={updateData.disease || ""}
                        onChange={handleInputChange}
                      />
                    </div>
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
                      value={updateData.prescription || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-medical-green text-black hover:bg-green-500"
                  >
                    Update Patient
                  </Button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPatient;
