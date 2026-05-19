"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export type ResetState = {
  error?: string;
  fieldErrors?: { password?: string; confirm?: string };
};

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: ResetState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<ResetState["fieldErrors"]>;
      fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
