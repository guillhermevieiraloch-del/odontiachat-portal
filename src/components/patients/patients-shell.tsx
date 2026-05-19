"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PatientCard } from "./patient-card";
import { PatientList } from "./patient-list";
import { PatientDetailDrawer } from "./patient-detail-drawer";
import { NewPatientModal } from "./new-patient-modal";
import type { CRMPatient } from "@/lib/mock-patients-data";

type View = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";
type SortKey = "lastContact" | "name" | "totalSpent";

const PAGE_SIZE = 9;

interface Props {
  patients: CRMPatient[];
}

export function PatientsShell({ patients: allPatients }: Props) {
  const [view, setView] = useState<View>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("lastContact");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = allPatients.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false)
      );
    });

    arr.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "lastContact":
        default:
          return (
            new Date(b.lastContactAt).getTime() -
            new Date(a.lastContactAt).getTime()
          );
      }
    });

    return arr;
  }, [allPatients, search, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // Reset to page 1 when filters change
  const updateSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const updateStatus = (v: StatusFilter) => {
    setStatusFilter(v);
    setPage(1);
  };
  const updateSort = (v: SortKey) => {
    setSort(v);
    setPage(1);
  };

  const selected: CRMPatient | null = selectedId
    ? allPatients.find((p) => p.id === selectedId) ?? null
    : null;

  const totalActive = allPatients.filter((p) => p.status === "active").length;

  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Pacientes
          </h1>
          <p className="mt-2 text-text-secondary">
            <strong className="text-text-primary tabular-nums">{allPatients.length}</strong>{" "}
            pacientes cadastrados ·{" "}
            <strong className="text-success tabular-nums">{totalActive}</strong> ativos
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setNewOpen(true)}>
          <Plus size={16} />
          <span className="hidden sm:inline">Novo paciente</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </header>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <label className="flex items-center h-11 rounded-md border border-border bg-bg-base px-3 gap-2 focus-within:border-brand-accent focus-within:ring-[3px] focus-within:ring-brand-accent/20 transition-colors duration-200 flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            aria-label="Buscar pacientes"
          />
        </label>

        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => updateStatus(v as StatusFilter)}
          options={[
            { value: "all", label: "Todos" },
            { value: "active", label: "Ativos" },
            { value: "inactive", label: "Inativos" },
          ]}
        />

        <FilterSelect
          label="Ordenar"
          value={sort}
          onChange={(v) => updateSort(v as SortKey)}
          options={[
            { value: "lastContact", label: "Último contato" },
            { value: "name", label: "Nome (A-Z)" },
            { value: "totalSpent", label: "Total gasto" },
          ]}
        />

        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Content */}
      {pageItems.length === 0 ? (
        <EmptyState hasFilters={!!search || statusFilter !== "all"} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageItems.map((p) => (
            <PatientCard key={p.id} patient={p} onSelect={setSelectedId} />
          ))}
        </div>
      ) : (
        <PatientList patients={pageItems} onSelect={setSelectedId} />
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          pageStart={pageStart}
          pageEnd={Math.min(pageStart + PAGE_SIZE, filtered.length)}
          onChange={setPage}
        />
      )}

      <PatientDetailDrawer
        patient={selected}
        onClose={() => setSelectedId(null)}
      />

      <NewPatientModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualização"
      className="inline-flex items-center rounded-md border border-border bg-bg-base p-1 h-11"
    >
      <button
        type="button"
        role="radio"
        aria-checked={view === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200",
          view === "grid"
            ? "bg-brand-primary text-white"
            : "text-text-secondary hover:text-text-primary",
        )}
        aria-label="Visualização em cards"
      >
        <LayoutGrid size={14} />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200",
          view === "list"
            ? "bg-brand-primary text-white"
            : "text-text-secondary hover:text-text-primary",
        )}
        aria-label="Visualização em lista"
      >
        <List size={14} />
      </button>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-md border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 cursor-pointer"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {label}: {o.label}
        </option>
      ))}
    </select>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageStart,
  pageEnd,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageStart: number;
  pageEnd: number;
  onChange: (p: number) => void;
}) {
  return (
    <nav
      aria-label="Paginação"
      className="mt-6 flex items-center justify-between gap-3 flex-wrap"
    >
      <p className="text-sm text-text-secondary">
        Mostrando <strong>{pageStart + 1}</strong>–<strong>{pageEnd}</strong> de{" "}
        <strong>{total}</strong>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-bg-mist hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 text-sm font-semibold text-text-primary min-h-11 flex items-center">
          {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-bg-mist hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-base p-12 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-mist text-text-muted mb-4">
        <Users size={24} />
      </div>
      <p className="font-display font-bold text-lg text-text-primary">
        {hasFilters
          ? "Nenhum paciente encontrado"
          : "Você ainda não tem pacientes cadastrados"}
      </p>
      <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
        {hasFilters
          ? "Tente ajustar os filtros ou a busca."
          : "Conforme a IA atender pacientes pelo WhatsApp, eles serão cadastrados automaticamente."}
      </p>
    </div>
  );
}
