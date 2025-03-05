// /app/(protected)/properties/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PropertyMapWrapper from "./PropertyMapWrapper"; // New Client Component wrapper

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(
      `
      *,
      profiles (email, phone, name),
      property_images (storage_path, is_primary),
      property_amenities (amenities (name))
    `
    )
    .eq("id", id)
    .single();

  if (propertyError || !property) {
    return notFound();
  }

  const primaryImage = property.property_images.find(
    (img: any) => img.is_primary
  );
  const imageUrl = primaryImage
    ? supabase.storage
        .from("properties")
        .getPublicUrl(primaryImage.storage_path).data.publicUrl
    : "https://via.placeholder.com/800x400";
  const amenities = property.property_amenities.map(
    (pa: any) => pa.amenities.name
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <Link href="/properties" className="text-blue-500 hover:underline">
          Back to Listings
        </Link>
      </div>

      <div className="my-6">
        <img
          src={imageUrl}
          alt={property.title}
          width={800}
          height={400}
          className="rounded-lg w-full h-auto object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="mt-2 text-gray-700">
            {property.description || "No description available"}
          </p>

          <h2 className="text-2xl font-semibold mt-6">Amenities</h2>
          {amenities.length > 0 ? (
            <ul className="mt-2 list-disc list-inside">
              {amenities.map((amenity: string, index: number) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-gray-700">No amenities listed</p>
          )}

          <h2 className="text-2xl font-semibold mt-6">Location</h2>
          <PropertyMapWrapper
            latitude={property.latitude}
            longitude={property.longitude}
          />
          <p className="mt-2 text-gray-500">
            {property.address || "Location set on map"}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold">Details</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>Price:</strong> ZMW {property.price}/month
            </li>
            <li>
              <strong>Landlord:</strong> {property.profiles?.name || "Unknown"}
            </li>
            <li>
              <strong>Email:</strong> {property.profiles?.email}
            </li>
            {property.profiles?.phone && (
              <li>
                <strong>Phone:</strong> {property.profiles.phone}
              </li>
            )}
          </ul>

          <Link href={`mailto:${property.profiles?.email}`} passHref>
            <Button className="mt-4 w-full">Contact Landlord</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
