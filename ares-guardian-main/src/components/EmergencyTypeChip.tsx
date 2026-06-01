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
      className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
        'hover:border-primary/50 active:scale-[0.98]',
        isSelected
          ? 'border-primary bg-primary/10 shadow-glow'
          : 'border-border bg-card hover:bg-secondary/50'
      )}
    >
      <span className="text-xl">{typeIcons[type.id]}</span>
      <span className="font-medium text-sm">{type.label}</span>
      {isSelected && (
        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center ml-auto">
          <Check className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
};
