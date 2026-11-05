import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
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

  // Automated recommendations based on selected emergency types
  const recommendations = useMemo(() => {
    return getAIRecommendation(selectedEmergencyTypes, departments);
  }, [selectedEmergencyTypes]);

  // Suggested departments based on emergency types
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
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/emergency-type')}
            className="text-[#64748B] hover:text-[#243447] gap-1 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Incident Type</span>
          </Button>

          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={3} />
          </div>

          <div className="w-16 text-right text-[11px] font-mono text-[#64748B] hidden sm:block">
            Step 3 of 4
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-lg border border-[#DCE3EA] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Title */}
          <div className="border-b border-[#DCE3EA] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#285F86] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#16845B]" />
              <span>Agency Allocation Protocol</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight">
              Select Responding Departments
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Confirm which emergency services should be dispatched. Pre-selected units are based on your reported incident classification.
            </p>
          </div>

          {/* Allocation Guideline Banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-50/70 border border-blue-200">
            <Activity className="w-4 h-4 text-[#285F86] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#173B5E]">CAD Dispatch Optimization Active: </span>
              <span className="text-[#64748B]">
                Units are sorted by real-time station proximity, operational readiness, and estimated street response time.
              </span>
            </div>
          </div>

          {/* Suggested Departments */}
          {suggestedDepartmentIds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Priority Responding Agencies
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

          {/* Other Available Departments */}
          {sortedDepartments.filter(dept => !suggestedDepartmentIds.includes(dept.id)).length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Additional Support Agencies
              </h2>
              <div className="space-y-3">
                {sortedDepartments
                  .filter(dept => !suggestedDepartmentIds.includes(dept.id))
                  .map(dept => (
                    <DepartmentCard
                      key={dept.id}
                      department={dept}
                      isSelected={selectedDepartments.includes(dept.id)}
                      onSelect={() => toggleDepartment(dept.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Selection Status & Action */}
          <div className="pt-4 border-t border-[#DCE3EA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-medium text-[#64748B]">
              {selectedDepartments.length === 0 ? (
                <span className="text-[#C62832] font-semibold">
                  • Please select at least one responding agency.
                </span>
              ) : (
                <span className="text-[#173B5E] font-semibold">
                  ✓ {selectedDepartments.length} agenc{selectedDepartments.length !== 1 ? 'ies' : 'y'} selected for dispatch.
                </span>
              )}
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-11 px-8 rounded-md shadow-xs gap-2"
              onClick={handleContinue}
              disabled={selectedDepartments.length === 0}
            >
              <span>Review & Authorize Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentSelection;
