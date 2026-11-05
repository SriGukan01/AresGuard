import React from 'react';
import { Department, AvailabilityStatus } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, MapPin, Users } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  isSelected: boolean;
  onSelect: () => void;
  showRecommendation?: boolean;
  recommendationReason?: string;
}

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; icon: React.ElementType }> = {
  available: {
    label: 'Available',
    color: 'text-[#16845B] bg-[#16845B]/15 border-[#16845B]/30',
    icon: Check,
  },
  busy: {
    label: 'Busy',
    color: 'text-[#D97706] bg-[#D97706]/15 border-[#D97706]/30',
    icon: Clock,
  },
  occupied: {
    label: 'Fully Occupied',
    color: 'text-[#C62832] bg-[#C62832]/15 border-[#C62832]/30',
    icon: AlertCircle,
  },
};

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  isSelected,
  onSelect,
  showRecommendation,
  recommendationReason,
}) => {
  const status = statusConfig[department.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onSelect}
      type="button"
      className={cn(
        'relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer',
        'hover:border-[#173B5E]/50 active:scale-[0.99]',
        isSelected
          ? 'border-[#173B5E] bg-[#173B5E]/5 shadow-sm'
          : 'border-[#DCE3EA] bg-white hover:bg-[#F4F6F8]',
        department.status === 'occupied' && 'opacity-75'
      )}
    >
      {showRecommendation && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-[#173B5E] text-white text-xs font-bold rounded-full shadow-xs">
          AI Recommended
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div className="text-3xl select-none shrink-0">{department.icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-[#243447] truncate">{department.name}</h3>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-[#173B5E] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-[#64748B] mb-3">{department.description}</p>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border', status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            
            {department.estimatedWaitTime && department.status !== 'available' && (
              <span className="text-xs text-[#64748B]">
                ~{department.estimatedWaitTime} min wait
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#64748B] border-t border-[#DCE3EA]/60 pt-2 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#285F86]" />
              {department.distance} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#285F86]" />
              ETA: {department.eta} min
            </span>
            <span className="flex items-center gap-1 font-semibold text-[#173B5E]">
              <Users className="w-3.5 h-3.5 text-[#285F86]" />
              {department.availableUnits}/{department.units} units available
            </span>
          </div>

          {recommendationReason && (
            <p className="mt-2 text-xs text-[#173B5E] bg-[#173B5E]/5 p-2 rounded-md border border-[#173B5E]/15 italic">
              💡 {recommendationReason}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default DepartmentCard;
