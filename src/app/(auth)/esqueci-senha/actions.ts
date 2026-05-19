"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

export type ForgotState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: { email?: string };
};

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: { email: parsed.error.issues[0]?.message } };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/resetar-senha` },
  );

  // Don't leak whether the email exists — always return ok
  if (error) {
    console.error("Reset password error:", error.message);
  }

  return { ok: true };
}
