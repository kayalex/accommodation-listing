import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch property details by ID
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  // If property is not found, return 404
  if (!property) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Property Title */}
      <h1 className="text-3xl font-bold">{property.title}</h1>
      <p className="text-gray-500">{property.location}</p>

      {/* Image */}
      <div className="my-6">
        <Image
          src={property.image_url || "/placeholder.jpg"}
          alt={property.title}
          width={800}
          height={400}
          className="rounded-lg w-full h-auto object-cover"
        />
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="mt-2 text-gray-700">{property.description}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold">Details</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>Type:</strong> {property.type}
            </li>
            <li>
              <strong>Price:</strong> ZMW {property.price}/month
            </li>
            <li>
              <strong>Contact:</strong> {property.contact_email}
            </li>
            {property.contact_phone && (
              <li>
                <strong>Phone:</strong> {property.contact_phone}
              </li>
            )}
          </ul>

          <Link href={`mailto:${property.contact_email}`} passHref>
            <Button className="mt-4 w-full">Contact Landlord</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
