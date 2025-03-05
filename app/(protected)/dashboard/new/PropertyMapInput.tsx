// /app/(protected)/dashboard/new/PropertyMapInput.tsx
"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface PropertyMapInputProps {
  defaultCenter: [number, number];
  onLocationChange: (location: [number, number]) => void;
}

export default function PropertyMapInput({
  defaultCenter,
  onLocationChange,
}: PropertyMapInputProps) {
  const [location, setLocation] = useState(defaultCenter);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newLocation: [number, number] = [e.latlng.lat, e.latlng.lng];
        setLocation(newLocation);
        onLocationChange(newLocation);
      },
    });
    return (
      <Marker
        position={location}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            const newLocation: [number, number] = [position.lat, position.lng];
            setLocation(newLocation);
            onLocationChange(newLocation);
          },
        }}
      />
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
}
