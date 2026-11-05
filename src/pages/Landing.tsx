import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  MapPin, 
  Clock, 
  HeartPulse, 
  Flame, 
  LifeBuoy, 
  ChevronRight, 
  Lock,
  Activity,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/AlertBanner';
import { useEmergency } from '@/context/EmergencyContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, dismissAlert } = useEmergency();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReportIncident = () => {
    navigate('/location');
  };

  const emergencyHelplines = [
    { number: '112', title: 'National Emergency Helpline', desc: 'Police, Fire, Medical & Disaster Response', highlight: 'border-red-300 bg-red-50/40 text-[#C62832]' },
    { number: '108', title: 'Emergency Medical / Ambulance', desc: 'Toll-free 24/7 ALS/BLS Trauma Ambulance', highlight: 'border-emerald-300 bg-emerald-50/40 text-[#16845B]' },
    { number: '101', title: 'Fire & Rescue Services', desc: 'Fire incidents, industrial & hazmat rescue', highlight: 'border-amber-300 bg-amber-50/40 text-[#D97706]' },
    { number: '100', title: 'Police Control Room', desc: 'Crime reporting, law enforcement & security', highlight: 'border-blue-300 bg-blue-50/40 text-[#285F86]' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans selection:bg-[#173B5E]/10">
      {/* Top Institutional Bar */}
      <div className="bg-[#173B5E] text-white px-4 py-1.5 text-xs border-b border-[#285F86]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase text-[11px]">
              Emergency Response Support System (ERSS)
            </span>
            <span className="text-white/40">|</span>
            <span className="hidden sm:inline text-white/80 text-[11px]">
              Public Safety & Computer-Aided Dispatch Directorate
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
              <span>CAD Nodes Online</span>
            </span>
            <span className="text-white/40">|</span>
            <span>{currentTime || 'IST'}</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1 text-white">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 256-Bit</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#173B5E] text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-[#173B5E] tracking-tight leading-none">
                  ARES
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F4F6F8] text-[#285F86] border border-[#DCE3EA]">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">
                Advanced Real-time Emergency Response System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#C62832] text-white font-bold text-xs shadow-xs hover:bg-[#a8222a] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Emergency: 112</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Active Emergency Public Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#243447] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>Active Public Safety Notices</span>
              </h3>
              <span className="text-[11px] font-medium text-[#64748B]">
                {alerts.length} Bulletin{alerts.length > 1 ? 's' : ''} in Effect
              </span>
            </div>
            {alerts.slice(0, 3).map((alert) => (
              <AlertBanner
                key={alert.id}
                alert={alert}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Hero Incident Reporting Container */}
        <section className="bg-white rounded-lg border border-[#DCE3EA] p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173B5E]/5 border border-[#173B5E]/15 text-[#173B5E] text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-[#285F86]" />
              <span>National Computer-Aided Dispatch (CAD) Platform</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#173B5E] tracking-tight leading-snug">
              Emergency Assistance When It Matters Most.
            </h2>

            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Access emergency reporting, location-based assistance, and public safety information through one platform. Direct routing to nearest trauma centers, police control, and fire rescue units.
            </p>

            {/* Prominent Emergency Reporting Action */}
            <div className="pt-4 pb-2 flex flex-col items-center">
              <Button
                variant="emergency"
                size="xl"
                onClick={handleReportIncident}
                className="w-full max-w-md h-14 text-base font-bold gap-3 rounded-lg shadow-sm"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Report Emergency Incident</span>
                <ChevronRight className="w-5 h-5 ml-auto" />
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                  Verified GPS Coordinates
                </span>
                <span className="text-[#DCE3EA]">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                  Zero Manual Intake Delay
                </span>
                <span className="text-[#DCE3EA]">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                  Live Street Tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick-Access Public Safety Services */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#243447]">
              Coordinated Public Safety Services
            </h3>
            <span className="text-[11px] font-medium text-[#64748B]">Inter-Agency Operations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Medical & Trauma Care',
                dept: 'Ambulance / ALS',
                desc: 'Rapid deployment of Advanced Life Support ambulances with hospital telemetry link.',
                icon: HeartPulse,
                color: 'text-[#C62832] bg-red-50 border-red-200',
              },
              {
                title: 'Fire & Hazmat Rescue',
                dept: 'Fire Services',
                desc: 'Emergency fire suppression, structural collapses, and toxic industrial hazard response.',
                icon: Flame,
                color: 'text-[#D97706] bg-amber-50 border-amber-200',
              },
              {
                title: 'Police & Public Safety',
                dept: 'Law Enforcement',
                desc: 'Rapid law & order intervention, crime containment, and civilian safety protection.',
                icon: Shield,
                color: 'text-[#285F86] bg-blue-50 border-blue-200',
              },
              {
                title: 'Disaster Relief Force',
                dept: 'Disaster Response',
                desc: 'Floods, severe weather, natural disaster evacuation and civil defense coordination.',
                icon: LifeBuoy,
                color: 'text-[#16845B] bg-emerald-50 border-emerald-200',
              },
            ].map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={service.title}
                  className="p-4 rounded-lg bg-white border border-[#DCE3EA] shadow-2xs space-y-2.5 transition-all hover:border-[#285F86]/40"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center border ${service.color}`}>
                      <ServiceIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE3EA]">
                      {service.dept}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#243447]">{service.title}</h4>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* National Emergency Helplines Official Directory */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#243447]">
              National Direct Helplines (Toll-Free 24x7)
            </h3>
            <span className="text-[11px] font-medium text-[#64748B]">Immediate Voice Assistance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyHelplines.map((hl) => (
              <a
                key={hl.number}
                href={`tel:${hl.number}`}
                className={`p-4 rounded-lg border bg-white shadow-2xs transition-all hover:shadow-xs block group ${hl.highlight}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-2xl font-black tracking-tight text-[#173B5E] group-hover:text-[#C62832] transition-colors">
                    {hl.number}
                  </span>
                  <Phone className="w-4 h-4 text-[#64748B] group-hover:text-[#243447] transition-colors" />
                </div>
                <h4 className="font-bold text-xs text-[#243447]">{hl.title}</h4>
                <p className="text-[11px] text-[#64748B] mt-1 leading-snug">{hl.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Official Governance & Compliance Footer */}
        <footer className="pt-6 border-t border-[#DCE3EA] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#285F86]" />
            <span>ARES Public Safety Portal • Designed for Official Emergency Dispatch Operations</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
            <span>Version 3.2-PublicSector</span>
            <span>•</span>
            <button
              onClick={() => navigate('/tracking')}
              className="hover:text-[#173B5E] font-medium transition-colors cursor-pointer"
            >
              Active CAD Tracking
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
