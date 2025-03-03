import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PropertyDetailsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          {property.main_image && (
            <Image
              src={property.main_image}
              alt={property.title}
              fill
              className="object-cover rounded-lg"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-2xl font-semibold">${property.price}/month</p>
          <p className="text-muted-foreground">{property.description}</p>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Property Details</h2>
            <ul className="space-y-2">
              <li>Bedrooms: {property.bedrooms}</li>
              <li>Bathrooms: {property.bathrooms}</li>
              <li>
                Available from:{" "}
                {new Date(property.available_from).toLocaleDateString()}
              </li>
            </ul>
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Contact Landlord</h2>
            <p>Name: {property.profiles.full_name}</p>
            <p>Email: {property.profiles.email}</p>
            <p>Phone: {property.profiles.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
