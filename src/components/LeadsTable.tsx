"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { STATUS_CONFIG, type Lead, type LeadStatus } from "@/lib/types";
import { Search, ChevronDown, MessageSquare, X, Instagram } from "lucide-react";

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
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
    const matchesStatus = filterStatus === "todos" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function openEdit(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation();
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
        prev.map((l) => (l.id === editingLead.id ? { ...l, status: newStatus, notes } : l))
      );
    }
    setSaving(false);
    setEditingLead(null);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

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
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nome</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Empresa</th>
              <th className="hidden px-4 py-3 font-medium text-gray-500 dark:text-gray-400 md:table-cell">Faturamento</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="hidden px-4 py-3 font-medium text-gray-500 dark:text-gray-400 sm:table-cell">Data</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  Nenhum lead encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{lead.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{lead.phone}</p>
                      {lead.instagram && (
                        <a
                          href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                        >
                          <Instagram className="h-3 w-3" />
                          {lead.instagram.startsWith("@") ? lead.instagram : `@${lead.instagram}`}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{lead.company}</td>
                  <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell">{lead.revenue_range}</td>
                  <td className="px-4 py-3"><LeadStatusBadge status={lead.status} /></td>
                  <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 sm:table-cell">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => openEdit(e, lead)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Editar rápido"
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

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        {filtered.length} de {leads.length} leads
      </p>

      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingLead.name}</h3>
              <button onClick={() => setEditingLead(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mb-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <p>{editingLead.email}</p>
              <p>{editingLead.phone}</p>
              <p>{editingLead.company} — {editingLead.revenue_range}</p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                className={inputCls}
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder="Anotações sobre este lead..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingLead(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
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
