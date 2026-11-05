import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
  className?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onActivate,
  disabled,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdDuration = 1200; // 1.2 seconds to activate
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleStart = () => {
    if (disabled) return;
    clearTimers();
    setIsPressed(true);
    setHoldProgress(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / holdDuration) * 100, 100);
      setHoldProgress(progress);
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      clearTimers();
      setHoldProgress(100);
      setIsPressed(false);
      onActivate();
    }, holdDuration);
  };

  const handleEnd = () => {
    setIsPressed(false);
    setHoldProgress(0);
    clearTimers();
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        disabled={disabled}
        type="button"
        className={cn(
          'relative w-40 h-40 rounded-full bg-[#C62832] text-white',
          'flex flex-col items-center justify-center gap-1.5 shadow-md',
          'transition-all duration-150 border-4 border-white select-none',
          'focus:outline-none focus:ring-4 focus:ring-[#C62832]/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isPressed ? 'scale-95 bg-[#a8222a]' : 'hover:bg-[#b5242d] cursor-pointer'
        )}
        aria-label="Hold to confirm emergency dispatch"
      >
        {/* Progress SVG Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        <AlertTriangle className="w-8 h-8 text-white stroke-[2.5]" />
        <span className="text-xl font-black tracking-wider uppercase">SOS</span>
        <span className="text-[10px] font-bold tracking-normal opacity-90 uppercase">
          {isPressed ? 'HOLDING...' : 'HOLD TO CONFIRM'}
        </span>
      </button>

      <p className="text-xs font-semibold text-[#64748B] mt-3">
        Hold for 1.2 seconds to authorize dispatch
      </p>
    </div>
  );
};
