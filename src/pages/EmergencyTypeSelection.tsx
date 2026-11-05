import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/context/EmergencyContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { EmergencyTypeChip } from '@/components/EmergencyTypeChip';
import { emergencyTypes } from '@/data/departments';
import { EmergencyType } from '@/types/emergency';

const steps = [
  { number: 1, label: 'Location' },
  { number: 2, label: 'Emergency' },
  { number: 3, label: 'Department' },
  { number: 4, label: 'Confirm' },
];

const EmergencyTypeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedEmergencyTypes, 
    setSelectedEmergencyTypes, 
    setCurrentStep,
    location 
  } = useEmergency();

  useEffect(() => {
    setCurrentStep(2);
    // Redirect if no location
    if (!location) {
      navigate('/location');
    }
  }, [setCurrentStep, location, navigate]);

  const toggleEmergencyType = (typeId: EmergencyType) => {
    setSelectedEmergencyTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleContinue = () => {
    if (selectedEmergencyTypes.length > 0) {
      navigate('/department-selection');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans">
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/location')}
            className="text-[#64748B] hover:text-[#243447] gap-1 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Location</span>
          </Button>

          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={2} />
          </div>

          <div className="w-16 text-right text-[11px] font-mono text-[#64748B] hidden sm:block">
            Step 2 of 4
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-lg border border-[#DCE3EA] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Title */}
          <div className="border-b border-[#DCE3EA] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#285F86] uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <span>Incident Classification Protocol</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight">
              What type of emergency is occurring?
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Select one or more categories below. Multi-agency triage will allocate the corresponding emergency personnel.
            </p>
          </div>

          {/* Emergency Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyTypes.map(type => (
              <EmergencyTypeChip
                key={type.id}
                type={type}
                isSelected={selectedEmergencyTypes.includes(type.id)}
                onToggle={() => toggleEmergencyType(type.id)}
              />
            ))}
          </div>

          {/* Selection Status & Action */}
          <div className="pt-4 border-t border-[#DCE3EA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-medium text-[#64748B]">
              {selectedEmergencyTypes.length === 0 ? (
                <span className="text-[#C62832] font-semibold">
                  • Please select at least one incident category to proceed.
                </span>
              ) : (
                <span className="text-[#173B5E] font-semibold">
                  ✓ {selectedEmergencyTypes.length} category{selectedEmergencyTypes.length !== 1 ? 's' : ''} classified for dispatch.
                </span>
              )}
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-11 px-8 rounded-md shadow-xs gap-2"
              onClick={handleContinue}
              disabled={selectedEmergencyTypes.length === 0}
            >
              <span>Continue to Agency Selection</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyTypeSelection;
