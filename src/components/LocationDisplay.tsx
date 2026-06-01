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
      <div className={cn('flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border', className)}>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30', className)}>
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-destructive">Location not available</p>
          <p className="text-sm text-muted-foreground">Please enable location or enter manually</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30', className)}>
      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
        <MapPin className="w-5 h-5 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-success">Location Detected</p>
        <p className="text-sm text-muted-foreground truncate">
          {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
        </p>
        {location.accuracy && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Accuracy: ±{Math.round(location.accuracy)}m
          </p>
        )}
      </div>
      {onRefresh && (
        <Button variant="ghost" size="icon" onClick={onRefresh} className="shrink-0">
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
