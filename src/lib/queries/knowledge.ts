import "server-only";
import { db } from "@/lib/db";
import type { KnowledgeFormInitial } from "@/components/knowledge/knowledge-form";

interface FaqItem {
  question: string;
  answer: string;
}

const EMPTY_INITIAL: KnowledgeFormInitial = {
  addressReferences: "",
  parkingInfo: "",
  accessibilityInfo: "",
  publicTransportInfo: "",
  acceptsChildren: true,
  childrenMinAge: "",
  emergencyInfo: "",
  averageWaitTime: "",
  languagesSpoken: ["Português"],
  cancellationPolicy: "",
  latenessPolicy: "",
  noShowPolicy: "",
  firstVisitInfo: "",
  firstVisitDuration: "",
  yearsInBusiness: null,
  differentiators: "",
  teamDescription: "",
  notOfferedProcedures: "",
  partnerReferrals: "",
  faqs: [],
  additionalNotes: "",
};

function parseFaqs(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "question" in item &&
        "answer" in item &&
        typeof (item as Record<string, unknown>).question === "string" &&
        typeof (item as Record<string, unknown>).answer === "string"
      ) {
        return {
          question: (item as { question: string }).question,
          answer: (item as { answer: string }).answer,
        };
      }
      return null;
    })
    .filter((x): x is FaqItem => x !== null);
}

export async function loadKnowledgeFormInitial(
  clinicId: string,
): Promise<KnowledgeFormInitial> {
  const k = await db.clinicKnowledge.findUnique({ where: { clinicId } });
  if (!k) return EMPTY_INITIAL;

  return {
    addressReferences: k.addressReferences ?? "",
    parkingInfo: k.parkingInfo ?? "",
    accessibilityInfo: k.accessibilityInfo ?? "",
    publicTransportInfo: k.publicTransportInfo ?? "",
    acceptsChildren: k.acceptsChildren,
    childrenMinAge: k.childrenMinAge ?? "",
    emergencyInfo: k.emergencyInfo ?? "",
    averageWaitTime: k.averageWaitTime ?? "",
    languagesSpoken: k.languagesSpoken.length ? k.languagesSpoken : ["Português"],
    cancellationPolicy: k.cancellationPolicy ?? "",
    latenessPolicy: k.latenessPolicy ?? "",
    noShowPolicy: k.noShowPolicy ?? "",
    firstVisitInfo: k.firstVisitInfo ?? "",
    firstVisitDuration: k.firstVisitDuration ?? "",
    yearsInBusiness: k.yearsInBusiness,
    differentiators: k.differentiators ?? "",
    teamDescription: k.teamDescription ?? "",
    notOfferedProcedures: k.notOfferedProcedures ?? "",
    partnerReferrals: k.partnerReferrals ?? "",
    faqs: parseFaqs(k.faqs),
    additionalNotes: k.additionalNotes ?? "",
  };
}
