// /app/(protected)/dashboard/new/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import PropertyMapInput from "./PropertyMapInput";

const supabase = createClient();
const defaultCenter: [number, number] = [-12.80532, 28.24403]; // Replace with your coordinates

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAmenities() {
      const { data, error } = await supabase.from("amenities").select("*");
      if (error) console.error(error);
      else setAmenities(data);
    }
    fetchAmenities();
  }, []);

  const sanitizeFileName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("You must be logged in as a landlord.");
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
      setError("Error adding property: " + propertyError.message);
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
    if (amenityError) {
      setError("Error adding amenities: " + amenityError.message);
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      setLoading(false);
      return;
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        setLoading(false);
        return;
      }
      if (image.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        setLoading(false);
        return;
      }

      const sanitizedName = sanitizeFileName(image.name);
      const fileName = `${property.id}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from("properties")
        .upload(fileName, image, { upsert: true });
      if (uploadError) {
        setError("Error uploading image: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { error: imageError } = await supabase
        .from("property_images")
        .insert({
          property_id: property.id,
          storage_path: fileName,
          is_primary: i === 0,
        });
      if (imageError) {
        setError("Error saving image metadata: " + imageError.message);
        setLoading(false);
        return;
      }
    }

    alert("Property added successfully!");
    setLoading(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setAddress("");
    setLocation(defaultCenter);
    setSelectedAmenities([]);
    setImages([]);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-medium">Add New Property</h1>
      {error && <p className="text-red-500">{error}</p>}
      <label htmlFor="title">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="border p-2"
      />
      <label htmlFor="description">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2"
      />
      <label htmlFor="price">Price</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
        className="border p-2"
      />
      <label htmlFor="address">Address (optional)</label>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="border p-2"
      />

      <h3>Location</h3>
      <PropertyMapInput
        defaultCenter={defaultCenter}
        onLocationChange={setLocation}
      />
      <p>Click or drag the marker to set the location.</p>

      <h3>Amenities</h3>
      {amenities.map((amenity) => (
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

      <label htmlFor="images">Images (at least one required)</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(Array.from(e.target.files || []))}
        className="border p-2"
      />
      {images.length > 0 && (
        <div>
          <p>Selected images:</p>
          <ul>
            {images.map((img, index) => (
              <li key={index}>
                {img.name} {index === 0 ? "(Primary)" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

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
