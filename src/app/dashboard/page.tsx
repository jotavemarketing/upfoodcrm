import { createSupabaseServer } from "@/lib/supabase-server";
import { Users, UserPlus, UserCheck, TrendingUp } from "lucide-react";
import type { LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = await createSupabaseServer();
  const { data: leads } = await supabase.from("leads").select("status, created_at");

  if (!leads) return { total: 0, novos: 0, qualificados: 0, fechados: 0, thisWeek: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: leads.length,
    novos: leads.filter((l) => l.status === "novo").length,
    qualificados: leads.filter((l) => l.status === "qualificado").length,
    fechados: leads.filter((l) => l.status === "fechado").length,
    thisWeek: leads.filter((l) => new Date(l.created_at) >= sevenDaysAgo).length,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total de Leads", value: stats.total, icon: Users, color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" },
    { label: "Novos", value: stats.novos, icon: UserPlus, color: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400" },
    { label: "Qualificados", value: stats.qualificados, icon: UserCheck, color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" },
    { label: "Fechados", value: stats.fechados, icon: TrendingUp, color: "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Leads esta semana:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{stats.thisWeek}</span>
        </p>
      </div>
    </div>
  );
}
