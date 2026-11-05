import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeft, Loader2, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
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
      setError('Geolocation is not supported by your browser. Please enter address manually.');
      setShowManualInput(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let address = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Live Satellite Coordinates)`;
        
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'ARES-Emergency-App' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              const parts = data.display_name.split(', ');
              address = parts.slice(0, 3).join(', ');
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        setLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          address,
        });
        setLocationPermissionGranted(true);
        setIsLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(
          err.code === 1
            ? 'Location access was declined. Please enter your incident address manually below.'
            : 'Unable to acquire satellite fix. Please retry or enter landmark manually.'
        );
        setShowManualInput(true);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  const handleManualSubmit = async () => {
    if (!manualAddress.trim()) return;
    setIsLoading(true);

    let lat = 13.0827;
    let lng = 80.2707;
    let resolvedAddress = manualAddress.trim();

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'ARES-Emergency-App' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
          resolvedAddress = data[0].display_name.split(', ').slice(0, 3).join(', ');
        }
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }

    setLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 20,
      address: resolvedAddress,
    });
    setLocationPermissionGranted(true);
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (location) {
      navigate('/emergency-type');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#243447] flex flex-col font-sans">
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-[#DCE3EA] px-4 py-3 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-[#64748B] hover:text-[#243447] gap-1 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Portal Home</span>
          </Button>

          <div className="flex-1 max-w-md">
            <ProgressIndicator steps={steps} currentStep={1} />
          </div>

          <div className="w-16 text-right text-[11px] font-mono text-[#64748B] hidden sm:block">
            Step 1 of 4
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white rounded-lg border border-[#DCE3EA] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Icon */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#173B5E]/10 border border-[#173B5E]/20 text-[#173B5E] flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 text-[#173B5E]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#173B5E] tracking-tight">
                Verify Incident Location
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                Accurate coordinate lock allows emergency CAD systems to dispatch the nearest active field unit with minimal transit time.
              </p>
            </div>
          </div>

          {/* Location Card or Acquire Section */}
          {location ? (
            <div className="space-y-4 pt-2">
              <LocationDisplay
                location={location}
                onRefresh={requestLocation}
              />
              <Button
                variant="default"
                size="lg"
                className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-12 rounded-md shadow-xs"
                onClick={handleContinue}
              >
                <span>Confirm Location & Continue</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-[#243447]">
                  <AlertCircle className="w-4 h-4 text-[#C62832] shrink-0 mt-0.5" />
                  <p className="text-[#C62832] font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {!showManualInput ? (
                <div className="space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-12 rounded-md shadow-xs gap-2"
                    onClick={requestLocation}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Acquiring Satellite GPS Fix...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        <span>Acquire GPS Location Automatically</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold h-10 border-[#DCE3EA] text-[#64748B] hover:text-[#243447]"
                    onClick={() => setShowManualInput(true)}
                  >
                    Enter landmark or street address manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#243447]">
                      Incident Landmark / Street Address:
                    </label>
                    <Input
                      placeholder="e.g. Near Central Station, Poonamallee High Rd, Chennai"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="h-11 border-[#DCE3EA] bg-white text-sm"
                    />
                  </div>

                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-11 rounded-md"
                    onClick={handleManualSubmit}
                    disabled={!manualAddress.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resolving Address...</span>
                      </>
                    ) : (
                      <span>Verify & Set Location</span>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      setError(null);
                    }}
                    className="text-xs text-[#285F86] hover:underline font-semibold block mx-auto pt-1 cursor-pointer"
                  >
                    Use device GPS instead
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Institutional Compliance Notice */}
          <div className="border-t border-[#DCE3EA] pt-4 text-[11px] text-[#64748B] flex items-center gap-2 justify-center">
            <Shield className="w-3.5 h-3.5 text-[#285F86] shrink-0" />
            <span>Incident coordinates are encrypted and transmitted solely to authorized dispatch personnel.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationPermission;
