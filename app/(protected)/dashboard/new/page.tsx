// /app/(protected)/dashboard/new/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import PropertyMapInput from "./PropertyMapInput";

const supabase = createClient();
const defaultCenter: [number, number] = [6.5244, 3.3792]; // Replace with your coordinates

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
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);

    try {
      // Step 1: Check authentication and get user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be logged in as a landlord.");
        setLoading(false);
        return;
      }
      console.log("Authenticated User ID:", user.id);

      // Validate inputs
      if (!title.trim()) {
        setError("Title is required");
        setLoading(false);
        return;
      }

      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        setError("Valid price is required");
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        setError("Please upload at least one image.");
        setLoading(false);
        return;
      }

      // Step 2: Create the property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          title,
          description,
          price: parseFloat(price),
          latitude: location[0],
          longitude: location[1],
          address: address || null,
          landlord_id: user.id,
        })
        .select()
        .single();

      if (propertyError) {
        console.error("Property insertion error:", propertyError);
        setError("Error adding property: " + propertyError.message);
        setLoading(false);
        return;
      }

      console.log("Inserted Property:", property);

      // Step 3: Add amenities
      if (selectedAmenities.length > 0) {
        const amenityInserts = selectedAmenities.map((amenityId) => ({
          property_id: property.id,
          amenity_id: amenityId,
        }));

        const { error: amenityError } = await supabase
          .from("property_amenities")
          .insert(amenityInserts);

        if (amenityError) {
          console.error("Amenity insertion error:", amenityError);
          setError("Error adding amenities: " + amenityError.message);
          setLoading(false);
          return;
        }
      }

      // Step 4: Upload images and insert into property_images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setUploadProgress(Math.round((i / images.length) * 50)); // First 50% for validations

        // Validate image
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
        // Use the landlord ID in the path to match the RLS policy
        // The policy expects (storage.foldername(name))[1] = 'landlord_' || auth.uid()
        const fileName = `landlord_${user.id}/${property.id}/${Date.now()}-${sanitizedName}`;
        console.log("Uploading image to:", fileName);

        // Upload the image to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("properties")
          .upload(fileName, image, { upsert: true });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          setError("Error uploading image: " + uploadError.message);
          setLoading(false);
          return;
        }

        setUploadProgress(50 + Math.round((i / images.length) * 50)); // Last 50% for DB inserts

        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("properties")
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData?.publicUrl;

        // Save the image metadata to the database
        const imageData = {
          property_id: property.id,
          storage_path: fileName,
          is_primary: i === 0,
          public_url: publicUrl || null, // Optional: store the public URL if needed
        };

        console.log("Inserting into property_images:", imageData);
        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageData);

        if (imageError) {
          console.error("Image insertion error:", imageError);
          setError("Error saving image metadata: " + imageError.message);
          setLoading(false);
          return;
        }
      }

      // Success! Reset the form
      alert("Property added successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setAddress("");
      setLocation(defaultCenter);
      setSelectedAmenities([]);
      setImages([]);
      setUploadProgress(0);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(
        `An unexpected error occurred: ${err.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-medium">Add New Property</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-gray-500 mt-1">
            Processing: {uploadProgress}% complete
          </p>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Property Title"
          required
          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed property description"
          rows={4}
          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Price *
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          required
          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address (optional)
        </label>
        <input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Property address"
          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Location *</h3>
        <PropertyMapInput
          defaultCenter={defaultCenter}
          onLocationChange={setLocation}
        />
        <p className="text-sm text-gray-500 mt-1">
          Click or drag the marker to set the exact property location.
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {amenities.map((amenity) => (
            <label
              key={amenity.id}
              className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50"
            >
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
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {amenity.name}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="images"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Images * (at least one required)
        </label>
        <input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          First image will be used as the primary image. Max size: 5MB per
          image.
        </p>

        {images.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Selected images:</p>
            <ul className="list-disc pl-5 mt-1">
              {images.map((img, index) => (
                <li key={index} className="text-sm">
                  {img.name} {index === 0 ? "(Primary)" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`py-2 px-4 rounded-md text-white font-medium ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
      >
        {loading ? "Processing..." : "Add Property"}
      </button>
    </form>
  );
}
