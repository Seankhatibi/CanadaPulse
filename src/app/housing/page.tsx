import { ResearchAreaPage } from "@/components/research-area-page";
import { getResearchAreaBrief } from "@/lib/research-area";

export const dynamic = "force-dynamic";

export default async function HousingPage() {
  return <ResearchAreaPage brief={await getResearchAreaBrief("housing")} />;
}
