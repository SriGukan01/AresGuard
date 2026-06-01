import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/context/EmergencyContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { SOSButton } from '@/components/SOSButton';
import { LocationDisplay } from '@/components/LocationDisplay';
import { departments, emergencyTypes } from '@/data/departments';

const steps = [
  { number: 1, label: 'Location' },
  { number: 2, label: 'Emergency' },
  { number: 3, label: 'Department' },
  { number: 4, label: 'Confirm' },
];

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { 
    location,
    selectedEmergencyTypes,
    selectedDepartments,
    setCurrentStep,
    setCurrentReport,
  } = useEmergency();
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setCurrentStep(4);
    // Redirect if missing data
    if (!location) {
      navigate('/location');
    } else if (selectedEmergencyTypes.length === 0) {
      navigate('/emergency-type');
    } else if (selectedDepartments.length === 0) {
      navigate('/department-selection');
    }
  }, [setCurrentStep, location, selectedEmergencyTypes, selectedDepartments, navigate]);

  const selectedDepartmentData = departments.filter(d => 
    selectedDepartments.includes(d.id)
  );

  const selectedTypeLabels = selectedEmergencyTypes
    .map(typeId => emergencyTypes.find(t => t.id === typeId)?.label)
    .filter(Boolean);

  const minEta = Math.min(...selectedDepartmentData.map(d => d.eta || 999));

  const handleSOSActivate = () => {
    setIsActivating(true);
    
    // Create the emergency report
    setCurrentReport({
      id: `ER-${Date.now()}`,
      location: location!,
      emergencyTypes: selectedEmergencyTypes,
      selectedDepartments: selectedDepartments,
      timestamp: new Date(),
      status: 'dispatched',
      assignedUnits: selectedDepartmentData.map((dept, index) => ({
        id: `unit-${dept.id}-${index}`,
        departmentId: dept.id,
        unitName: `${dept.name} Unit ${index + 1}`,
        eta: dept.eta || 10,
        distance: dept.distance || 3,
        status: 'dispatched',
      })),
    });

    // Navigate to tracking page after short delay
    setTimeout(() => {
      navigate('/tracking');
    }, 500);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/department-selection')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <ProgressIndicator steps={steps} currentStep={4} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-card">
            <h2 className="text-lg font-bold text-center">Emergency Summary</h2>
            
            {/* Location */}
            <LocationDisplay location={location} />

            {/* Emergency Type */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Emergency Type</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTypeLabels.join(', ')}
                </p>
              </div>
            </div>

            {/* Departments */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <Shield className="w-5 h-5 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium">Responding Units</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDepartmentData.map(dept => (
                    <span 
                      key={dept.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-info/20 text-info rounded text-xs"
                    >
                      {dept.icon} {dept.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
              <Clock className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">
                Estimated Arrival: {minEta} minutes
              </span>
            </div>
          </div>

          {/* SOS Button */}
          <div className="flex flex-col items-center space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Hold the button below to send emergency alert
            </p>
            <SOSButton 
              onActivate={handleSOSActivate}
              disabled={isActivating}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
