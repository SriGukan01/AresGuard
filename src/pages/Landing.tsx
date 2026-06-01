import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Shield, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/AlertBanner';
import { useEmergency } from '@/context/EmergencyContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, dismissAlert } = useEmergency();

  const handleReportIncident = () => {
    navigate('/location');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-emergency flex items-center justify-center shadow-button">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">SafeCity</h1>
            <p className="text-xs text-muted-foreground">Emergency Response</p>
          </div>
        </div>
        <a href="tel:911" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Emergency: 911</span>
        </a>
      </header>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
          {alerts.slice(0, 2).map(alert => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Hero Text */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              AI-Powered Response
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Emergency Help
              <br />
              <span className="text-primary">When You Need It</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Get immediate assistance with smart routing and real-time dispatch.
            </p>
          </div>

          {/* Main CTA Button */}
          <div className="pt-4">
            <Button
              variant="emergency"
              size="xxl"
              onClick={handleReportIncident}
              className="w-full max-w-xs mx-auto"
            >
              <AlertTriangle className="w-6 h-6" />
              Report Incident
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Tap to report an emergency
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            {[
              { icon: '🚨', label: 'Fast Response' },
              { icon: '🗺️', label: 'Smart Routing' },
              { icon: '📍', label: 'Live Tracking' },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <p className="text-xs text-muted-foreground">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/50">
        <p>Your safety is our priority • Available 24/7</p>
      </footer>
    </div>
  );
};

export default Landing;
