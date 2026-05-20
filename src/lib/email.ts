import type { Lead } from "@prisma/client";

/**
 * Sends a lead notification email to the sales address.
 * Uses Resend if RESEND_API_KEY is set, otherwise just logs to console.
 *
 * To enable real sending:
 *   1. Sign up at https://resend.com (free 100/day, 3k/month)
 *   2. Get an API key
 *   3. Add to portal/.env:
 *        RESEND_API_KEY=re_...
 *        LEAD_NOTIFY_EMAIL=you@your-email.com
 *        EMAIL_FROM=OdontIAChat <noreply@your-domain.com>  (must be a verified domain in Resend)
 */
export async function sendLeadNotification(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM ?? "OdontIAChat <onboarding@resend.dev>";

  const subject = `[Lead] ${lead.clinicName} — ${lead.name}`;
  const text = formatLeadEmail(lead);

  if (!apiKey || !to) {
    // Dev mode fallback — just log it
    console.log("\n══════════════════════════════════════════════");
    console.log("📥 NOVO LEAD (modo dev — sem envio de e-mail)");
    console.log("══════════════════════════════════════════════");
    console.log(subject);
    console.log("");
    console.log(text);
    console.log("══════════════════════════════════════════════\n");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      reply_to: lead.email,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend respondeu ${res.status}: ${err}`);
  }
}

interface WelcomePayload {
  name: string;
  email: string;
  clinicName: string;
  loginUrl: string;
}

export async function sendWelcomeEmail(payload: WelcomePayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OdontIAChat <onboarding@resend.dev>";

  const subject = `Bem-vindo(a) à OdontIAChat, ${payload.name.split(" ")[0]}!`;
  const text = [
    `Olá, ${payload.name}!`,
    ``,
    `Sua conta da OdontIAChat foi criada com sucesso. 🎉`,
    ``,
    `🏥 Clínica: ${payload.clinicName}`,
    `📧 E-mail: ${payload.email}`,
    `🔐 Acesso: ${payload.loginUrl}`,
    ``,
    `Próximos passos:`,
    `  1. Faça login no portal`,
    `  2. Complete o onboarding em 4 passos (5 min)`,
    `  3. Configure sua IA em "Configurações > IA"`,
    `  4. Conecte seu WhatsApp em "Configurações > WhatsApp"`,
    ``,
    `Qualquer dúvida, é só responder esse e-mail.`,
    ``,
    `OdontIAChat — A IA da odontologia.`,
  ].join("\n");

  if (!apiKey) {
    console.log("\n══════════════════════════════════════════════");
    console.log("📨 WELCOME EMAIL (modo dev — sem envio real)");
    console.log("══════════════════════════════════════════════");
    console.log(`Para: ${payload.email}`);
    console.log(subject);
    console.log("");
    console.log(text);
    console.log("══════════════════════════════════════════════\n");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend respondeu ${res.status}: ${err}`);
  }
}

interface InvitePayload {
  email: string;
  inviterName: string;
  clinicName: string;
  role: "ADMIN" | "ATTENDANT" | "DENTIST";
  acceptUrl: string;
}

const ROLE_LABELS = {
  ADMIN: "Administrador",
  ATTENDANT: "Atendente",
  DENTIST: "Dentista",
};

