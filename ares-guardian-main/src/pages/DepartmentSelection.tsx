import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/context/EmergencyContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { DepartmentCard } from '@/components/DepartmentCard';
import { departments, emergencyTypes, getAIRecommendation } from '@/data/departments';
import { DepartmentId } from '@/types/emergency';

const steps = [
  { number: 1, label: 'Location' },
  { number: 2, label: 'Emergency' },
  { number: 3, label: 'Department' },
  { number: 4, label: 'Confirm' },
];

const DepartmentSelection: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedEmergencyTypes,
    selectedDepartments, 
    setSelectedDepartments, 
    setCurrentStep,
    location 
  } = useEmergency();

  useEffect(() => {
    setCurrentStep(3);
    // Redirect if no location or emergency type
    if (!location) {
      navigate('/location');
    } else if (selectedEmergencyTypes.length === 0) {
      navigate('/emergency-type');
    }
  }, [setCurrentStep, location, selectedEmergencyTypes, navigate]);

  // Get AI recommendations based on selected emergency types
  const recommendations = useMemo(() => {
    return getAIRecommendation(selectedEmergencyTypes, departments);
  }, [selectedEmergencyTypes]);

  // Get suggested departments based on emergency types
  const suggestedDepartmentIds = useMemo(() => {
    const ids = new Set<DepartmentId>();
    selectedEmergencyTypes.forEach(typeId => {
      const type = emergencyTypes.find(t => t.id === typeId);
      type?.departmentIds.forEach(deptId => ids.add(deptId));
    });
    return Array.from(ids);
  }, [selectedEmergencyTypes]);

  // Sort departments: suggested first, then by availability
  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => {
      const aIsSuggested = suggestedDepartmentIds.includes(a.id);
      const bIsSuggested = suggestedDepartmentIds.includes(b.id);
      
      if (aIsSuggested && !bIsSuggested) return -1;
      if (!aIsSuggested && bIsSuggested) return 1;
      
      // Then by availability
      const statusOrder = { available: 0, busy: 1, occupied: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [suggestedDepartmentIds]);

  const toggleDepartment = (deptId: DepartmentId) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(d => d !== deptId)
        : [...prev, deptId]
    );
  };

  const handleContinue = () => {
    if (selectedDepartments.length > 0) {
      navigate('/confirm');
    }
  };

  const getRecommendationForDept = (deptId: DepartmentId) => {
    return recommendations.find(r => r.departmentId === deptId);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/emergency-type')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <ProgressIndicator steps={steps} currentStep={3} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Select Department</h1>
            <p className="text-muted-foreground">
              Choose who should respond to your emergency
            </p>
          </div>

          {/* AI Recommendation Banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI-Optimized Selection</p>
              <p className="text-xs text-muted-foreground">
                Departments are sorted by availability, distance, and response time for your emergency type.
              </p>
            </div>
          </div>

          {/* Suggested Departments */}
          {suggestedDepartmentIds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Recommended for you
              </h2>
              <div className="space-y-3">
                {sortedDepartments
                  .filter(dept => suggestedDepartmentIds.includes(dept.id))
                  .map((dept, index) => {
                    const rec = getRecommendationForDept(dept.id);
                    return (
                      <DepartmentCard
                        key={dept.id}
                        department={dept}
                        isSelected={selectedDepartments.includes(dept.id)}
                        onSelect={() => toggleDepartment(dept.id)}
                        showRecommendation={index === 0 && dept.status === 'available'}
                        recommendationReason={rec?.reason}
                      />
                    );
                  })}
              </div>
            </div>
          )}

          {/* Other Departments */}
          {sortedDepartments.filter(dept => !suggestedDepartmentIds.includes(dept.id)).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Other Departments
              </h2>
              <div className="space-y-3">
                {sortedDepartments
                  .filter(dept => !suggestedDepartmentIds.includes(dept.id))
                  .map(dept => {
                    const rec = getRecommendationForDept(dept.id);
                    return (
                      <DepartmentCard
                        key={dept.id}
                        department={dept}
                        isSelected={selectedDepartments.includes(dept.id)}
                        onSelect={() => toggleDepartment(dept.id)}
                        recommendationReason={rec?.reason}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={selectedDepartments.length === 0}
          >
            Continue to Confirm
            <ArrowRight className="w-5 h-5" />
          </Button>
          {selectedDepartments.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DepartmentSelection;
