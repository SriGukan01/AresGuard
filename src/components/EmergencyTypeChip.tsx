import React from 'react';
import { EmergencyTypeOption } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface EmergencyTypeChipProps {
  type: EmergencyTypeOption;
  isSelected: boolean;
  onToggle: () => void;
}

const typeIcons: Record<string, string> = {
  accident: '🚗',
  fire: '🔥',
  flood: '🌊',
  assault: '⚠️',
  medical: '🏥',
  robbery: '🚨',
  'natural-disaster': '🌪️',
  'domestic-violence': '🏠',
  'traffic-jam': '🚦',
  other: '❓',
};

export const EmergencyTypeChip: React.FC<EmergencyTypeChipProps> = ({
  type,
  isSelected,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      type="button"
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer',
        'hover:border-[#173B5E]/50 active:scale-[0.98]',
        isSelected
          ? 'border-[#173B5E] bg-[#173B5E]/5 text-[#173B5E] shadow-xs'
          : 'border-[#DCE3EA] bg-white text-[#243447] hover:bg-[#F4F6F8]'
      )}
    >
      <span className="text-2xl select-none shrink-0">{typeIcons[type.id] || '⚠️'}</span>
      <span className="font-bold text-sm flex-1">{type.label}</span>
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[#173B5E] flex items-center justify-center ml-auto shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};

export default EmergencyTypeChip;
