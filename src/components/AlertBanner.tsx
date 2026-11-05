import React from 'react';
import { X, AlertTriangle, Shield, Info, CloudRain, MapPin, Clock } from 'lucide-react';
import { Alert } from '@/types/emergency';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  alert: Alert;
  onDismiss: () => void;
}

const alertStyles = {
  disaster: {
    bg: 'bg-red-50/70 border-red-200 text-[#243447]',
    icon: CloudRain,
    iconColor: 'text-[#C62832]',
    badge: 'bg-[#C62832] text-white',
  },
  warning: {
    bg: 'bg-amber-50/70 border-amber-200 text-[#243447]',
    icon: AlertTriangle,
    iconColor: 'text-[#D97706]',
    badge: 'bg-[#D97706] text-white',
  },
  safety: {
    bg: 'bg-blue-50/70 border-blue-200 text-[#243447]',
    icon: Shield,
    iconColor: 'text-[#285F86]',
    badge: 'bg-[#285F86] text-white',
  },
  info: {
    bg: 'bg-slate-50 border-[#DCE3EA] text-[#243447]',
    icon: Info,
    iconColor: 'text-[#64748B]',
    badge: 'bg-[#64748B] text-white',
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const style = alertStyles[alert.type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3.5 p-4 rounded-lg border shadow-xs transition-all',
        style.bg
      )}
      role="alert"
    >
      <div className={cn('p-1.5 rounded-md bg-white border border-inherit shrink-0')}>
        <Icon className={cn('w-4 h-4', style.iconColor)} />
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className="font-bold text-sm text-[#243447] tracking-tight">{alert.title}</h4>
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider', style.badge)}>
            {alert.priority} Priority
          </span>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">{alert.message}</p>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#64748B]">
          {alert.location && (
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-[#285F86]" />
              {alert.location}
            </span>
          )}
          {alert.timestamp && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {alert.dismissible && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded hover:bg-black/5 text-[#64748B] hover:text-[#243447] transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