export async function sendInviteEmail(payload: InvitePayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OdontIAChat <onboarding@resend.dev>";

  const subject = `${payload.inviterName} te convidou pra ${payload.clinicName}`;
  const text = [
    `Olá!`,
    ``,
    `Você foi convidado(a) pra fazer parte da equipe da ${payload.clinicName} no OdontIAChat.`,
    ``,
    `👤 Papel: ${ROLE_LABELS[payload.role]}`,
    `📧 E-mail: ${payload.email}`,
    ``,
    `Pra aceitar e criar sua conta, clica no link abaixo:`,
    payload.acceptUrl,
    ``,
    `O convite expira em 7 dias.`,
    ``,
    `Se você não esperava esse e-mail, pode ignorar — nada acontece.`,
    ``,
    `OdontIAChat — A IA da odontologia.`,
  ].join("\n");

  if (!apiKey) {
    console.log("\n══════════════════════════════════════════════");
    console.log("📨 INVITE EMAIL (modo dev — sem envio real)");
    console.log("══════════════════════════════════════════════");
    console.log(`Para: ${payload.email}`);
    console.log(subject);
    console.log("");
    console.log(text);
    console.log("══════════════════════════════════════════════\n");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend respondeu ${res.status}: ${err}`);
  }
}

interface UsageAlertPayload {
  to: string;
  clinicName: string;
  threshold: 80 | 95 | 100;
  messagesUsed: number;
  messageLimit: number;
  planLabel: string;
  cycleEnd: Date;
  upgradeUrl: string;
}

export async function sendUsageAlertEmail(
  payload: UsageAlertPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OdontIAChat <onboarding@resend.dev>";

  const isOver = payload.threshold >= 100;
  const subjectMap = {
    80: `Você usou 80% do limite mensal — ${payload.clinicName}`,
    95: `⚠️ Você está quase no limite mensal — ${payload.clinicName}`,
    100: `🚨 Limite mensal atingido — mensagens extras serão cobradas`,
  };

  const subject = subjectMap[payload.threshold];
  const cycleEndStr = payload.cycleEnd.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const lines = [
    `Olá!`,
    ``,
    `A clínica ${payload.clinicName} (plano ${payload.planLabel}) está em ${payload.threshold}% do limite de mensagens do mês.`,
    ``,
    `📊 Usado: ${payload.messagesUsed.toLocaleString("pt-BR")} de ${payload.messageLimit.toLocaleString("pt-BR")} msgs`,
    `📅 Ciclo termina em: ${cycleEndStr}`,
    ``,
  ];

  if (payload.threshold === 80) {
    lines.push(
      `Você ainda tem ${(payload.messageLimit - payload.messagesUsed).toLocaleString("pt-BR")} mensagens disponíveis. Sem urgência, mas vale ficar de olho.`,
    );
  } else if (payload.threshold === 95) {
    lines.push(
      `Cada mensagem após o limite vai custar R$ 0,15.`,
      `Considere fazer upgrade pra evitar excedente: ${payload.upgradeUrl}`,
    );
  } else {
    lines.push(
      `As mensagens extras estão sendo cobradas a R$ 0,15 cada.`,
      `Fazer upgrade pra plano superior costuma sair mais barato: ${payload.upgradeUrl}`,
      ``,
      `O bot continua respondendo normalmente — só te avisamos pra você não ser pego de surpresa na fatura.`,
    );
  }

  lines.push(
    ``,
    `Qualquer dúvida, é só responder esse e-mail.`,
    ``,
    `OdontIAChat`,
  );

  const text = lines.join("\n");

  if (!apiKey) {
    console.log("\n══════════════════════════════════════════════");
    console.log("📨 USAGE ALERT EMAIL (dev mode)");
    console.log(`Para: ${payload.to} | Threshold: ${payload.threshold}%`);
    console.log(subject);
    console.log("");
    console.log(text);
    console.log("══════════════════════════════════════════════\n");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend respondeu ${res.status}: ${err}`);
  }
}

interface TrialEndingPayload {
  to: string;
  clinicName: string;
  daysLeft: number;
  trialEndsAt: Date;
  upgradeUrl: string;
}

export async function sendTrialEndingEmail(
  payload: TrialEndingPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OdontIAChat <onboarding@resend.dev>";

  const subject =
    payload.daysLeft === 0
      ? `Seu teste grátis acabou — escolha um plano pra continuar`
      : `Restam ${payload.daysLeft} dia${payload.daysLeft === 1 ? "" : "s"} de teste — ${payload.clinicName}`;

  const text = [
    `Olá!`,
    ``,
    payload.daysLeft === 0
      ? `O teste grátis da ${payload.clinicName} terminou hoje.`
      : `Restam ${payload.daysLeft} ${payload.daysLeft === 1 ? "dia" : "dias"} do seu teste grátis na ${payload.clinicName}.`,
    ``,
    `Pra manter o atendimento por IA ativo sem interrupção, escolha um plano:`,
    payload.upgradeUrl,
    ``,
    payload.daysLeft === 0
      ? `Seus dados ficam guardados por 30 dias. Se voltar dentro desse prazo, é só assinar um plano e continuar de onde parou.`
      : `Cancele quando quiser. Sem fidelidade.`,
    ``,
    `OdontIAChat`,
  ].join("\n");

  if (!apiKey) {
    console.log("\n══════════════════════════════════════════════");
    console.log("📨 TRIAL ENDING EMAIL (dev mode)");
    console.log(`Para: ${payload.to} | Dias restantes: ${payload.daysLeft}`);
    console.log(subject);
    console.log("");
    console.log(text);
    console.log("══════════════════════════════════════════════\n");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend respondeu ${res.status}: ${err}`);
  }
}

function formatLeadEmail(lead: Lead): string {
  return [
    `Novo lead na landing page:`,
    ``,
    `👤 Nome: ${lead.name}`,
    `📧 E-mail: ${lead.email}`,
    `📱 WhatsApp: ${lead.whatsapp}`,
    `🏥 Clínica: ${lead.clinicName}`,
    `🦷 Dentistas: ${lead.dentists ?? "não informado"}`,
    ``,
    `📅 Recebido em: ${lead.createdAt.toLocaleString("pt-BR")}`,
    `🔗 Ver no admin: http://localhost:3000/admin/leads`,
    ``,
    `Responda esse e-mail para falar direto com o lead.`,
  ].join("\n");
}
