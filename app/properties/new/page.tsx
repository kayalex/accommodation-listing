import { createClient } from "@/utils/supabase/server";
import PropertyForm from "@/components/PropertyForm";
import { redirect } from "next/navigation";

export default async function NewPropertyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">List Your Property</h1>
      <PropertyForm />
    </div>
  );
}
