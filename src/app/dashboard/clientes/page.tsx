import { createSupabaseServer } from "@/lib/supabase-server";
import type { Lead } from "@/lib/types";
import Link from "next/link";
import { Building2, Phone, Mail, DollarSign, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "fechado")
    .order("updated_at", { ascending: false });

  const clientes = (data ?? []) as Lead[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Leads com status <span className="font-medium text-green-700">Fechado</span> — {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-400">Nenhum cliente ainda.</p>
          <p className="mt-1 text-sm text-gray-400">
            Mude o status de um lead para <span className="font-medium">Fechado</span> para ele aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/dashboard/leads/${cliente.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {cliente.name}
                  </p>
                  <span className="inline-block mt-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Cliente
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{cliente.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{cliente.revenue_range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate text-xs">{cliente.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span>{cliente.phone}</span>
                </div>
              </div>

              {cliente.notes && (
                <p className="mt-3 line-clamp-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  {cliente.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
