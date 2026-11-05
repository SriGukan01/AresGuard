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

  // Auto-select suggested departments if none selected yet
  useEffect(() => {
    if (selectedDepartments.length === 0 && suggestedDepartmentIds.length > 0) {
      setSelectedDepartments(suggestedDepartmentIds);
    }
  }, [suggestedDepartmentIds, selectedDepartments.length, setSelectedDepartments]);

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
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans">
      {/* Header */}
      <header className="p-3 sm:p-4 bg-white border-b border-[#DCE3EA] sticky top-0 z-40 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/emergency-type')} className="h-9 w-9 text-[#64748B]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={3} />
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight">Select Department</h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Choose who should respond to your emergency
            </p>
          </div>

          {/* AI Recommendation Banner */}
          <div className="flex items-start sm:items-center gap-3 p-4 rounded-xl bg-white border border-[#DCE3EA] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#173B5E]/10 border border-[#173B5E]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#173B5E]" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#173B5E]">AI-Optimized Selection</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Departments are sorted by availability, distance, and response time for your emergency type.
              </p>
            </div>
          </div>

          {/* Suggested Departments */}
          {suggestedDepartmentIds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
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
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
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

      {/* Sticky Bottom Actions */}
      <footer className="p-4 border-t border-[#DCE3EA] bg-white sticky bottom-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto space-y-2">
          <Button
            size="lg"
            className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-12 rounded-lg text-sm sm:text-base gap-2 shadow-xs"
            onClick={handleContinue}
            disabled={selectedDepartments.length === 0}
          >
            <span>Continue to Confirm</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          {selectedDepartments.length > 0 && (
            <p className="text-center text-xs text-[#64748B] font-medium">
              {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DepartmentSelection;
