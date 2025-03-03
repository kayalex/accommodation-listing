import Link from "next/link";

interface Property {
  image_url: string;
  title: string;
  location: string;
  price: number;
  id: string;
}

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <img
        src={property.image_url || "/placeholder.jpg"}
        alt={property.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold">{property.title}</h2>
        <p className="text-gray-600">{property.location}</p>
        <p className="text-primary font-bold mt-2">
          ZMW {property.price}/month
        </p>

        <Link
          href={`/properties/${property.id}`}
          className="mt-4 inline-block text-primary hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
