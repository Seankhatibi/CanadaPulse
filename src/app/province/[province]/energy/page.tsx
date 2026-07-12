import { notFound } from "next/navigation";
import { ProvinceResearchPage } from "@/components/province-research-page";
import { provinces } from "@/lib/canada-pulse-data";
import { getProvinceResearchBrief } from "@/lib/province-research";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return provinces.map((province) => ({ province: province.slug })); }
export default async function Page({ params }: { params: Promise<{ province: string }> }) { const { province } = await params; const brief = await getProvinceResearchBrief(province, "energy"); if (!brief) notFound(); return <ProvinceResearchPage brief={brief} />; }
