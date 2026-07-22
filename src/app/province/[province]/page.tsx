import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProvinceResearchPage } from "@/components/province-research-page";
import { getProvince, provinces } from "@/lib/province-directory";
import { getProvinceResearchBrief } from "@/lib/province-research";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return provinces.map((province) => ({ province: province.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found", robots: { index: false, follow: false } };

  const title = `${province.name} economic pulse`;
  const description = `See ${province.name}'s latest official jobs, housing, prices, population, trade and energy evidence in one province-first research brief.`;
  const canonical = `/province/${province.slug}`;
  const image = `/api/og/province?province=${encodeURIComponent(province.slug)}&topic=jobs`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Canada Pulse",
      locale: "en_CA",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${province.name} economic pulse` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
  const { province } = await params;
  const brief = await getProvinceResearchBrief(province, "overview");
  if (!brief) notFound();
  return <ProvinceResearchPage brief={brief} />;
}
