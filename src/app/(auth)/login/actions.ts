"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<LoginState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "E-mail ou senha incorretos." };
  }

  // Decide where to send the user based on onboarding state.
  const profile = await db.user.findUnique({
    where: { id: data.user.id },
    include: { clinic: { select: { onboardingDone: true } } },
  });

  if (!profile) {
    return { error: "Conta não vinculada a nenhuma clínica. Fale com o suporte." };
  }

  redirect(profile.clinic.onboardingDone ? "/dashboard" : "/onboarding");
}
