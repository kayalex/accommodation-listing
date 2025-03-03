import { createClient } from "@/utils/supabase/client";
import PropertyGrid from "@/components/PropertyGrid";
// import PropertyFilter from "@/components/PropertyFilter";

export default async function PropertiesPage() {
  const supabase = createClient();

  const { data: listings, error } = await supabase.from("listings").select("*");
  console.log(listings);
  if (error) {
    console.error("Error fetching landlord data:", error);
    return;
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Available Properties</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">{/* <PropertyFilter /> */}</aside>

        <main className="md:col-span-3">
          <PropertyGrid properties={listings || []} />
        </main>
      </div>
    </div>
  );
}
