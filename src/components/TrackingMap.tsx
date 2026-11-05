import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AssignedUnit, Location } from "@/types/emergency";
import { Navigation, Compass, FastForward, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
    gm_authFailure?: () => void;
  }
}

interface TrackingMapProps {
  userLocation?: Location | null;
  assignedUnits?: AssignedUnit[];
}

type LatLng = { lat: number; lng: number };

// Calculate bearing/heading angle in degrees between two points
function calculateBearing(start: LatLng, dest: LatLng): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const destLat = (dest.lat * Math.PI) / 180;
  const destLng = (dest.lng * Math.PI) / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Haversine distance in meters
function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Fetch real road route from OSRM
async function fetchRoadRoute(start: LatLng, dest: LatLng): Promise<{ path: LatLng[]; duration: number; distance: number }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM request failed");
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates;
      const path: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
      return {
        path,
        duration: route.duration,
        distance: route.distance,
      };
    }
  } catch (err) {
    console.warn("OSRM routing fallback to interpolated waypoints:", err);
  }

  // Smooth fallback interpolation
  const steps = 30;
  const path: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curve = Math.sin(t * Math.PI) * 0.002;
    path.push({
      lat: start.lat + (dest.lat - start.lat) * t + curve,
      lng: start.lng + (dest.lng - start.lng) * t - curve,
    });
  }
  const dist = haversineMeters(start, dest);
  return { path, duration: Math.max(300, dist / 11), distance: dist };
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  userLocation,
  assignedUnits = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [etaMinutes, setEtaMinutes] = useState<number>(6);
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(4);
  const simSpeedRef = useRef<number>(4);

  // Keep simSpeedRef in sync
  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  const [liveLocation, setLiveLocation] = useState<LatLng | null>(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return null;
  });

  const unit =
    assignedUnits.find((u) => u.departmentId === "ambulance") ?? assignedUnits[0];
  const unitLabel = unit?.unitName ?? "Ambulance Unit 1";

  // Watch real browser GPS if available
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveLocation(coords);
      },
      (err) => {
        console.warn("GPS notice:", err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Update liveLocation when prop changes
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setLiveLocation({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Update user marker position smoothly when live GPS location updates
  useEffect(() => {
    if (liveLocation && userMarkerRef.current) {
      userMarkerRef.current.setLatLng([liveLocation.lat, liveLocation.lng]);
    }
  }, [liveLocation?.lat, liveLocation?.lng]);

  // Initialize Map and road route animation
  useEffect(() => {
    if (!containerRef.current) return;

    const targetUser: LatLng = {
      lat: userLocation?.latitude ?? liveLocation?.lat ?? 13.0827,
      lng: userLocation?.longitude ?? liveLocation?.lng ?? 80.2707,
    };

    const distOffset = (unit?.distance ?? 2.8) / 111;
    const startAmbulance: LatLng = {
      lat: targetUser.lat + distOffset * 0.72,
      lng: targetUser.lng + distOffset * 0.69,
    };

    // Clean up old map if container is empty
    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: [targetUser.lat, targetUser.lng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Clean, fast, modern street map tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 20,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // User GPS pulsing dot
    const userIconHtml = `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "custom-user-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([targetUser.lat, targetUser.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarkerRef.current.bindPopup(
        `<div style="font-family: sans-serif; font-size: 13px; font-weight: bold; padding: 2px;">
          📍 Your Live Location
          <div style="font-size: 11px; font-weight: normal; color: #666; margin-top: 2px;">
            ${userLocation?.address || "Live GPS Coordinates"}
          </div>
        </div>`
      );
    } else {
      userMarkerRef.current.setLatLng([targetUser.lat, targetUser.lng]);
    }

    const createAmbulanceIcon = (bearing: number) => {
      const html = `
        <div style="transform: rotate(${bearing}deg); transition: transform 0.15s ease-out; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(59,130,246,0.3) 70%, transparent 100%);"></div>
          <div style="position: relative; width: 36px; height: 36px; border-radius: 12px; background: #ffffff; border: 2.5px solid #dc2626; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">
            🚑
          </div>
          <div style="position: absolute; top: -3px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 6px solid #dc2626;"></div>
        </div>
      `;
      return L.divIcon({
        html,
        className: "custom-ambulance-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    };

    if (!ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current = L.marker([startAmbulance.lat, startAmbulance.lng], {
        icon: createAmbulanceIcon(45),
        zIndexOffset: 2000,
      }).addTo(map);
      ambulanceMarkerRef.current.bindPopup(
        `<div style="font-family: sans-serif; font-size: 13px; font-weight: bold;">
          🚑 ${unitLabel}
          <div style="font-size: 11px; font-weight: normal; color: #16a34a; margin-top: 2px;">
            En Route • Emergency Priority 1
          </div>
        </div>`
      );
    }

    let isCancelled = false;

    fetchRoadRoute(startAmbulance, targetUser).then((routeData) => {
      if (isCancelled || !mapInstanceRef.current) return;

      const path = routeData.path;
      const totalRoadMeters = routeData.distance;
      const estimatedTotalSeconds = routeData.duration;

      setDistanceKm(parseFloat((totalRoadMeters / 1000).toFixed(1)));
      setEtaMinutes(Math.max(1, Math.ceil(estimatedTotalSeconds / 60)));

      // Remove existing polyline if any
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
      }

      // Draw Polyline route
      routePolylineRef.current = L.polyline(
        path.map((p) => [p.lat, p.lng]),
        {
          color: "#2563eb",
          weight: 6,
          opacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
        }
      ).addTo(map);

      // Fit map view to route
      const bounds = L.latLngBounds(path.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

      // Calculate cumulative distances
      const cumulative: number[] = [0];
      for (let i = 1; i < path.length; i++) {
        cumulative.push(cumulative[i - 1] + haversineMeters(path[i - 1], path[i]));
      }

      const totalDist = cumulative[cumulative.length - 1] || 1;
      let virtualSecondsElapsed = 0;
      let lastTimestamp = performance.now();
      let lastBearing = 45;

      const animateStep = (timestamp: number) => {
        if (isCancelled) return;

        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.2);
        lastTimestamp = timestamp;

        // Apply current simulation speed
        virtualSecondsElapsed += delta * simSpeedRef.current;
        const progressFraction = Math.min(virtualSecondsElapsed / estimatedTotalSeconds, 1);
        const targetMeters = progressFraction * totalDist;

        // Find current road segment
        let i = 1;
        while (i < cumulative.length - 1 && cumulative[i] < targetMeters) {
          i++;
        }

        const segStartDist = cumulative[i - 1];
        const segLen = cumulative[i] - segStartDist || 1;
        const segT = Math.min(Math.max((targetMeters - segStartDist) / segLen, 0), 1);

        const currentLat = path[i - 1].lat + (path[i].lat - path[i - 1].lat) * segT;
        const currentLng = path[i - 1].lng + (path[i].lng - path[i - 1].lng) * segT;

        if (haversineMeters(path[i - 1], path[i]) > 3) {
          lastBearing = calculateBearing(path[i - 1], path[i]);
        }

        if (ambulanceMarkerRef.current) {
          ambulanceMarkerRef.current.setLatLng([currentLat, currentLng]);
          ambulanceMarkerRef.current.setIcon(createAmbulanceIcon(lastBearing));
        }

        const remMeters = Math.max(0, totalDist - targetMeters);
        const remKm = parseFloat((remMeters / 1000).toFixed(1));
        const remSeconds = Math.max(0, estimatedTotalSeconds - virtualSecondsElapsed);
        const remMins = Math.ceil(remSeconds / 60);

        setDistanceKm(remKm);
        setEtaMinutes(remMins);

        if (progressFraction >= 1) {
          setHasArrived(true);
          setDistanceKm(0);
          setEtaMinutes(0);
          if (ambulanceMarkerRef.current) {
            ambulanceMarkerRef.current.openPopup();
          }
        } else {
          animFrameRef.current = requestAnimationFrame(animateStep);
        }
      };

      animFrameRef.current = requestAnimationFrame(animateStep);
    });

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [userLocation?.latitude, userLocation?.longitude, unit?.distance, unitLabel]);

  // Recenter controls
  const handleRecenter = useCallback((mode: "route" | "ambulance" | "user") => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mode === "ambulance" && ambulanceMarkerRef.current) {
      map.setView(ambulanceMarkerRef.current.getLatLng(), 16, { animate: true });
    } else if (mode === "user" && userMarkerRef.current) {
      map.setView(userMarkerRef.current.getLatLng(), 16, { animate: true });
    } else if (mode === "route" && routePolylineRef.current) {
      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-border/80 shadow-xl bg-card">
      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Top Floating ETA Card (Uber-style) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/80 pointer-events-auto transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-md ${
                  hasArrived
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse"
                }`}
              >
                {hasArrived ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : "🚑"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {hasArrived ? "Ambulance Arrived" : `${unitLabel} En Route`}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    LIVE GPS
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasArrived
                    ? "Medical responders have arrived at your location."
                    : `${distanceKm} km away • Priority dispatch`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black font-mono text-primary leading-none">
                {hasArrived ? "0 min" : `${etaMinutes} min`}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground mt-1">
                {hasArrived ? "On Site" : "Estimated ETA"}
              </div>
            </div>
          </div>

          {/* Quick simulation speed controller */}
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <FastForward className="w-3.5 h-3.5 text-primary" />
              Demo Speed:
            </span>
            <div className="flex items-center gap-1">
              {[1, 4, 10, 25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    simSpeed === speed
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/80 hover:bg-muted text-foreground"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Map Navigation Controls */}
      <div className="absolute bottom-5 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => handleRecenter("ambulance")}
          title="Track Ambulance"
          className="w-10 h-10 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <span className="text-sm">🚑</span>
        </button>
        <button
          onClick={() => handleRecenter("user")}
          title="My Location"
          className="w-10 h-10 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Navigation className="w-4 h-4 text-blue-500" />
        </button>
        <button
          onClick={() => handleRecenter("route")}
          title="View Full Route"
          className="w-10 h-10 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Compass className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Live Status Pill at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-background/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium text-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live GPS Route Active
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
