"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { TRIAL_DURATION_DAYS } from "@/lib/plans";

const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  clinicName: z.string().min(2, "Informe o nome da clínica").optional(),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  inviteToken: z.string().optional(),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof signupSchema>, string>>;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const inviteToken = formData.get("inviteToken")?.toString() || undefined;

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    clinicName: formData.get("clinicName") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    inviteToken,
  });

  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<
        SignupState["fieldErrors"]
      >;
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, clinicName, email, password } = parsed.data;

  // If signing up via invite, validate the invite first
  let invite = null;
  if (inviteToken) {
    invite = await db.invite.findUnique({
      where: { token: inviteToken },
      include: { clinic: { select: { id: true, name: true } } },
    });
    if (!invite) return { error: "Convite inválido" };
    if (invite.acceptedAt) return { error: "Esse convite já foi aceito" };
    if (invite.expiresAt < new Date()) return { error: "Esse convite expirou" };
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return {
        fieldErrors: { email: "Use o e-mail pra qual o convite foi enviado" },
      };
    }
  } else if (!clinicName) {
    return { fieldErrors: { clinicName: "Informe o nome da clínica" } };
  }

  // 1. Create the auth user via admin API (auto-confirms so they can sign in immediately).
  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError || !created.user) {
    if (createError?.message.toLowerCase().includes("already")) {
      return { fieldErrors: { email: "Este e-mail já está cadastrado." } };
    }
    return { error: createError?.message || "Falha ao criar conta." };
  }

  // 2. Either link to existing clinic (via invite) or create a new one.
  try {
    if (invite) {
      // Invite flow — link to existing clinic, mark invite as accepted
      await db.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: created.user.id,
            email,
            name,
            role: invite.role,
            clinicId: invite.clinicId,
          },
        });
        await tx.invite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        });
      });
    } else {
      // Self-signup — create new Clinic in 14-day free trial
      const trialEndsAt = new Date(
        Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
      );
      await db.$transaction(async (tx) => {
        const clinic = await tx.clinic.create({
          data: {
            name: clinicName!,
            email,
            plan: "trial",
            trialEndsAt,
            aiConfig: { create: {} },
          },
        });
        await tx.user.create({
          data: {
            id: created.user.id,
            email,
            name,
            role: "ADMIN",
            clinicId: clinic.id,
          },
        });
      });
    }
  } catch {
    // Roll back the auth user if the DB step fails.
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return { error: "Não foi possível criar sua conta. Tente novamente." };
  }

  // 3. Sign the user in (sets the session cookies).
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  // 4. Welcome email — só quando é signup normal (não via invite, o convidado já teve email)
  if (!invite) {
    const origin =
      process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
    sendWelcomeEmail({
      name,
      email,
      clinicName: clinicName!,
      loginUrl: `${origin}/login`,
    }).catch((err) => console.error("Welcome email falhou:", err));
  }

  if (invite) {
    // Invited members skip onboarding — clinic is already setup
    redirect("/dashboard");
  }

  redirect("/onboarding");
}
