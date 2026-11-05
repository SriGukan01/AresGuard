import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Phone, MapPin, Clock, Truck, X, Home, Shield, AlertCircle, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/context/EmergencyContext';
import { TrackingMap } from '@/components/TrackingMap';
import { getNearestHospitalName } from '@/lib/hospital';
import { departments } from '@/data/departments';
import { cn } from '@/lib/utils';
import { Location, EmergencyReport } from '@/types/emergency';

const DEFAULT_LOCATION: Location = {
  latitude: 13.0827,
  longitude: 80.2707,
  address: 'Central District Command Zone, Chennai',
  accuracy: 4,
};

const DEFAULT_REPORT: EmergencyReport = {
  id: `ERSS-${Date.now().toString().slice(-6)}`,
  location: DEFAULT_LOCATION,
  emergencyTypes: ['medical'],
  selectedDepartments: ['ambulance'],
  timestamp: new Date(),
  status: 'dispatched',
  assignedUnits: [
    {
      id: 'unit-ambulance-1',
      departmentId: 'ambulance',
      unitName: 'Apex Trauma Life Support Unit 01',
      eta: 5,
      distance: 2.1,
      status: 'en-route',
    },
  ],
};

const Tracking: React.FC = () => {
  const navigate = useNavigate();
  const { currentReport, location, setLocation, setCurrentReport, resetFlow } = useEmergency();
  
  // Arrival Countdown: 5 minutes (300 seconds) counting down to arrival
  const [remainingSeconds, setRemainingSeconds] = useState(300);

  // Instant location resolution: never block the user on a loading screen
  const activeLocation = location || DEFAULT_LOCATION;
  const activeReport = currentReport || DEFAULT_REPORT;
  const nearestHospital = getNearestHospitalName(activeLocation);

  useEffect(() => {
    if (!location) {
      setLocation(DEFAULT_LOCATION);
    }
    if (!currentReport) {
      setCurrentReport(DEFAULT_REPORT);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const liveLoc: Location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            address: 'Live Satellite Coordinates',
          };
          setLocation(liveLoc);
          if (currentReport) {
            setCurrentReport({
              ...currentReport,
              location: liveLoc,
            });
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [location, currentReport, setLocation, setCurrentReport]);

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

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans">
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#16845B]/10 border border-[#16845B]/30 flex items-center justify-center">
              <Check className="w-5 h-5 text-[#16845B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-[#173B5E] tracking-tight">
                  Field Dispatch Active
                </h1>
                <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#173B5E]/5 text-[#173B5E] border border-[#173B5E]/20">
                  {activeReport.id}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">Emergency CAD Response En Route</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="tel:112" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C62832] text-white hover:bg-[#a8222a] text-xs font-bold transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="space-y-6">
          {/* Arrival Countdown & Nearest Hospital Banner Card */}
          <div className="bg-white rounded-lg border border-[#DCE3EA] p-5 shadow-xs text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
              {remainingSeconds > 0 ? "Estimated Ambulance Arrival Time" : "Ambulance Arrived"}
            </span>

            <div className="text-4xl sm:text-5xl font-mono font-black text-[#173B5E] tracking-tight">
              {formatCountdown(remainingSeconds)}
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#F4F6F8] border border-[#DCE3EA] text-xs text-[#64748B] max-w-full">
              <span className="text-sm shrink-0">🏥</span>
              <span className="truncate">
                Dispatched from: <strong className="text-[#243447]">{nearestHospital}</strong>
              </span>
            </div>
          </div>

          {/* Map - Appears immediately */}
          <TrackingMap
            userLocation={activeLocation}
            assignedUnits={activeReport.assignedUnits || []}
          />

          {/* Responding Units Dossier */}
          <div className="bg-white rounded-lg border border-[#DCE3EA] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCE3EA] pb-3">
              <h2 className="font-bold text-sm text-[#173B5E] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#16845B]" />
                <span>Assigned Emergency Responders</span>
              </h2>
              <span className="text-[11px] font-semibold text-[#64748B]">
                {activeReport.assignedUnits?.length || 1} Unit Active
              </span>
            </div>
            
            <div className="space-y-2.5">
              {activeReport.assignedUnits?.map(unit => {
                const adjustedEta = Math.max(1, Math.ceil(remainingSeconds / 60));
                
                return (
                  <div 
                    key={unit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-[#DCE3EA] bg-[#F4F6F8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-white border border-[#DCE3EA] flex items-center justify-center text-lg text-[#C62832]">
                        <HeartPulse className="w-5 h-5 text-[#C62832]" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#243447]">{unit.unitName}</p>
                        <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-[#285F86]" />
                            {unit.distance} km
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-[#285F86]" />
                            ~{adjustedEta} min remaining
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border',
                        remainingSeconds === 0 
                          ? 'bg-[#16845B]/10 text-[#16845B] border-[#16845B]/30'
                          : 'bg-[#285F86]/10 text-[#285F86] border-[#285F86]/30'
                      )}>
                        {remainingSeconds === 0 ? 'Arrived On Site' : 'En Route'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Citizen Directives */}
          <div className="bg-white rounded-lg border border-[#DCE3EA] p-5 shadow-xs space-y-2.5 text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5 font-bold text-[#173B5E] uppercase tracking-wider text-[11px]">
              <AlertCircle className="w-4 h-4 text-[#D97706]" />
              <span>Official Citizen Guidelines While Responders Approach:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[#243447]">
              <li>Remain at your current verified GPS position. Moving increases responder acquisition time.</li>
              <li>Keep your phone line free. Dispatch operators or paramedics may call for triage updates.</li>
              <li>If after dark, switch on exterior vehicle or house lights to assist visual beaconing.</li>
              <li>Have citizen identification or patient medical notes ready for the arriving trauma team.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              className="text-xs h-10 border-[#DCE3EA] bg-white text-[#243447] hover:bg-[#F4F6F8] gap-1.5 font-semibold"
              onClick={handleReturnHome}
            >
              <Home className="w-4 h-4" />
              <span>Return to Portal Home</span>
            </Button>

            <Button
              variant="destructive"
              className="text-xs h-10 bg-[#C62832] hover:bg-[#a8222a] text-white gap-1.5 font-semibold"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
              <span>Stand Down / Cancel Request</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tracking;
