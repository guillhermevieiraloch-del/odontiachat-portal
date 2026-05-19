"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireUser();
  await db.lead.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/leads");
}
