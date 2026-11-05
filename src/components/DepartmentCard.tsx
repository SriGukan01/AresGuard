import React from 'react';
import { Department, AvailabilityStatus } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Users, 
  HeartPulse, 
  Flame, 
  Shield, 
  LifeBuoy, 
  UserCheck, 
  Truck 
} from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  isSelected: boolean;
  onSelect: () => void;
  showRecommendation?: boolean;
  recommendationReason?: string;
}

const deptIconMap: Record<string, React.ElementType> = {
  ambulance: HeartPulse,
  fire: Flame,
  police: Shield,
  disaster: LifeBuoy,
  'women-child': UserCheck,
  traffic: Truck,
};

const statusConfig: Record<AvailabilityStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
  available: {
    label: 'Ready / Available',
    badgeClass: 'text-[#16845B] bg-[#16845B]/10 border-[#16845B]/30',
    icon: Check,
  },
  busy: {
    label: 'Units Dispatched',
    badgeClass: 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/30',
    icon: Clock,
  },
  occupied: {
    label: 'At Capacity',
    badgeClass: 'text-[#C62832] bg-[#C62832]/10 border-[#C62832]/30',
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
  const status = statusConfig[department.status] || statusConfig.available;
  const StatusIcon = status.icon;
  const DeptIcon = deptIconMap[department.id] || Shield;

  return (
    <button
      onClick={onSelect}
      type="button"
      className={cn(
        'relative w-full p-4 rounded-lg border text-left transition-all duration-150 cursor-pointer shadow-2xs',
        isSelected
          ? 'border-[#173B5E] bg-[#173B5E]/5 ring-1 ring-[#173B5E]'
          : 'border-[#DCE3EA] bg-white hover:border-[#285F86]/40 hover:bg-[#F4F6F8]',
        department.status === 'occupied' && 'opacity-85'
      )}
    >
      {showRecommendation && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-[#173B5E] text-white text-[11px] font-bold rounded-sm shadow-xs uppercase tracking-wider">
          Recommended Unit
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div className={cn(
          'w-10 h-10 rounded-md flex items-center justify-center shrink-0 border transition-colors',
          isSelected ? 'bg-[#173B5E] text-white border-[#173B5E]' : 'bg-[#F4F6F8] text-[#285F86] border-[#DCE3EA]'
        )}>
          <DeptIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="font-bold text-sm text-[#243447] truncate">{department.name}</h3>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-[#173B5E] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <p className="text-xs text-[#64748B] mb-2.5">{department.description}</p>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border', status.badgeClass)}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            
            {department.estimatedWaitTime && department.status !== 'available' && (
              <span className="text-[11px] text-[#64748B]">
                ~{department.estimatedWaitTime} min estimated delay
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#64748B] border-t border-[#DCE3EA]/60 pt-2">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-[#285F86]" />
              {department.distance} km
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-[#285F86]" />
              ETA: {department.eta} min
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3 h-3 text-[#285F86]" />
              {department.availableUnits}/{department.units} active units
            </span>
          </div>

          {recommendationReason && (
            <p className="text-[11px] text-[#285F86] bg-[#285F86]/10 p-1.5 rounded mt-2 border border-[#285F86]/20">
              {recommendationReason}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
