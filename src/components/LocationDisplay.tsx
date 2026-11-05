import React from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Location } from '@/types/emergency';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationDisplayProps {
  location: Location | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  isLoading,
  onRefresh,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-white border border-[#DCE3EA] shadow-2xs', className)}>
        <div className="w-9 h-9 rounded-md bg-[#173B5E]/10 flex items-center justify-center animate-pulse">
          <Navigation className="w-4 h-4 text-[#173B5E]" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-36 bg-[#F4F6F8] rounded animate-pulse" />
          <div className="h-3 w-48 bg-[#F4F6F8] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-white border border-[#C62832]/30 shadow-2xs', className)}>
        <div className="w-9 h-9 rounded-md bg-[#C62832]/10 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-[#C62832]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs text-[#C62832]">Location Coordinate Fix Pending</p>
          <p className="text-xs text-[#64748B]">Please enable device GPS or enter address manually</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3.5 p-4 rounded-lg bg-white border border-[#DCE3EA] shadow-2xs', className)}>
      <div className="w-9 h-9 rounded-md bg-[#16845B]/10 border border-[#16845B]/20 flex items-center justify-center shrink-0">
        <MapPin className="w-4 h-4 text-[#16845B]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#16845B] uppercase tracking-wider">
            Verified Satellite GPS Fix
          </span>
          {location.accuracy && (
            <span className="text-[10px] font-mono text-[#64748B] bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DCE3EA]">
              ±{Math.round(location.accuracy)}m accuracy
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#243447] truncate mt-0.5">
          {location.address || `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`}
        </p>
      </div>
      {onRefresh && (
        <Button variant="ghost" size="icon" onClick={onRefresh} className="shrink-0 h-8 w-8 text-[#64748B] hover:text-[#243447]" title="Re-acquire GPS fix">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};
