import { db } from "@/lib/db";
import type { Clinic } from "@prisma/client";

export interface SetupItem {
  id: "profile" | "whatsapp" | "procedures" | "google";
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
}

export interface SetupChecklist {
  items: SetupItem[];
  completed: number;
  total: number;
  allDone: boolean;
}

export async function getSetupChecklist(
  clinic: Clinic,
  whatsappReady: boolean,
): Promise<SetupChecklist> {
  const procedureCount = await db.procedure.count({
    where: { clinicId: clinic.id, active: true },
  });

  const items: SetupItem[] = [
    {
      id: "profile",
      title: "Cadastro da clínica",
      description: "Dados básicos, horários e especialidades.",
      href: "/configuracoes/clinica",
      cta: "Revisar",
      done: clinic.onboardingDone,
    },
    {
      id: "whatsapp",
      title: "Conectar WhatsApp",
      description: "Escaneie o QR Code pra IA atender seus pacientes.",
      href: "/configuracoes/whatsapp",
      cta: "Conectar",
      done: whatsappReady,
    },
    {
      id: "procedures",
      title: "Cadastrar procedimentos",
      description: "A IA usa essa lista pra informar valores e durações.",
      href: "/configuracoes/ia?tab=procedimentos",
      cta: "Cadastrar",
      done: procedureCount > 0,
    },
    {
      id: "google",
      title: "Conectar Google Calendar",
      description: "Agendamentos caem direto na sua agenda Google.",
      href: "/configuracoes/integracoes",
      cta: "Conectar",
      done: !!clinic.googleConnectedAt,
    },
  ];

  const completed = items.filter((i) => i.done).length;
  return {
    items,
    completed,
    total: items.length,
    allDone: completed === items.length,
  };
}
