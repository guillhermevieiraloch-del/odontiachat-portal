"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  BookOpen,
  Stethoscope,
  ListChecks,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabPanel, type TabItem } from "@/components/ui/tabs";
import { PersonalityTab } from "./personality-tab";
import { KnowledgeTab } from "./knowledge-tab";
import { ProceduresTab } from "./procedures-tab";
import { TriageTab } from "./triage-tab";
import { SimulatorTab } from "./simulator-tab";
import type { AIConfig } from "@/lib/mock-ai-config";
import { saveAIConfigAction } from "@/app/(dashboard)/configuracoes/ia/actions";

const TABS: TabItem[] = [
  { id: "personality", label: "Personalidade", icon: MessageCircle },
  { id: "knowledge", label: "Conhecimento", icon: BookOpen },
  { id: "procedures", label: "Procedimentos", icon: Stethoscope },
  { id: "triage", label: "Triagem", icon: ListChecks },
  { id: "simulator", label: "Testar IA", icon: PlayCircle },
];

const TAB_BY_SLUG: Record<string, string> = {
  personalidade: "personality",
  conhecimento: "knowledge",
  procedimentos: "procedures",
  triagem: "triage",
  simulador: "simulator",
  testar: "simulator",
};

export function AIConfigShell({ initial }: { initial: AIConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = TAB_BY_SLUG[searchParams.get("tab") ?? ""] ?? "personality";

  const [config, setConfig] = useState<AIConfig>(initial);
  const [savedConfig, setSavedConfig] = useState<AIConfig>(initial);
  const [active, setActive] = useState(initialTab);
  const [pending, start] = useTransition();
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If server data changes after revalidation, sync local baseline
  useEffect(() => {
    setSavedConfig(initial);
    setConfig((prev) =>
      JSON.stringify(prev) === JSON.stringify(savedConfig) ? initial : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const isDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(savedConfig),
    [config, savedConfig],
  );

  const update = (patch: Partial<AIConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
    setJustSaved(false);
    setError(null);
  };

  const save = () => {
    start(async () => {
      setError(null);
      const result = await saveAIConfigAction(config);
      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar");
        return;
      }
      setSavedConfig(config);
      setJustSaved(true);
      router.refresh();
      setTimeout(() => setJustSaved(false), 3000);
    });
  };

  const reset = () => {
    setConfig(savedConfig);
    setError(null);
  };

  return (
    <div className="pb-24">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          Configuração da IA
        </h1>
        <p className="mt-2 text-text-secondary">
          Personalize como a IA conversa com seus pacientes, o que ela sabe sobre
          a clínica e quando deve transferir para um atendente humano.
        </p>
      </header>

      <Tabs items={TABS} active={active} onChange={setActive} className="mb-6 lg:mb-8" />

      <TabPanel id="personality" active={active}>
        <PersonalityTab config={config} onChange={update} />
      </TabPanel>

      <TabPanel id="knowledge" active={active}>
        <KnowledgeTab config={config} onChange={update} />
      </TabPanel>

      <TabPanel id="procedures" active={active}>
        <ProceduresTab config={config} onChange={update} />
      </TabPanel>

      <TabPanel id="triage" active={active}>
        <TriageTab config={config} onChange={update} />
      </TabPanel>

      <TabPanel id="simulator" active={active}>
        <SimulatorTab config={config} />
      </TabPanel>

      {(isDirty || justSaved || error) && (
        <div
          className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-border bg-bg-base/95 backdrop-blur shadow-[0_-4px_20px_rgba(13,59,102,0.08)] animate-fade-in-up"
          role="status"
          aria-live="polite"
        >
          <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              {error ? (
                <>
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-danger"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-danger">{error}</span>
                </>
              ) : justSaved ? (
                <>
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-success"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-success">
                    Alterações salvas com sucesso
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-warning animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-text-primary">
                    Alterações não salvas
                  </span>
                </>
              )}
            </div>

            {!justSaved && isDirty && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  disabled={pending}
                >
                  Descartar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={save}
                  disabled={pending}
                >
                  {pending ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
