import { Metadata } from "next";
import SearchPageClientWrapper from "@/components/features/SearchPageClientWrapper";

export const metadata: Metadata = {
  title: "Zoekresultaten | MaasISO",
  description: "Doorzoek alle content van MaasISO",
};

export default function SearchPage() {
  return <SearchPageClientWrapper />;
}
