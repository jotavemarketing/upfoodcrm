export type LeadStatus = "novo" | "contatado" | "qualificado" | "proposta" | "fechado" | "perdido";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  revenue_range: string;
  status: LeadStatus;
  instagram: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contatado: { label: "Contatado", color: "bg-yellow-100 text-yellow-700" },
  qualificado: { label: "Qualificado", color: "bg-purple-100 text-purple-700" },
  proposta: { label: "Proposta", color: "bg-orange-100 text-orange-700" },
  fechado: { label: "Fechado", color: "bg-green-100 text-green-700" },
  perdido: { label: "Perdido", color: "bg-gray-100 text-gray-500" },
};

export const STATUS_ORDER: LeadStatus[] = [
  "novo", "contatado", "qualificado", "proposta", "fechado", "perdido",
];

export type AgendamentoStatus = "pendente" | "realizado" | "cancelado";

export interface Agendamento {
  id: string;
  lead_id: string;
  titulo: string;
  descricao: string;
  data_hora: string;
  status: AgendamentoStatus;
  created_at: string;
  leads?: { name: string; company: string };
}
