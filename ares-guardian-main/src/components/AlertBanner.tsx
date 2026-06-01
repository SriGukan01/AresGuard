import React from 'react';
import { X, AlertTriangle, Shield, Info, CloudRain } from 'lucide-react';
import { Alert } from '@/types/emergency';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  alert: Alert;
  onDismiss: () => void;
}

const alertStyles = {
  disaster: {
    bg: 'bg-destructive/20 border-destructive/50',
    icon: CloudRain,
    iconColor: 'text-destructive',
  },
  warning: {
    bg: 'bg-warning/20 border-warning/50',
    icon: AlertTriangle,
    iconColor: 'text-warning',
  },
  safety: {
    bg: 'bg-info/20 border-info/50',
    icon: Shield,
    iconColor: 'text-info',
  },
  info: {
    bg: 'bg-muted border-border',
    icon: Info,
    iconColor: 'text-muted-foreground',
  },
};

const priorityBadge = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-destructive/80 text-destructive-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-muted text-muted-foreground',
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const style = alertStyles[alert.type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border animate-slide-up',
        style.bg
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', style.iconColor)} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm">{alert.title}</h4>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', priorityBadge[alert.priority])}>
            {alert.priority.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{alert.message}</p>
        {alert.location && (
          <p className="text-xs text-muted-foreground/70 mt-1">📍 {alert.location}</p>
        )}
      </div>

      {alert.dismissible && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-background/50 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};
