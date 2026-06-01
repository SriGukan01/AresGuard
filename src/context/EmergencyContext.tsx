import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Location, EmergencyType, DepartmentId, EmergencyReport, Alert } from '@/types/emergency';
import { sampleAlerts } from '@/data/departments';

interface EmergencyContextType {
  // Location
  location: Location | null;
  setLocation: (location: Location | null) => void;
  locationPermissionGranted: boolean;
  setLocationPermissionGranted: (granted: boolean) => void;
  
  // Emergency selection
  selectedEmergencyTypes: EmergencyType[];
  setSelectedEmergencyTypes: React.Dispatch<React.SetStateAction<EmergencyType[]>>;
  selectedDepartments: DepartmentId[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<DepartmentId[]>>;
  
  // Report
  currentReport: EmergencyReport | null;
  setCurrentReport: (report: EmergencyReport | null) => void;
  
  // Alerts
  alerts: Alert[];
  dismissAlert: (id: string) => void;
  
  // Flow
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetFlow: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [selectedEmergencyTypes, setSelectedEmergencyTypes] = useState<EmergencyType[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentId[]>([]);
  const [currentReport, setCurrentReport] = useState<EmergencyReport | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts);
  const [currentStep, setCurrentStep] = useState(1);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const resetFlow = () => {
    setSelectedEmergencyTypes([]);
    setSelectedDepartments([]);
    setCurrentReport(null);
    setCurrentStep(1);
  };

  return (
    <EmergencyContext.Provider
      value={{
        location,
        setLocation,
        locationPermissionGranted,
        setLocationPermissionGranted,
        selectedEmergencyTypes,
        setSelectedEmergencyTypes,
        selectedDepartments,
        setSelectedDepartments,
        currentReport,
        setCurrentReport,
        alerts,
        dismissAlert,
        currentStep,
        setCurrentStep,
        resetFlow,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
