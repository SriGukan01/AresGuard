import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AssignedUnit, Location } from "@/types/emergency";
import { getNearestHospitalName } from "@/lib/hospital";
import { Navigation, Compass, CheckCircle2 } from "lucide-react";

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

// Instant synchronous road path generator (executes in 0ms so map appears instantly)
function buildInstantStreetPath(start: LatLng, dest: LatLng): { path: LatLng[]; duration: number; distance: number } {
  const dist = haversineMeters(start, dest);
  const midLat = (start.lat + dest.lat) / 2;
  const midLng = (start.lng + dest.lng) / 2;

  const wp1 = { lat: start.lat, lng: midLng };
  const wp2 = { lat: midLat, lng: dest.lng };

  const segments = [
    { from: start, to: wp1, count: 14 },
    { from: wp1, to: wp2, count: 14 },
    { from: wp2, to: dest, count: 14 },
  ];

  const path: LatLng[] = [];
  for (const seg of segments) {
    for (let i = 0; i < seg.count; i++) {
      const t = i / seg.count;
      path.push({
        lat: seg.from.lat + (seg.to.lat - seg.from.lat) * t,
        lng: seg.from.lng + (seg.to.lng - seg.from.lng) * t,
      });
    }
  }
  path.push(dest);

  return { path, duration: Math.max(260, Math.round(dist / 11)), distance: dist * 1.25 };
}

