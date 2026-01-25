import { Metadata } from "next";
import OverOnsContent from "@/components/features/OverOnsContent";

export const metadata: Metadata = {
  title: "Over MaasISO | Experts in ISO-normering & Informatiebeveiliging",
  description:
    "MaasISO is uw betrouwbare partner voor ISO 9001, 27001, 14001 certificeringen en professioneel advies op het gebied van informatiebeveiliging, AVG en privacywetgeving.",
  keywords:
    "ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO",
};

export default function OverOnsPage() {
  return <OverOnsContent />;
}
