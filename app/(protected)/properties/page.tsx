"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import PropertyCard from "@/components/ui/PropertyCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  const supabase = createClient();
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    priceMin: "",
    priceMax: "",
    type: "",
  });

  // Fetch properties from Supabase
  useEffect(() => {
    async function fetchProperties() {
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.location) query = query.eq("location", filters.location);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.priceMin) query = query.gte("price", filters.priceMin);
      if (filters.priceMax) query = query.lte("price", filters.priceMax);

      const { data } = await query;
      setProperties(data || []);
    }

    fetchProperties();
  }, [filters]);

  // Handle filter changes
  interface Filters {
    location: string;
    priceMin: string;
    priceMax: string;
    type: string;
  }

  interface Property {
    id: string;
    location: string;
    price: number;
    type: string;
    created_at: string;
    // Add other property fields as needed
  }

  function handleFilterChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Browse Properties</h1>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          name="location"
          placeholder="Search by location..."
          value={filters.location}
          onChange={handleFilterChange}
        />

        <Select
          name="type"
          value={filters.type}
          onValueChange={(value) =>
            handleFilterChange({
              target: { name: "type", value },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        >
          <SelectTrigger>Type</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          name="priceMin"
          placeholder="Min Price"
          value={filters.priceMin}
          onChange={handleFilterChange}
        />
        <Input
          type="number"
          name="priceMax"
          placeholder="Max Price"
          value={filters.priceMax}
          onChange={handleFilterChange}
        />
      </div>

      <Button
        onClick={() =>
          setFilters({ location: "", priceMin: "", priceMax: "", type: "" })
        }
      >
        Reset Filters
      </Button>

      {/* Property Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No properties found.
          </p>
        )}
      </div>
    </div>
  );
}
