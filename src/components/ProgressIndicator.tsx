import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-1 sm:gap-3', className)}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  isCompleted && 'bg-[#16845B] text-white',
                  isCurrent && 'bg-[#173B5E] text-white ring-2 ring-[#173B5E]/30',
                  !isCompleted && !isCurrent && 'bg-white border border-[#DCE3EA] text-[#64748B]'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold hidden md:inline',
                  isCurrent ? 'text-[#173B5E]' : isCompleted ? 'text-[#243447]' : 'text-[#64748B]'
                )}
              >
                {step.label}
              </span>
            </div>
            
            {!isLast && (
              <div
                className={cn(
                  'w-4 sm:w-8 md:w-12 h-0.5 transition-colors',
                  isCompleted ? 'bg-[#16845B]' : 'bg-[#DCE3EA]'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
