"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { Agendamento, AgendamentoStatus } from "@/lib/types";
import { CalendarDays, Clock, Building2, Plus, X, Trash2, ExternalLink } from "lucide-react";

const STATUS_CONFIG: Record<AgendamentoStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  realizado: { label: "Realizado", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
};

type AgendamentoWithLead = Agendamento & {
  leads: { name: string; company: string } | null;
};

export default function AgendamentosPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<AgendamentoWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AgendamentoStatus | "todos">("todos");
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState<{ id: string; name: string; company: string }[]>([]);
  const [form, setForm] = useState({ lead_id: "", titulo: "", descricao: "", data_hora: "" });
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("agendamentos")
      .select("*, leads(name, company)")
      .order("data_hora", { ascending: true });
    setAgendamentos((data as AgendamentoWithLead[]) ?? []);
    setLoading(false);
  }

  async function openModal() {
    const { data } = await supabase
      .from("leads")
      .select("id, name, company")
      .order("name");
    setLeads(data ?? []);
    setShowModal(true);
  }

  async function handleCreate() {
    if (!form.titulo || !form.data_hora || !form.lead_id) return;
    setSaving(true);
    await supabase.from("agendamentos").insert([{ ...form, status: "pendente" }]);
    await load();
    setForm({ lead_id: "", titulo: "", descricao: "", data_hora: "" });
    setShowModal(false);
    setSaving(false);
  }

  async function handleStatusChange(id: string, status: AgendamentoStatus) {
    await supabase.from("agendamentos").update({ status }).eq("id", id);
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function handleDelete(id: string) {
    await supabase.from("agendamentos").delete().eq("id", id);
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      weekday: "short", day: "2-digit", month: "2-digit",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  const filtered =
    filterStatus === "todos"
      ? agendamentos
      : agendamentos.filter((a) => a.status === filterStatus);

  const pendentes = agendamentos.filter((a) => a.status === "pendente").length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          {pendentes > 0 && (
            <p className="mt-1 text-sm text-yellow-600">
              {pendentes} agendamento{pendentes !== 1 ? "s" : ""} pendente{pendentes !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(["todos", "pendente", "realizado", "cancelado"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "todos" ? "Todos" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <CalendarDays className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ag) => (
            <div
              key={ag.id}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{ag.titulo}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[ag.status].color}`}>
                    {STATUS_CONFIG[ag.status].label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{formatDate(ag.data_hora)}</p>
                {ag.leads && (
                  <button
                    onClick={() => router.push(`/dashboard/leads/${ag.lead_id}`)}
                    className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                  >
                    <Building2 className="h-3 w-3" />
                    {ag.leads.name} — {ag.leads.company}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
                {ag.descricao && (
                  <p className="mt-1.5 text-xs text-gray-400">{ag.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={ag.status}
                  onChange={(e) => handleStatusChange(ag.id, e.target.value as AgendamentoStatus)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 outline-none"
                >
                  <option value="pendente">Pendente</option>
                  <option value="realizado">Realizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button
                  onClick={() => handleDelete(ag.id)}
                  className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Novo Agendamento</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Lead *</label>
                <select
                  value={form.lead_id}
                  onChange={(e) => setForm((p) => ({ ...p, lead_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecione um lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Reunião de proposta"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data e hora *</label>
                <input
                  type="datetime-local"
                  value={form.data_hora}
                  onChange={(e) => setForm((p) => ({ ...p, data_hora: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                  rows={3}
                  placeholder="Detalhes..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.titulo || !form.data_hora || !form.lead_id}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
