/**
 * CSV export endpoint — Pro tier only.
 *
 * /api/export/pacientes
 * /api/export/agendamentos
 * /api/export/conversas
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { toCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";

type Dataset = "pacientes" | "agendamentos" | "conversas";

const DATASETS: Dataset[] = ["pacientes", "agendamentos", "conversas"];

function csvResponse(filename: string, content: string): NextResponse {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await params;

  if (!DATASETS.includes(dataset as Dataset)) {
    return NextResponse.json({ error: "dataset_invalid" }, { status: 404 });
  }

  const { clinic } = await requireUser();
  const plan = getPlan(clinic.plan);

  if (!plan.features.csvExport) {
    return NextResponse.json(
      {
        error: "plan_required",
        message: "Exportação CSV é exclusiva do plano Pro",
      },
      { status: 403 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  if (dataset === "pacientes") {
    const rows = await db.patient.findMany({
      where: { clinicId: clinic.id },
      orderBy: { name: "asc" },
      select: {
        name: true,
        phone: true,
        email: true,
        birthDate: true,
        status: true,
        createdAt: true,
      },
    });
    const csv = toCSV(
      rows.map((r) => ({
        ...r,
        birthDate: r.birthDate?.toISOString().slice(0, 10) ?? "",
        createdAt: r.createdAt.toISOString(),
      })),
      [
        { key: "name", header: "Nome" },
        { key: "phone", header: "Telefone" },
        { key: "email", header: "E-mail" },
        { key: "birthDate", header: "Nascimento" },
        { key: "status", header: "Status" },
        { key: "createdAt", header: "Cadastrado em" },
      ],
    );
    return csvResponse(`pacientes-${today}.csv`, csv);
  }

  if (dataset === "agendamentos") {
    const rows = await db.appointment.findMany({
      where: { clinicId: clinic.id },
      orderBy: { startsAt: "desc" },
      include: {
        patient: { select: { name: true, phone: true } },
        procedure: { select: { name: true } },
        dentist: { select: { name: true, specialty: true } },
      },
    });
    const csv = toCSV(
      rows.map((r) => ({
        startsAt: r.startsAt.toISOString(),
        endsAt: r.endsAt.toISOString(),
        patientName: r.patient.name,
        patientPhone: r.patient.phone,
        procedure: r.procedure?.name ?? "",
        dentist: r.dentist?.name ?? "",
        specialty: r.dentist?.specialty ?? "",
        status: r.status,
        notes: r.notes ?? "",
        createdAt: r.createdAt.toISOString(),
      })),
      [
        { key: "startsAt", header: "Início" },
        { key: "endsAt", header: "Fim" },
        { key: "patientName", header: "Paciente" },
        { key: "patientPhone", header: "Telefone" },
        { key: "procedure", header: "Procedimento" },
        { key: "dentist", header: "Dentista" },
        { key: "specialty", header: "Especialidade" },
        { key: "status", header: "Status" },
        { key: "notes", header: "Observações" },
        { key: "createdAt", header: "Agendado em" },
      ],
    );
    return csvResponse(`agendamentos-${today}.csv`, csv);
  }

  // conversas
  const rows = await db.conversation.findMany({
    where: { clinicId: clinic.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      patient: { select: { name: true, phone: true } },
      _count: { select: { messages: true } },
    },
  });
  const csv = toCSV(
    rows.map((r) => ({
      patientName: r.patient?.name ?? "",
      patientPhone: r.patient?.phone ?? "",
      channel: r.channel,
      status: r.status,
      handledBy: r.handledBy,
      messageCount: r._count.messages,
      lastMessageAt: r.lastMessageAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    })),
    [
      { key: "patientName", header: "Paciente" },
      { key: "patientPhone", header: "Telefone" },
      { key: "channel", header: "Canal" },
      { key: "status", header: "Status" },
      { key: "handledBy", header: "Atendido por" },
      { key: "messageCount", header: "Qtd. mensagens" },
      { key: "lastMessageAt", header: "Última mensagem" },
      { key: "createdAt", header: "Iniciada em" },
    ],
  );
  return csvResponse(`conversas-${today}.csv`, csv);
}
