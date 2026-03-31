"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, useDroppable, useDraggable,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { STATUS_CONFIG, STATUS_ORDER, type Lead, type LeadStatus } from "@/lib/types";
import { Building2, Phone, GripVertical } from "lucide-react";

function KanbanCard({ lead, isDragOverlay }: { lead: Lead; isDragOverlay?: boolean }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm select-none ${
        isDragOverlay
          ? "shadow-xl rotate-1 border-primary/30"
          : "border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-400 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{lead.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const cfg = STATUS_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const dotColor = cfg.color.split(" ")[0];

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cfg.label}</span>
        </div>
        <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 overflow-y-auto p-2 flex-1 transition-colors rounded-b-xl ${
          isOver ? "bg-blue-50/70 dark:bg-blue-950/30" : ""
        }`}
      >
        {leads.length === 0 && (
          <div className={`my-2 rounded-lg border-2 border-dashed py-8 text-center text-xs transition-colors ${
            isOver
              ? "border-primary/40 text-primary"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
          }`}>
            {isOver ? "Soltar aqui" : "Sem leads"}
          </div>
        )}
        {leads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)}
        {leads.length > 0 && isOver && (
          <div className="rounded-lg border-2 border-dashed border-primary/40 py-4 text-center text-xs text-primary">
            Soltar aqui
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const supabase = useRef(createSupabaseBrowser());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    supabase.current
      .from("leads").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads(data ?? []); setLoading(false); });
  }, []);

  const grouped = STATUS_ORDER.reduce<Record<LeadStatus, Lead[]>>(
    (acc, status) => { acc[status] = leads.filter((l) => l.status === status); return acc; },
    {} as Record<LeadStatus, Lead[]>
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) { setActiveId(event.active.id as string); }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    await supabase.current.from("leads").update({ status: newStatus }).eq("id", leadId);
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Carregando kanban...</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white shrink-0">Kanban</h1>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn key={status} status={status} leads={grouped[status]} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeLead ? <KanbanCard lead={activeLead} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
