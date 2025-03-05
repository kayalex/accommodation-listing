// /app/(protected)/properties/[id]/PropertyMapWrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import PropertyMap with SSR disabled
const PropertyMap = dynamic(() => import("./PropertyMap"), { ssr: false });

interface PropertyMapWrapperProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMapWrapper({
  latitude,
  longitude,
}: PropertyMapWrapperProps) {
  return <PropertyMap latitude={latitude} longitude={longitude} />;
}
