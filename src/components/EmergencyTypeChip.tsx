import React from 'react';
import { EmergencyTypeOption } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { 
  Check, 
  Car, 
  Flame, 
  Waves, 
  ShieldAlert, 
  HeartPulse, 
  Shield, 
  Wind, 
  Users, 
  TrafficCone, 
  AlertCircle 
} from 'lucide-react';

interface EmergencyTypeChipProps {
  type: EmergencyTypeOption;
  isSelected: boolean;
  onToggle: () => void;
}

const typeIconMap: Record<string, React.ElementType> = {
  accident: Car,
  fire: Flame,
  flood: Waves,
  assault: ShieldAlert,
  medical: HeartPulse,
  robbery: Shield,
  'natural-disaster': Wind,
  'domestic-violence': Users,
  'traffic-jam': TrafficCone,
  other: AlertCircle,
};

export const EmergencyTypeChip: React.FC<EmergencyTypeChipProps> = ({
  type,
  isSelected,
  onToggle,
}) => {
  const Icon = typeIconMap[type.id] || AlertCircle;

  return (
    <button
      onClick={onToggle}
      type="button"
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all duration-150 cursor-pointer shadow-2xs',
        isSelected
          ? 'border-[#173B5E] bg-[#173B5E]/5 text-[#173B5E] ring-1 ring-[#173B5E]'
          : 'border-[#DCE3EA] bg-white text-[#243447] hover:border-[#285F86]/40 hover:bg-[#F4F6F8]'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors',
        isSelected ? 'bg-[#173B5E] text-white' : 'bg-[#F4F6F8] text-[#285F86]'
      )}>
        <Icon className="w-4 h-4" />
      </div>

      <span className="font-semibold text-sm flex-1">{type.label}</span>

      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[#173B5E] flex items-center justify-center ml-auto shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};
