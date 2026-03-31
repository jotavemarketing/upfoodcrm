"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { STATUS_CONFIG, type Lead, type LeadStatus, type Agendamento, type AgendamentoStatus } from "@/lib/types";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import {
  ArrowLeft, Mail, Phone, Building2, DollarSign, Calendar,
  Pencil, Check, X, Plus, Trash2, Clock,
} from "lucide-react";
import { InstagramIcon } from "@/components/InstagramIcon";

const AGENDAMENTO_STATUS_CONFIG: Record<AgendamentoStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  realizado: { label: "Realizado", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [lead, setLead] = useState<Lead | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  // modal agendamento
  const [showModal, setShowModal] = useState(false);
  const [agForm, setAgForm] = useState({ titulo: "", descricao: "", data_hora: "" });
  const [agSaving, setAgSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: leadData }, { data: agData }] = await Promise.all([
        supabase.from("leads").select("*").eq("id", id).single(),
        supabase.from("agendamentos").select("*").eq("lead_id", id).order("data_hora", { ascending: true }),
      ]);
      if (leadData) { setLead(leadData); setForm(leadData); }
      setAgendamentos(agData ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("leads")
      .update(form)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) { setLead(data); setEditing(false); }
    setSaving(false);
  }

  async function handleCreateAgendamento() {
    if (!agForm.titulo || !agForm.data_hora) return;
    setAgSaving(true);
    const { data, error } = await supabase
      .from("agendamentos")
      .insert([{ lead_id: id, ...agForm, status: "pendente" }])
      .select()
      .single();
    if (!error && data) {
      setAgendamentos((prev) => [...prev, data]);
      setAgForm({ titulo: "", descricao: "", data_hora: "" });
      setShowModal(false);
    }
    setAgSaving(false);
  }

  async function handleDeleteAgendamento(agId: string) {
    await supabase.from("agendamentos").delete().eq("id", agId);
    setAgendamentos((prev) => prev.filter((a) => a.id !== agId));
  }

  async function handleAgStatus(agId: string, status: AgendamentoStatus) {
    await supabase.from("agendamentos").update({ status }).eq("id", agId);
    setAgendamentos((prev) => prev.map((a) => a.id === agId ? { ...a, status } : a));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Lead não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-sm text-gray-500">{lead.company}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        {editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome</label>
              <input
                value={form.name ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">E-mail</label>
              <input
                value={form.email ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Telefone</label>
              <input
                value={form.phone ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Empresa</label>
              <input
                value={form.company ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Faturamento</label>
              <input
                value={form.revenue_range ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, revenue_range: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <InstagramIcon className="h-3.5 w-3.5 text-pink-500" /> Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
                <input
                  value={(form.instagram ?? "").replace("@", "")}
                  onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
                  placeholder="usuario"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select
                value={form.status ?? "novo"}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LeadStatus }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Notas</label>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                onClick={() => { setEditing(false); setForm(lead); }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">E-mail</p>
                <p className="text-sm font-medium text-gray-900">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Empresa</p>
                <p className="text-sm font-medium text-gray-900">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Faturamento</p>
                <p className="text-sm font-medium text-gray-900">{lead.revenue_range}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
              <div>
                <p className="text-xs text-gray-400">Instagram</p>
                {lead.instagram ? (
                  <a
                    href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    {lead.instagram.startsWith("@") ? lead.instagram : `@${lead.instagram}`}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Não informado</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Cadastrado em</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(lead.created_at)}</p>
              </div>
            </div>
            {lead.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Notas</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg bg-gray-50 p-3">{lead.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agendamentos */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Agendamentos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>

        {agendamentos.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Nenhum agendamento para este lead.</p>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((ag) => (
              <div key={ag.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900">{ag.titulo}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${AGENDAMENTO_STATUS_CONFIG[ag.status].color}`}>
                      {AGENDAMENTO_STATUS_CONFIG[ag.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(ag.data_hora)}</p>
                  {ag.descricao && <p className="text-xs text-gray-400 mt-1">{ag.descricao}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={ag.status}
                    onChange={(e) => handleAgStatus(ag.id, e.target.value as AgendamentoStatus)}
                    className="rounded border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-600 outline-none"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  <button
                    onClick={() => handleDeleteAgendamento(ag.id)}
                    className="rounded p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo agendamento */}
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
                <input
                  value={agForm.titulo}
                  onChange={(e) => setAgForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Reunião de apresentação"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data e hora *</label>
                <input
                  type="datetime-local"
                  value={agForm.data_hora}
                  onChange={(e) => setAgForm((p) => ({ ...p, data_hora: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={agForm.descricao}
                  onChange={(e) => setAgForm((p) => ({ ...p, descricao: e.target.value }))}
                  rows={3}
                  placeholder="Detalhes do agendamento..."
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
                onClick={handleCreateAgendamento}
                disabled={agSaving || !agForm.titulo || !agForm.data_hora}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {agSaving ? "Salvando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