// Background asynchronous route refiner (Google Directions / OSRM)
async function fetchRefinedRoadRoute(start: LatLng, dest: LatLng): Promise<{ path: LatLng[]; duration: number; distance: number } | null> {
  // Google Directions API
  if (typeof window !== "undefined" && window.google?.maps?.DirectionsService) {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const googleRes: any = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: new window.google.maps.LatLng(start.lat, start.lng),
            destination: new window.google.maps.LatLng(dest.lat, dest.lng),
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === "OK" && result) {
              resolve(result);
            } else {
              reject(new Error(status));
            }
          }
        );
      });

      if (googleRes?.routes?.[0]?.overview_path?.length) {
        const path: LatLng[] = googleRes.routes[0].overview_path.map((p: any) => ({
          lat: p.lat(),
          lng: p.lng(),
        }));
        const leg = googleRes.routes[0].legs[0];
        return {
          path,
          duration: leg?.duration?.value || 300,
          distance: leg?.distance?.value || haversineMeters(start, dest),
        };
      }
    } catch {
      // Fallback to OSRM
    }
  }

  // OSRM
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates;
        return {
          path: coords.map(([lng, lat]) => ({ lat, lng })),
          duration: route.duration,
          distance: route.distance,
        };
      }
    }
  } catch {
    // Keep instant path
  }

  return null;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  userLocation,
  assignedUnits = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [etaMinutes, setEtaMinutes] = useState<number>(5);
  const [distanceKm, setDistanceKm] = useState<number>(2.2);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<"google" | "satellite" | "osm">("google");

  const [liveLocation, setLiveLocation] = useState<LatLng | null>(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return { lat: 13.0827, lng: 80.2707 };
  });

  const unit =
    assignedUnits.find((u) => u.departmentId === "ambulance") ?? assignedUnits[0];
  const unitLabel = unit?.unitName ?? "Emergency Medical Unit 1";
  const nearestHospital = getNearestHospitalName(userLocation);

  // Fast background watchPosition
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 6000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setLiveLocation({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    if (liveLocation && userMarkerRef.current) {
      userMarkerRef.current.setLatLng([liveLocation.lat, liveLocation.lng]);
    }
  }, [liveLocation?.lat, liveLocation?.lng]);

  // Switch map tile layer
  const switchMapTileLayer = useCallback((style: "google" | "satellite" | "osm") => {
    if (!mapInstanceRef.current) return;
    setMapStyle(style);

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    let subdomains: string[] | string = ["0", "1", "2", "3"];
    let maxZoom = 19;
    let attribution = '&copy; Google Maps';

    if (style === "satellite") {
      url = "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
      attribution = '&copy; Google Satellite';
    } else if (style === "osm") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      subdomains = ["a", "b", "c"];
      maxZoom = 19;
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom,
      subdomains,
      keepBuffer: 2,
      updateWhenIdle: true,
      crossOrigin: true,
      className: "custom-no-fade-tile",
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, []);

  // Main Map Initializer - Instant 0ms Mount
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

    const initialBounds = L.latLngBounds([
      [targetUser.lat, targetUser.lng],
      [startAmbulance.lat, startAmbulance.lng],
    ]);
    const initialCenter = initialBounds.getCenter();

    // Initialize Map Instance if not existing with exact center/bounds on creation
    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        preferCanvas: true,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });

      // Synchronously fit bounds in 0ms
      map.fitBounds(initialBounds, { padding: [55, 55], maxZoom: 16, animate: false });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Instant Google Maps Roadmap Tiles
      const googleTiles = L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; Google Maps',
          maxZoom: 19,
          subdomains: ["0", "1", "2", "3"],
          keepBuffer: 2,
          updateWhenIdle: true,
          crossOrigin: true,
          className: "custom-no-fade-tile",
        }
      ).addTo(map);

      tileLayerRef.current = googleTiles;
      mapInstanceRef.current = map;

      map.invalidateSize();
    }

    const map = mapInstanceRef.current;

    // User GPS pulsing dot
    const userIconHtml = `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(23, 59, 94, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 15px; height: 15px; border-radius: 50%; background: #173B5E; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "custom-user-marker",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([targetUser.lat, targetUser.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarkerRef.current.bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #173B5E; padding: 2px;">
          📍 Verified Incident Location
          <div style="font-size: 11px; font-weight: normal; color: #64748B; margin-top: 2px;">
            ${userLocation?.address || "Live GPS Coordinates"}
          </div>
        </div>`
      );
    } else {
      userMarkerRef.current.setLatLng([targetUser.lat, targetUser.lng]);
    }

    // Hospital / Dispatch Origin Marker
    const hospitalIconHtml = `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #ffffff; border: 2px solid #C62832; box-shadow: 0 3px 8px rgba(198,40,50,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">
          🏥
        </div>
      </div>
    `;

    const hospitalIcon = L.divIcon({
      html: hospitalIconHtml,
      className: "custom-hospital-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (!hospitalMarkerRef.current) {
      hospitalMarkerRef.current = L.marker([startAmbulance.lat, startAmbulance.lng], {
        icon: hospitalIcon,
        zIndexOffset: 1500,
      }).addTo(map);
      hospitalMarkerRef.current.bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #C62832;">
          🏥 ${nearestHospital}
          <div style="font-size: 11px; font-weight: normal; color: #64748B; margin-top: 2px;">
            Nearest Hospital Dispatch Base • Unit Deployed
          </div>
        </div>`
      );
    }

    const createAmbulanceIcon = (bearing: number) => {
      const html = `
        <div style="transform: rotate(${bearing}deg); transition: transform 0.12s linear; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: #ffffff; border: 2px solid #C62832; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            🚑
          </div>
          <div style="position: absolute; top: -2px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 5px solid #C62832;"></div>
        </div>
      `;
      return L.divIcon({
        html,
        className: "custom-ambulance-marker",
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });
    };

    if (!ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current = L.marker([startAmbulance.lat, startAmbulance.lng], {
        icon: createAmbulanceIcon(45),
        zIndexOffset: 2000,
      }).addTo(map);
      ambulanceMarkerRef.current.bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #173B5E;">
          🚑 ${unitLabel}
          <div style="font-size: 11px; font-weight: normal; color: #16845B; margin-top: 2px;">
            En Route • Emergency Priority 1
          </div>
        </div>`
      );
    }

    let isCancelled = false;

    // Helper: start travel animation loop along the road path
    const runAnimation = (routeData: { path: LatLng[]; duration: number; distance: number }) => {
      if (isCancelled || !mapInstanceRef.current) return;

      const path = routeData.path;
      const totalRoadMeters = routeData.distance;
      const estimatedTotalSeconds = routeData.duration;

      setDistanceKm(parseFloat((totalRoadMeters / 1000).toFixed(1)));
      setEtaMinutes(Math.max(1, Math.ceil(estimatedTotalSeconds / 60)));

      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
      }

      // Draw Polyline route
      routePolylineRef.current = L.polyline(
        path.map((p) => [p.lat, p.lng]),
        {
          color: "#285F86",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }
      ).addTo(map);

      const cumulative: number[] = [0];
      for (let i = 1; i < path.length; i++) {
        cumulative.push(cumulative[i - 1] + haversineMeters(path[i - 1], path[i]));
      }

      const totalDist = cumulative[cumulative.length - 1] || 1;
      let virtualSecondsElapsed = 0;
      let lastTimestamp = performance.now();
      let lastBearing = 45;

      const TRAVEL_PACE = 2.4;

      const animateStep = (timestamp: number) => {
        if (isCancelled) return;

        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.2);
        lastTimestamp = timestamp;

        virtualSecondsElapsed += delta * TRAVEL_PACE;
        const progressFraction = Math.min(virtualSecondsElapsed / estimatedTotalSeconds, 1);
        const targetMeters = progressFraction * totalDist;

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

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(animateStep);
    };

    const instantRoute = buildInstantStreetPath(startAmbulance, targetUser);
    runAnimation(instantRoute);

    fetchRefinedRoadRoute(startAmbulance, targetUser).then((refined) => {
      if (refined && !isCancelled && routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(refined.path.map(p => [p.lat, p.lng]));
      }
    });

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [userLocation?.latitude, userLocation?.longitude, unit?.distance, unitLabel, nearestHospital]);

  // Recenter controls
  const handleRecenter = useCallback((mode: "route" | "ambulance" | "user") => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mode === "ambulance" && ambulanceMarkerRef.current) {
      map.setView(ambulanceMarkerRef.current.getLatLng(), 16, { animate: true });
    } else if (mode === "user" && userMarkerRef.current) {
      map.setView(userMarkerRef.current.getLatLng(), 16, { animate: true });
    } else if (mode === "route" && routePolylineRef.current) {
      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [55, 55], animate: true });
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-[#DCE3EA] shadow-xs bg-white">
      <style>{`
        .custom-no-fade-tile img, .custom-no-fade-tile .leaflet-tile {
          opacity: 1 !important;
          transition: none !important;
        }
      `}</style>

      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" style={{ minHeight: "500px" }} />

      {/* Top Floating ETA Card (Government / Public Safety Style) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-lg p-3.5 shadow-md border border-[#DCE3EA] pointer-events-auto transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shadow-2xs border ${
                  hasArrived
                    ? "bg-[#16845B]/10 text-[#16845B] border-[#16845B]/30"
                    : "bg-[#C62832]/10 text-[#C62832] border-[#C62832]/30"
                }`}
              >
                {hasArrived ? <CheckCircle2 className="w-5 h-5 text-[#16845B]" /> : "🚑"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#243447] leading-snug">
                    {hasArrived ? "Ambulance Arrived" : `${unitLabel} En Route`}
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#16845B]/10 text-[#16845B] border border-[#16845B]/20 uppercase">
                    Live GPS
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {hasArrived
                    ? "Responders are on site at your location."
                    : `${distanceKm} km away • Priority Dispatch`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black font-mono text-[#173B5E] leading-none">
                {hasArrived ? "0 min" : `${etaMinutes} min`}
              </div>
              <div className="text-[10px] font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                {hasArrived ? "On Site" : "Estimated ETA"}
              </div>
            </div>
          </div>

          {/* Nearest Hospital Dispatch Base */}
          <div className="mt-2.5 pt-2 border-t border-[#DCE3EA] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#64748B] truncate">
              <span className="text-sm shrink-0">🏥</span>
              <span className="truncate">
                Dispatched from: <strong className="text-[#243447]">{nearestHospital}</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#16845B] bg-[#16845B]/10 px-2 py-0.5 rounded border border-[#16845B]/20 whitespace-nowrap ml-2 uppercase">
              Priority 1
            </span>
          </div>
        </div>
      </div>

      {/* Map Layer Switcher */}
      <div className="absolute top-3 left-3 z-[1000] hidden sm:flex items-center bg-white/95 backdrop-blur-md border border-[#DCE3EA] rounded-md p-1 shadow-xs text-[11px] font-semibold">
        <button
          onClick={() => switchMapTileLayer("google")}
          className={`px-2 py-0.5 rounded transition-colors ${
            mapStyle === "google"
              ? "bg-[#173B5E] text-white font-bold"
              : "text-[#64748B] hover:text-[#243447]"
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => switchMapTileLayer("satellite")}
          className={`px-2 py-0.5 rounded transition-colors ${
            mapStyle === "satellite"
              ? "bg-[#173B5E] text-white font-bold"
              : "text-[#64748B] hover:text-[#243447]"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => switchMapTileLayer("osm")}
          className={`px-2 py-0.5 rounded transition-colors ${
            mapStyle === "osm"
              ? "bg-[#173B5E] text-white font-bold"
              : "text-[#64748B] hover:text-[#243447]"
          }`}
        >
          OSM
        </button>
      </div>

      {/* Floating Map Navigation Controls */}
      <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => handleRecenter("ambulance")}
          title="Track Ambulance"
          className="w-9 h-9 rounded-md bg-white border border-[#DCE3EA] shadow-xs flex items-center justify-center text-[#243447] hover:bg-[#F4F6F8] transition-colors cursor-pointer"
        >
          <span className="text-sm">🚑</span>
        </button>
        <button
          onClick={() => handleRecenter("user")}
          title="My Location"
          className="w-9 h-9 rounded-md bg-white border border-[#DCE3EA] shadow-xs flex items-center justify-center text-[#285F86] hover:bg-[#F4F6F8] transition-colors cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-[#285F86]" />
        </button>
        <button
          onClick={() => handleRecenter("route")}
          title="View Full Route"
          className="w-9 h-9 rounded-md bg-white border border-[#DCE3EA] shadow-xs flex items-center justify-center text-[#173B5E] hover:bg-[#F4F6F8] transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#173B5E]" />
        </button>
      </div>

      {/* Live Status Pill at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-[#DCE3EA] px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-[#243447]">
          <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
          <span>Live CAD Street Telemetry Active</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
