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
    color: 'text-success bg-success/20 border-success/50',
    icon: Check,
  },
  busy: {
    label: 'Busy',
    color: 'text-warning bg-warning/20 border-warning/50',
    icon: Clock,
  },
  occupied: {
    label: 'Fully Occupied',
    color: 'text-destructive bg-destructive/20 border-destructive/50',
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
      className={cn(
        'relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
        'hover:border-primary/50 active:scale-[0.98]',
        isSelected
          ? 'border-primary bg-primary/10 shadow-glow'
          : 'border-border bg-card hover:bg-secondary/50',
        department.status === 'occupied' && 'opacity-75'
      )}
    >
      {showRecommendation && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
          AI Recommended
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-3xl">{department.icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{department.name}</h3>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{department.description}</p>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            
            {department.estimatedWaitTime && department.status !== 'available' && (
              <span className="text-xs text-muted-foreground">
                ~{department.estimatedWaitTime} min wait
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {department.distance} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ETA: {department.eta} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {department.availableUnits}/{department.units} units
            </span>
          </div>

          {recommendationReason && (
            <p className="mt-2 text-xs text-primary/80 italic">
              💡 {recommendationReason}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
