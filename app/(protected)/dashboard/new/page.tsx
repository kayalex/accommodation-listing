// /app/(protected)/dashboard/new/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet"; // Import Leaflet directly
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";

// Fix missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl; // Bypass TypeScript issue
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const supabase = createClient();

const defaultCenter: [number, number] = [-12.8049, 28.2444]; // Replace with your region

export default function AddProperty() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(defaultCenter);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAmenities() {
      const { data, error } = await supabase.from("amenities").select("*");
      if (error) console.error(error);
      else setAmenities(data);
    }
    fetchAmenities();
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
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
            setLocation([position.lat, position.lng]);
          },
        }}
      />
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("You must be logged in as a landlord.");
      setLoading(false);
      return;
    }

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title,
        description,
        price,
        latitude: location[0],
        longitude: location[1],
        address: address || null,
        landlord_id: user.id,
      })
      .select()
      .single();
    if (propertyError) {
      console.error(propertyError);
      alert("Error adding property.");
      setLoading(false);
      return;
    }

    const amenityInserts = selectedAmenities.map((amenityId) => ({
      property_id: property.id,
      amenity_id: amenityId,
    }));
    const { error: amenityError } = await supabase
      .from("property_amenities")
      .insert(amenityInserts);
    if (amenityError) console.error(amenityError);

    for (const image of images) {
      const fileName = `${property.id}/${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("properties")
        .upload(fileName, image);
      if (uploadError) {
        console.error(uploadError);
        continue;
      }
      await supabase.from("property_images").insert({
        property_id: property.id,
        storage_path: fileName,
        is_primary: images.indexOf(image) === 0,
      });
    }

    alert("Property added successfully!");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-medium">Add New Property</h1>
      <Label htmlFor="title">Title</Label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="border p-2"
      />
      <Label htmlFor="description">Description</Label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2"
      />
      <Label htmlFor="price">Price</Label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
        className="border p-2"
      />
      <Label htmlFor="address">Address (optional)</Label>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="border p-2"
      />

      <h3>Location</h3>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
      <p>Click or drag the marker to set the location.</p>

      <h3>Amenities</h3>
      {amenities.map((amenity: any) => (
        <label key={amenity.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            value={amenity.id}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedAmenities([...selectedAmenities, amenity.id]);
              } else {
                setSelectedAmenities(
                  selectedAmenities.filter((id) => id !== amenity.id)
                );
              }
            }}
          />
          {amenity.name}
        </label>
      ))}

      <Label htmlFor="images">Images</Label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(Array.from(e.target.files || []))}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Adding..." : "Add Property"}
      </button>
    </form>
  );
}
