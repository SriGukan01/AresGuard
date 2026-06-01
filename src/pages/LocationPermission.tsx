import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmergency } from '@/context/EmergencyContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { LocationDisplay } from '@/components/LocationDisplay';

const steps = [
  { number: 1, label: 'Location' },
  { number: 2, label: 'Emergency' },
  { number: 3, label: 'Department' },
  { number: 4, label: 'Confirm' },
];

const LocationPermission: React.FC = () => {
  const navigate = useNavigate();
  const { location, setLocation, setLocationPermissionGranted, setCurrentStep } = useEmergency();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setShowManualInput(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Simulate reverse geocoding
        const address = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Downtown Area)`;
        
        setLocation({
          latitude,
          longitude,
          accuracy,
          address,
        });
        setLocationPermissionGranted(true);
        setIsLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(
          err.code === 1
            ? 'Location permission denied. Please enter your address manually.'
            : 'Unable to get your location. Please try again or enter manually.'
        );
        setShowManualInput(true);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualSubmit = () => {
    if (manualAddress.trim()) {
      // Simulate geocoding with dummy coordinates
      setLocation({
        latitude: 40.7128 + Math.random() * 0.01,
        longitude: -74.006 + Math.random() * 0.01,
        address: manualAddress,
      });
      setLocationPermissionGranted(true);
    }
  };

  const handleContinue = () => {
    if (location) {
      navigate('/emergency-type');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <ProgressIndicator steps={steps} currentStep={1} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Share Your Location</h1>
            <p className="text-muted-foreground">
              We need your location to send help to the right place quickly.
            </p>
          </div>

          {/* Location Display or Request */}
          {location ? (
            <div className="space-y-4">
              <LocationDisplay
                location={location}
                onRefresh={requestLocation}
              />
              <Button
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {!showManualInput ? (
                <Button
                  variant="emergency"
                  size="xl"
                  className="w-full"
                  onClick={requestLocation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Enable Location
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Enter your address or landmark..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="h-12"
                  />
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleManualSubmit}
                    disabled={!manualAddress.trim()}
                  >
                    Confirm Location
                  </Button>
                </div>
              )}

              {!showManualInput && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowManualInput(true)}
                >
                  Enter address manually
                </Button>
              )}
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-center text-xs text-muted-foreground">
            🔒 Your location is only shared with emergency responders and is never stored.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LocationPermission;
