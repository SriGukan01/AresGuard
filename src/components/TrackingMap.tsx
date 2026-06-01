import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export const TrackingMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 17.385044, lng: 78.486671 },
      zoom: 13,
    });

    const responderMarker = new window.google.maps.Marker({
      map: map,
      title: "Responder",
    });

    let hospitalMarker: any = null;
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    navigator.geolocation.watchPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        responderMarker.setPosition(origin);
        map.setCenter(origin);

        const placesService = new window.google.maps.places.PlacesService(map);

        placesService.nearbySearch(
          {
            location: origin,
            radius: 5000,
            type: ["hospital"],
          },
          (results: any, status: any) => {
            if (
              status ===
                window.google.maps.places.PlacesServiceStatus.OK &&
              results.length > 0
            ) {
              const destination = results[0].geometry.location;

              // Remove old hospital marker
              if (hospitalMarker) hospitalMarker.setMap(null);

              hospitalMarker = new window.google.maps.Marker({
                position: destination,
                map: map,
                title: results[0].name,
                icon:
                  "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              });

              // Draw shortest route
              directionsService.route(
                {
                  origin: origin,
                  destination: destination,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                  if (status === "OK") {
                    directionsRenderer.setDirections(result);
                  }
                }
              );

              // Calculate ETA
              const distanceService =
                new window.google.maps.DistanceMatrixService();

              distanceService.getDistanceMatrix(
                {
                  origins: [origin],
                  destinations: [destination],
                  travelMode: "DRIVING",
                },
                (response: any, status: any) => {
                  if (status === "OK") {
                    const duration =
                      response.rows[0].elements[0].duration.text;
                    console.log("ETA to hospital:", duration);
                  }
                }
              );
            }
          }
        );
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};
