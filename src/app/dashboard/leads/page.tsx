import { createSupabaseServer } from "@/lib/supabase-server";
import { LeadsTable } from "@/components/LeadsTable";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as Lead[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Leads</h1>
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
