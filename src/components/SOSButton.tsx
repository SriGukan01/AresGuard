import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <div className={cn('relative', className)}>
      {/* Outer pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-48 h-48 rounded-full bg-primary/20 animate-pulse-ring" />
        <div className="absolute w-48 h-48 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-48 h-48 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main button */}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        disabled={disabled}
        className={cn(
          'relative w-40 h-40 rounded-full gradient-emergency shadow-button',
          'flex flex-col items-center justify-center gap-1',
          'transition-transform duration-200',
          'focus:outline-none focus:ring-4 focus:ring-primary/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isPressed && 'scale-95',
          !disabled && 'hover:scale-105 cursor-pointer'
        )}
      >
        {/* Progress ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${holdProgress * 3.02} 302`}
            className="transition-all duration-100"
          />
        </svg>

        <span className="text-4xl font-black text-primary-foreground tracking-wider z-10">
          SOS
        </span>
        <span className="text-xs text-primary-foreground/80 font-medium z-10">
          HOLD TO ACTIVATE
        </span>
      </button>
    </div>
  );
};
