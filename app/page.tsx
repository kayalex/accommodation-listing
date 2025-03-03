import { createClient } from "@/utils/supabase/client";
import PropertyGrid from "@/components/PropertyGrid";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();

  // Fetch latest property listings
  const { data: properties } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Find Your Perfect Student Home
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
          Browse through our curated list of off-campus accommodations and find
          your ideal living space.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Browse Listings
          </Link>
          <Link
            href=""
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
          >
            List Your Property
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Latest Listings</h2>
          <Link href="/properties" className="text-primary hover:underline">
            View all listings
          </Link>
        </div>
        <PropertyGrid properties={properties || []} />
      </section>
    </div>
  );
}
