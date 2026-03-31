"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { STATUS_CONFIG, STATUS_ORDER, type Lead, type LeadStatus } from "@/lib/types";
import { Phone, Building2, ChevronRight } from "lucide-react";

export default function KanbanPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads(data ?? []);
        setLoading(false);
      });
  }, []);

  async function moveToNextStatus(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(lead.status);
    if (currentIndex >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIndex + 1];

    setMoving(lead.id);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", lead.id);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: nextStatus } : l))
      );
    }
    setMoving(null);
  }

  const grouped = STATUS_ORDER.reduce<Record<LeadStatus, Lead[]>>(
    (acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<LeadStatus, Lead[]>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando kanban...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Kanban</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const columnLeads = grouped[status];
          return (
            <div key={status} className="flex w-64 shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50">
              {/* Column header */}
              <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.color.split(" ")[0]}`} />
                  <span className="text-sm font-semibold text-gray-700">{cfg.label}</span>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2">
                {columnLeads.length === 0 && (
                  <p className="py-6 text-center text-xs text-gray-400">Nenhum lead</p>
                )}
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lead.company}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                    {status !== "fechado" && status !== "perdido" && (
                      <button
                        onClick={(e) => moveToNextStatus(e, lead)}
                        disabled={moving === lead.id}
                        className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        Mover para {STATUS_CONFIG[STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1]].label}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
