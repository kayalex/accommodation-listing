import Link from "next/link";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  price: number;
  main_image: string;
  bedrooms: number;
  bathrooms: number;
}

export default function PropertyGrid({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`/properties/${property.id}`}
          className="group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border"
        >
          <div className="relative aspect-video">
            {property.main_image && (
              <Image
                src={property.main_image}
                alt={property.title}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg">{property.title}</h3>
            <p className="text-lg font-medium">${property.price}/month</p>
            <p className="text-sm text-muted-foreground">
              {property.bedrooms} beds • {property.bathrooms} baths
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
