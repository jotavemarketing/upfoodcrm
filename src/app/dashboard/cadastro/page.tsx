"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { STATUS_CONFIG, type LeadStatus } from "@/lib/types";
import { CheckCircle, AlertCircle, Instagram } from "lucide-react";

const REVENUE_RANGES = [
  "Até R$ 50 mil/mês",
  "R$ 50 mil – R$ 150 mil/mês",
  "R$ 150 mil – R$ 500 mil/mês",
  "R$ 500 mil – R$ 1 milhão/mês",
  "Acima de R$ 1 milhão/mês",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  revenue_range: "",
  instagram: "",
  status: "novo" as LeadStatus,
  notes: "",
};

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export default function CadastroPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handlePhone(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
    setFeedback(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("leads").insert([form]);
    if (error) {
      setFeedback({ type: "error", message: "Erro ao cadastrar lead. Tente novamente." });
    } else {
      setFeedback({ type: "success", message: "Lead cadastrado com sucesso!" });
      setForm(EMPTY_FORM);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastrar Lead</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Adicione um novo lead manualmente ao CRM.</p>
      </div>

      {feedback && (
        <div className={`mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
          feedback.type === "success" ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Ex: João Silva" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="joao@empresa.com" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input type="tel" name="phone" value={form.phone} onChange={handlePhone} required placeholder="(11) 99999-9999" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Empresa <span className="text-red-500">*</span>
            </label>
            <input type="text" name="company" value={form.company} onChange={handleChange} required placeholder="Nome da empresa" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Faturamento mensal <span className="text-red-500">*</span>
            </label>
            <select name="revenue_range" value={form.revenue_range} onChange={handleChange} required className={inputCls}>
              <option value="">Selecione uma faixa</option>
              {REVENUE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Instagram className="h-4 w-4 text-pink-500" /> Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
              <input
                type="text" name="instagram" value={form.instagram} onChange={handleChange}
                placeholder="usuario"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 pl-7 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status inicial</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Informações adicionais sobre o lead..." className={inputCls} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
            {saving ? "Cadastrando..." : "Cadastrar lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
