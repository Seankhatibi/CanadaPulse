import { notFound, redirect } from "next/navigation";
import { provinces } from "@/lib/province-directory";

const areaRoutes: Record<string, (province: string) => string> = {
  "food-inflation": () => "/canada",
  "rent-burden": (province) => `/province/${province}/housing`,
  "population-vs-housing": (province) => `/population/${province}`,
  "tax-receipt": (province) => `/tax-dollar?province=${province}`,
  "equalization-epp": (province) => `/province/${province}/government`,
  "youth-jobs": (province) => `/province/${province}`,
  productivity: (province) => `/province/${province}`,
};

export default async function IssueProvincePage({ params }: { params: Promise<{ slug: string; province: string }> }) {
  const { slug, province } = await params;
  const destination = areaRoutes[slug];
  if (!destination || !provinces.some((item) => item.slug === province)) notFound();
  redirect(destination(province));
}
