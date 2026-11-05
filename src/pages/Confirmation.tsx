import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Clock, Shield, CheckCircle2, Phone } from 'lucide-react';
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

  const minEta = Math.min(...selectedDepartmentData.map(d => d.eta || 5));

  const handleSOSActivate = () => {
    setIsActivating(true);
    
    // Create the official emergency report
    setCurrentReport({
      id: `ERSS-${Date.now().toString().slice(-6)}`,
      location: location!,
      emergencyTypes: selectedEmergencyTypes,
      selectedDepartments: selectedDepartments,
      timestamp: new Date(),
      status: 'dispatched',
      assignedUnits: selectedDepartmentData.map((dept, index) => ({
        id: `unit-${dept.id}-${index}`,
        departmentId: dept.id,
        unitName: `${dept.name} Unit ${index + 1}`,
        eta: dept.eta || 5,
        distance: dept.distance || 2.1,
        status: 'dispatched',
      })),
    });

    // Navigate to tracking page
    setTimeout(() => {
      navigate('/tracking');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans">
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/department-selection')}
            className="text-[#64748B] hover:text-[#243447] gap-1 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Agencies</span>
          </Button>

          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={4} />
          </div>

          <div className="w-16 text-right text-[11px] font-mono text-[#64748B] hidden sm:block">
            Step 4 of 4
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-lg border border-[#DCE3EA] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Title */}
          <div className="border-b border-[#DCE3EA] pb-4 text-center">
            <span className="text-xs font-bold text-[#C62832] uppercase tracking-wider">
              Final CAD Dispatch Authorization
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight mt-1">
              Confirm Emergency Deployment
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Verify your incident telemetry below, then hold the authorization button to notify field units.
            </p>
          </div>

          {/* Dossier Summary Elements */}
          <div className="space-y-3.5">
            {/* Location */}
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Verified Incident Location
              </span>
              <LocationDisplay location={location} />
            </div>

            {/* Emergency Type & Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-[#DCE3EA] bg-[#F4F6F8] space-y-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Incident Classification
                </span>
                <p className="font-bold text-sm text-[#243447]">
                  {selectedTypeLabels.join(', ') || 'General Emergency'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-[#DCE3EA] bg-[#F4F6F8] space-y-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Expected First Arrival
                </span>
                <p className="font-mono font-black text-sm text-[#16845B]">
                  ~{minEta} minutes ETA
                </p>
              </div>
            </div>

            {/* Responding Units Details */}
            <div className="p-3.5 rounded-lg border border-[#DCE3EA] bg-white space-y-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Allocated Field Units ({selectedDepartmentData.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDepartmentData.map(dept => (
                  <span 
                    key={dept.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#173B5E]/5 border border-[#173B5E]/20 text-[#173B5E] rounded text-xs font-semibold"
                  >
                    <span className="text-sm">{dept.icon}</span>
                    <span>{dept.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Authorization SOS Button */}
          <div className="pt-2 pb-2 flex flex-col items-center">
            <SOSButton 
              onActivate={handleSOSActivate}
              disabled={isActivating}
            />
          </div>

          {/* Direct Voice Dial Backup */}
          <div className="border-t border-[#DCE3EA] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <span>Need immediate voice operator connection?</span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 text-[#C62832] font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112 Directly</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
