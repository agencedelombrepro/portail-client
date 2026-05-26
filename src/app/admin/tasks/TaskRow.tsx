"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { updateRowStatus, updateRowAssignee } from "./task-actions";
import { formatDate } from "@/lib/utils";

const msStatusOptions = [
  { value: "todo",        label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done",        label: "Terminé" },
];
const taskStatusOptions = [
  { value: "todo",        label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done",        label: "Terminé" },
];

const statusColor: Record<string, string> = {
  todo:        "bg-brand-100 text-brand-600",
  in_progress: "bg-yellow-100 text-yellow-700",
  done:        "bg-green-100 text-green-700",
};

interface Profile { id: string; full_name: string; }
interface Row {
  id: string; title: string; priority: string | null; status: string;
  due_date: string | null; description: string | null;
  client: { id: string; company_name: string } | null;
  project: { id: string; name: string } | null;
  assignee: { id: string; full_name: string } | null;
  _source: "task" | "milestone";
}

export function TaskRow({ row, profiles }: { row: Row; profiles: Profile[] }) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(row.status);
  const [assigneeId, setAssigneeId] = useState(row.assignee?.id ?? "");

  const overdue = row.due_date && new Date(row.due_date) < new Date() && status !== "done";
  const options = row._source === "milestone" ? msStatusOptions : taskStatusOptions;

  const handleStatusChange = (val: string) => {
    setStatus(val);
    startTransition(() => updateRowStatus(row._source, row.id, val));
  };

  const handleAssigneeChange = (val: string) => {
    setAssigneeId(val);
    startTransition(() => updateRowAssignee(row._source, row.id, val || null));
  };

  return (
    <tr className={`hover:bg-brand-50/50 transition-colors ${overdue ? "bg-red-50/30" : ""}`}>
      {/* Tâche */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row._source === "milestone" ? "bg-accent" : "bg-brand-400"}`} />
          <p className="text-sm font-medium text-brand-900">{row.title}</p>
        </div>
      </td>

      {/* Client / Projet */}
      <td className="px-4 py-3 text-sm">
        {row.client && (
          <Link href={`/admin/clients/${row.client.id}`} className="text-brand-700 hover:text-accent font-medium block">
            {row.client.company_name}
          </Link>
        )}
        {row.project && (
          <Link href={`/admin/projects/${row.project.id}`} className="text-xs text-brand-400 hover:text-accent">
            {row.project.name}
          </Link>
        )}
      </td>

      {/* Statut — inline select */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer outline-none ${statusColor[status] ?? "bg-brand-100 text-brand-600"}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>

      {/* Échéance */}
      <td className="px-4 py-3 hidden md:table-cell">
        {row.due_date
          ? <span className={`text-sm font-medium ${overdue ? "text-red-600" : "text-brand-600"}`}>
              {formatDate(row.due_date)}{overdue && " ⚠"}
            </span>
          : <span className="text-brand-300 text-sm">—</span>
        }
      </td>

      {/* Assigné — inline select */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <select
          value={assigneeId}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          className="text-sm text-brand-600 bg-transparent border-0 cursor-pointer outline-none hover:text-accent w-full max-w-[140px] truncate"
        >
          <option value="">—</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}
