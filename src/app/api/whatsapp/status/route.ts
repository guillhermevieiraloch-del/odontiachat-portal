import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { botClient } from "@/lib/bot-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const { clinic } = await requireUser();
  try {
    const status = await botClient.getStatus(clinic.id);
    let qrImage: string | null = null;
    if (status.qr) {
      qrImage = await QRCode.toDataURL(status.qr, {
        width: 280,
        margin: 1,
        color: { dark: "#0D3B66", light: "#FFFFFF" },
      });
    }
    return NextResponse.json({ ...status, qrImage });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        qr: null,
        connectedAt: null,
        lastError: (err as Error).message,
      },
      { status: 200 },
    );
  }
}
