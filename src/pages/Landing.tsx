import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  Lock,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { 
      number: '112', 
      title: 'National Emergency', 
      desc: 'All-in-One Helpline', 
      color: 'border-sky-300 bg-sky-50/70 text-[#0284C7]' 
    },
    { 
      number: '108', 
      title: 'Medical / Ambulance', 
      desc: '24/7 Trauma Ambulance', 
      color: 'border-emerald-300 bg-emerald-50/70 text-[#16845B]' 
    },
    { 
      number: '101', 
      title: 'Fire & Rescue', 
      desc: 'Fire & Hazmat Emergencies', 
      color: 'border-amber-300 bg-amber-50/70 text-[#D97706]' 
    },
    { 
      number: '100', 
      title: 'Police Control Room', 
      desc: 'Crime & Security Dispatch', 
      color: 'border-blue-300 bg-blue-50/70 text-[#285F86]' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans selection:bg-[#173B5E]/10">
      {/* Top Institutional Bar */}
      <div className="bg-[#173B5E] text-white px-3 sm:px-4 py-1.5 text-xs border-b border-[#285F86]">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase text-[10px] sm:text-[11px]">
              Emergency Response Support System (ERSS)
            </span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-white/80 text-[11px]">
              Public Safety Directorate
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
              <span>CAD Active</span>
            </span>
            <span className="text-white/40">|</span>
            <span>{currentTime || 'IST'}</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1 text-white">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 256-Bit</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#173B5E] text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-[#173B5E] tracking-tight leading-none">
                  ARES
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#F4F6F8] text-[#285F86] border border-[#DCE3EA]">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">
                Advanced Real-time Emergency Response System
              </p>
            </div>
          </div>

          <div>
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md bg-[#0EA5E9] text-white font-bold text-xs shadow-xs hover:bg-[#0284C7] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container - Fully Responsive for Mobile & Laptop Preview */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* High-Visibility Emergency Alert Popup Cards */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                role="alert"
                className="relative bg-white rounded-xl border-2 border-[#0EA5E9] shadow-lg p-4 sm:p-5 transition-all animate-slide-up"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-[#0EA5E9]" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-[#0EA5E9] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {alert.priority} Priority Alert
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#243447]">
                        {alert.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-[#64748B]">
                      {alert.location && (
                        <span className="flex items-center gap-1 font-semibold text-[#285F86]">
                          <MapPin className="w-3.5 h-3.5 text-[#285F86]" />
                          <span>{alert.location}</span>
                        </span>
                      )}
                      {alert.timestamp && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {alert.dismissible && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#243447] transition-colors cursor-pointer"
                      aria-label="Dismiss Alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Assistance Introduction */}
        <section className="bg-white rounded-xl border border-[#DCE3EA] p-5 sm:p-6 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#173B5E]/5 border border-[#173B5E]/15 text-[#173B5E] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-[#285F86]" />
            <span>National Public Safety Dispatch Network</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#173B5E] tracking-tight leading-snug">
            Emergency Assistance When It Matters Most.
          </h2>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Access emergency reporting, location-based assistance, and public safety information through one platform. Direct automated routing to nearest trauma hospitals, fire stations, and police patrols.
          </p>
        </section>

        {/* National Emergency Direct Helpline Call Buttons */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#243447] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>National Direct Helplines (Toll-Free 24x7)</span>
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">Immediate Direct Dial</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {emergencyHelplines.map((hl) => (
              <a
                key={hl.number}
                href={`tel:${hl.number}`}
                className={`p-3 sm:p-4 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all block group active:scale-98 ${hl.color}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-[#173B5E] group-hover:text-[#0EA5E9] transition-colors">
                    {hl.number}
                  </span>
                  <Phone className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#243447] transition-colors" />
                </div>
                <h4 className="font-bold text-xs text-[#243447] leading-snug truncate">{hl.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5 leading-tight truncate">{hl.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Extra-Large Report Emergency Incident Button (Located Down) */}
        <section className="pt-2 pb-4">
          <div className="bg-white rounded-2xl border-2 border-[#0EA5E9]/30 p-5 sm:p-6 shadow-md text-center space-y-3">
            <div>
              <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                Priority 1 Citizen CAD Protocol
              </span>
              <p className="text-xs text-[#64748B] mt-0.5">
                Automatically detects nearest hospital, allocates field units, and provides live road tracking.
              </p>
            </div>

            {/* Extra-Large, Prominent CTA Button */}
            <Button
              variant="emergency"
              size="xxl"
              onClick={handleReportIncident}
              className="w-full h-16 sm:h-20 rounded-xl text-lg sm:text-xl font-black bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-xl shadow-sky-500/25 gap-3 border-2 border-white/30 cursor-pointer active:scale-[0.99] transition-all"
            >
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              <div className="text-left flex-1">
                <div className="leading-tight">Report Emergency Incident</div>
                <div className="text-xs font-medium opacity-90 hidden sm:block">Tap to initiate automated multi-agency dispatch</div>
              </div>
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </Button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-[#64748B] pt-1">
              <span>✓ Verified GPS Satellite Lock</span>
              <span>•</span>
              <span>✓ AI-Optimized Agency Allocation</span>
              <span>•</span>
              <span>✓ Real Road Live Tracking</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-[#DCE3EA] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center">
            <Shield className="w-4 h-4 text-[#285F86]" />
            <span>ARES — Emergency Response Support System (ERSS)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
            <span>Version 3.2.0</span>
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
