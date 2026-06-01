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
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/location')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <ProgressIndicator steps={steps} currentStep={2} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">What's the emergency?</h1>
            <p className="text-muted-foreground">
              Select one or more that apply
            </p>
          </div>

          {/* Emergency Types Grid */}
          <div className="grid grid-cols-2 gap-3">
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
            <div className="text-center text-sm text-muted-foreground animate-fade-in">
              {selectedEmergencyTypes.length} type{selectedEmergencyTypes.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={selectedEmergencyTypes.length === 0}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EmergencyTypeSelection;
