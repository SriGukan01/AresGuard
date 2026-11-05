import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
      {/* Header */}
      <header className="p-3 sm:p-4 bg-white border-b border-[#DCE3EA] sticky top-0 z-40 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/location')} className="h-9 w-9 text-[#64748B]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={2} />
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight">What's the emergency?</h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Select one or more that apply
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

          {/* Selected Count */}
          {selectedEmergencyTypes.length > 0 && (
            <div className="text-center text-xs font-semibold text-[#173B5E] bg-[#173B5E]/5 py-2 px-3 rounded-full max-w-xs mx-auto border border-[#173B5E]/15 animate-fade-in">
              ✓ {selectedEmergencyTypes.length} type{selectedEmergencyTypes.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="p-4 border-t border-[#DCE3EA] bg-white sticky bottom-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-12 rounded-lg text-sm sm:text-base gap-2 shadow-xs"
            onClick={handleContinue}
            disabled={selectedEmergencyTypes.length === 0}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EmergencyTypeSelection;
