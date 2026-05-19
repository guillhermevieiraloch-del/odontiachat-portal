import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeamPage } from "@/components/settings/team-page";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const { clinic, authUser } = await requireUser();

  const [members, invites] = await Promise.all([
    db.user.findMany({
      where: { clinicId: clinic.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.invite.findMany({
      where: { clinicId: clinic.id, acceptedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
    }),
  ]);

  return (
    <TeamPage
      currentUserId={authUser.id}
      members={members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
      }))}
      invites={invites.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        sentAt: i.createdAt.toISOString(),
        expiresAt: i.expiresAt.toISOString(),
      }))}
    />
  );
}
