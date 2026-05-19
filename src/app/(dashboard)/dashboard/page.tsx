import { CalendarCheck, TrendingUp, ShieldCheck, Users, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDateBR, getGreeting } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HeroStat } from "@/components/dashboard/hero-stat";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ConversationsCard } from "@/components/dashboard/conversations-card";
import { AppointmentsCard } from "@/components/dashboard/appointments-card";
import { AIStatusCard } from "@/components/dashboard/ai-status-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SetupChecklistCard } from "@/components/dashboard/setup-checklist";
import {
  getDashboardMetrics,
  getActivityChartData,
  getActiveConversationsPreview,
  getUpcomingAppointmentsPreview,
  getMetricSparklines,
} from "@/lib/queries/dashboard";
import { getSetupChecklist } from "@/lib/queries/setup-checklist";
import { botClient } from "@/lib/bot-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile, clinic } = await requireUser();

  const [m, chartData, conversations, appointments, whatsappStatus, sparks] =
    await Promise.all([
      getDashboardMetrics(clinic.id),
      getActivityChartData(clinic.id),
      getActiveConversationsPreview(clinic.id),
      getUpcomingAppointmentsPreview(clinic.id),
      botClient.getStatus(clinic.id).catch(() => null),
      getMetricSparklines(clinic.id),
    ]);

  const whatsappConnected = whatsappStatus?.status === "ready";
  const setup = await getSetupChecklist(clinic, whatsappConnected);
  const aiStatus: "active" | "paused" | "offline" = whatsappConnected
    ? "active"
    : whatsappStatus?.status === "qr" || whatsappStatus?.status === "connecting"
      ? "paused"
      : "offline";

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      <SetupChecklistCard checklist={setup} />

      {/* ─── Header com saudação ─── */}
      <header className="animate-fade-in-up">
        <p className="text-sm text-text-muted capitalize">
          {formatDateBR(new Date())}
        </p>
        <h1 className="mt-1 text-4xl md:text-5xl font-display font-extrabold text-text-primary tracking-tight">
          {getGreeting()},{" "}
          <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-2 text-text-secondary text-base">
          Aqui está o resumo da <strong className="text-text-primary">{clinic.name}</strong>.
        </p>
      </header>

      {/* ─── Hero principal: conversas hoje ─── */}
      <HeroStat
        eyebrow="Hoje"
        label="Conversas atendidas"
        value={m.conversationsToday.value}
        caption={
          m.conversationsToday.value > 0
            ? `Pacientes em contato com sua clínica neste momento.`
            : "Quando os primeiros pacientes mandarem mensagem, eles vão aparecer aqui."
        }
        delta={m.conversationsToday.deltaPct}
        deltaLabel="vs. ontem"
        sparkData={sparks.conversations}
        pills={[
          aiStatus === "active"
            ? { label: "IA respondendo", tone: "success", pulsing: true }
            : aiStatus === "paused"
              ? { label: "IA pausada", tone: "warning" }
              : { label: "WhatsApp desconectado", tone: "danger" },
          whatsappConnected
            ? { label: "Google Calendar sincronizado", tone: "info" }
            : { label: "Aguardando conexão", tone: "warning" },
        ]}
        cta={
          conversations.length > 0
            ? { label: "Ver inbox", href: "/inbox" }
            : { label: "Configurar IA", href: "/configuracoes/ia" }
        }
        miniStats={[
          {
            label: "Em atendimento",
            value: String(conversations.length),
            icon: Users,
          },
          {
            label: "Resp. média",
            value: aiStatus === "active" ? "~15s" : "—",
            icon: Zap,
          },
        ]}
      />

      {/* ─── Métricas secundárias (3 cards) ─── */}
      <section
        aria-label="Métricas secundárias"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5"
      >
        <MetricCard
          label="Agendamentos próximos"
          value={m.upcomingAppointments}
          caption="confirmados nos próximos 7 dias"
          icon={CalendarCheck}
          iconBg="accent"
          sparkData={sparks.appointments}
          delay={80}
        />
        <MetricCard
          label="Taxa de conversão"
          value={`${m.conversionRate.value}%`}
          caption="conversas → consultas (30d)"
          icon={TrendingUp}
          iconBg="primary"
          delay={160}
        />
        <MetricCard
          label="Lembretes enviados"
          value={m.noShowsAvoided}
          caption="pacientes notificados no mês"
          icon={ShieldCheck}
          iconBg="success"
          sparkData={sparks.reminders}
          delay={240}
        />
      </section>

      {/* ─── Activity + AI Status (2 colunas) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
        <div className="xl:col-span-2">
          <ActivityChart data={chartData} />
        </div>
        <AIStatusCard
          initialStatus={aiStatus}
          lastActivity={
            whatsappStatus?.connectedAt
              ? new Date(whatsappStatus.connectedAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined
          }
        />
      </div>

      {/* ─── Conversas + Agendamentos (2 colunas) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ConversationsCard items={conversations} />
        <AppointmentsCard items={appointments} />
      </div>

      <QuickActions />
    </div>
  );
}
