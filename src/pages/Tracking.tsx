import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Phone, MapPin, Clock, Truck, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/context/EmergencyContext';
import { TrackingMap } from '@/components/TrackingMap';
import { departments } from '@/data/departments';
import { cn } from '@/lib/utils';

const Tracking: React.FC = () => {
  const navigate = useNavigate();
  const { currentReport, location, resetFlow } = useEmergency();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!currentReport || !location) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentReport, location, navigate]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel the emergency request?')) {
      resetFlow();
      navigate('/');
    }
  };

  const handleReturnHome = () => {
    resetFlow();
    navigate('/');
  };

  if (!currentReport || !location) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const assignedDepts = currentReport.assignedUnits?.map(unit => 
    departments.find(d => d.id === unit.departmentId)
  ).filter(Boolean) || [];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center animate-pulse">
            <Check className="w-5 h-5 text-success-foreground" />
          </div>
          <div>
            <h1 className="font-bold">Help is on the way!</h1>
            <p className="text-sm text-muted-foreground">ID: {currentReport.id}</p>
          </div>
        </div>
        <a 
          href="tel:911" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Call 911</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Time elapsed</p>
            <p className="text-3xl font-mono font-bold text-primary">
              {formatTime(elapsedSeconds)}
            </p>
          </div>

          {/* Map */}
          <TrackingMap
            userLocation={location}
            assignedUnits={currentReport.assignedUnits || []}
          />

          {/* Responding Units */}
          <div className="space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Truck className="w-5 h-5 text-success" />
              Responding Units
            </h2>
            
            <div className="space-y-2">
              {currentReport.assignedUnits?.map(unit => {
                const dept = departments.find(d => d.id === unit.departmentId);
                const adjustedEta = Math.max(1, unit.eta - Math.floor(elapsedSeconds / 60));
                
                return (
                  <div 
                    key={unit.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="text-2xl">{dept?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{unit.unitName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {unit.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {adjustedEta} min
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      unit.status === 'dispatched' && 'bg-warning/20 text-warning',
                      unit.status === 'en-route' && 'bg-info/20 text-info',
                      unit.status === 'arrived' && 'bg-success/20 text-success',
                    )}>
                      {unit.status === 'dispatched' && 'Dispatched'}
                      {unit.status === 'en-route' && 'En Route'}
                      {unit.status === 'arrived' && 'Arrived'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Location */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Your Location</p>
                <p className="text-sm text-muted-foreground">
                  {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="p-4 rounded-xl bg-info/10 border border-info/30">
            <h3 className="font-semibold text-info mb-2">Stay Safe</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Stay in a safe location if possible</li>
              <li>• Keep your phone charged and nearby</li>
              <li>• Follow instructions from responders</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            <X className="w-4 h-4" />
            Cancel Request
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleReturnHome}
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Tracking;
