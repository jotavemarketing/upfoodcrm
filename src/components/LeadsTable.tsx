"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { STATUS_CONFIG, type Lead, type LeadStatus } from "@/lib/types";
import { Search, ChevronDown, MessageSquare, X } from "lucide-react";

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<LeadStatus>("novo");
  const [saving, setSaving] = useState(false);

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "todos" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setNotes(lead.notes || "");
    setNewStatus(lead.status);
  }

  async function handleSave() {
    if (!editingLead) return;
    setSaving(true);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus, notes })
      .eq("id", editingLead.id);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id ? { ...l, status: newStatus, notes } : l
        )
      );
    }

    setSaving(false);
    setEditingLead(null);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-500">Nome</th>
              <th className="px-4 py-3 font-medium text-gray-500">Empresa</th>
              <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">Faturamento</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="hidden px-4 py-3 font-medium text-gray-500 sm:table-cell">Data</th>
              <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nenhum lead encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                      <p className="text-xs text-gray-400">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lead.company}</td>
                  <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                    {lead.revenue_range}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-500 sm:table-cell">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(lead)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      title="Editar lead"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {filtered.length} de {leads.length} leads
      </p>

      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLead.name}
              </h3>
              <button onClick={() => setEditingLead(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-3 space-y-1 text-sm text-gray-500">
              <p>{editingLead.email}</p>
              <p>{editingLead.phone}</p>
              <p>{editingLead.company} — {editingLead.revenue_range}</p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Anotações sobre este lead..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingLead(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
