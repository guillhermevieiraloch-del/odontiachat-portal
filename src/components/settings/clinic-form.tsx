"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/constants";
import { SettingsSection } from "./settings-section";
import { StickySaveBar } from "./sticky-save-bar";
import { saveClinicAction } from "@/app/(dashboard)/configuracoes/clinica/actions";

interface DayHours {
  open: boolean;
  start?: string;
  end?: string;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface ClinicFormInitial {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  description: string;
  workingHours: Record<string, DayHours>;
}

export function ClinicForm({ initial }: { initial: ClinicFormInitial }) {
  const router = useRouter();
  const [state, setState] = useState<ClinicFormInitial>(initial);
  const [saved, setSaved] = useState<ClinicFormInitial>(initial);
  const [pending, start] = useTransition();
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(saved),
    [state, saved],
  );

  const update = <K extends keyof ClinicFormInitial>(k: K, v: ClinicFormInitial[K]) => {
    setState((s) => ({ ...s, [k]: v }));
    setJustSaved(false);
    setError(null);
  };

  const updateDay = (day: string, patch: Partial<DayHours>) => {
    setState((s) => ({
      ...s,
      workingHours: {
        ...s.workingHours,
        [day]: { ...s.workingHours[day], ...patch },
      },
    }));
    setJustSaved(false);
  };

  const toggleLunch = (day: string) => {
    setState((s) => {
      const cur = s.workingHours[day];
      const next = cur.lunchStart
        ? { ...cur, lunchStart: undefined, lunchEnd: undefined }
        : { ...cur, lunchStart: "12:00", lunchEnd: "13:00" };
      return { ...s, workingHours: { ...s.workingHours, [day]: next } };
    });
    setJustSaved(false);
  };

  const handleSave = () => {
    start(async () => {
      setError(null);
      const result = await saveClinicAction(state);
      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar");
        return;
      }
      setSaved(state);
      setJustSaved(true);
      router.refresh();
      setTimeout(() => setJustSaved(false), 3000);
    });
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
          Dados da clínica
        </h1>
        <p className="mt-2 text-text-secondary">
          Edite as informações que a IA usa pra responder pacientes e que aparecem
          em comunicações com sua clínica.
        </p>
      </header>

      {/* Logo */}
      <SettingsSection
        title="Logo"
        description="Imagem usada nas comunicações e no portal."
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-bg-mist text-text-muted flex-shrink-0">
            <Building2 size={28} />
          </div>
          <div className="flex-1">
            <Button variant="outline" size="md" type="button">
              <Upload size={14} />
              Enviar logo
            </Button>
            <p className="text-xs text-text-muted mt-2">
              PNG ou JPG, mínimo 200×200px, máximo 2MB
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Identificação */}
      <SettingsSection title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome da clínica" htmlFor="name" required>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="CNPJ" htmlFor="cnpj">
            <Input
              id="cnpj"
              value={state.cnpj}
              onChange={(e) => update("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </Field>
          <Field label="E-mail" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Telefone" htmlFor="phone">
            <Input
              id="phone"
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(00) 0000-0000"
            />
          </Field>
        </div>
      </SettingsSection>

      {/* Endereço */}
      <SettingsSection title="Endereço">
        <div className="space-y-4">
          <Field label="Endereço completo" htmlFor="address">
            <Input
              id="address"
              value={state.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Cidade" htmlFor="city" className="col-span-2">
              <Input
                id="city"
                value={state.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </Field>
            <Field label="UF" htmlFor="state">
              <Input
                id="state"
                value={state.state}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
                maxLength={2}
              />
            </Field>
          </div>
        </div>
      </SettingsSection>

      {/* Horário de funcionamento */}
      <SettingsSection
        title="Horário de funcionamento"
        description="A IA respeita esses horários para agendar e enviar lembretes."
      >
        <div className="space-y-2">
          {WEEKDAYS.map((d) => {
            const cur = state.workingHours[d.id];
            return (
              <div
                key={d.id}
                className={cn(
                  "rounded-md border px-4 py-3 transition-colors duration-200",
                  cur.open
                    ? "border-border bg-bg-base"
                    : "border-border bg-bg-soft opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <label className="flex items-center gap-3 min-w-[140px] min-h-11">
                    <input
                      type="checkbox"
                      checked={cur.open}
                      onChange={(e) => updateDay(d.id, { open: e.target.checked })}
                      className="h-4 w-4 rounded accent-brand-primary"
                    />
                    <span className="font-semibold text-text-primary">{d.label}</span>
                  </label>

                  {cur.open ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="time"
                        value={cur.start ?? ""}
                        onChange={(e) => updateDay(d.id, { start: e.target.value })}
                        className="h-11 w-28"
                        aria-label={`Início ${d.label}`}
                      />
                      <span className="text-text-muted text-sm">até</span>
                      <Input
                        type="time"
                        value={cur.end ?? ""}
                        onChange={(e) => updateDay(d.id, { end: e.target.value })}
                        className="h-11 w-28"
                        aria-label={`Fim ${d.label}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleLunch(d.id)}
                        className="ml-2 text-xs font-semibold text-brand-primary hover:underline min-h-11 inline-flex items-center"
                      >
                        {cur.lunchStart ? "− Remover almoço" : "+ Pausa almoço"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted">Fechado</span>
                  )}
                </div>

                {cur.open && cur.lunchStart && (
                  <div className="mt-2 ml-[148px] flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-text-muted">Almoço:</span>
                    <Input
                      type="time"
                      value={cur.lunchStart}
                      onChange={(e) => updateDay(d.id, { lunchStart: e.target.value })}
                      className="h-9 w-24 text-sm"
                      aria-label={`Início almoço ${d.label}`}
                    />
                    <span className="text-text-muted text-xs">até</span>
                    <Input
                      type="time"
                      value={cur.lunchEnd ?? ""}
                      onChange={(e) => updateDay(d.id, { lunchEnd: e.target.value })}
                      className="h-9 w-24 text-sm"
                      aria-label={`Fim almoço ${d.label}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <StickySaveBar
        isDirty={isDirty}
        justSaved={justSaved}
        pending={pending}
        error={error}
        onSave={handleSave}
        onReset={() => { setState(saved); setError(null); }}
      />
    </div>
  );
}
