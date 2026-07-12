import { notFound, redirect } from "next/navigation";

const destinations: Record<string, string> = {
  "food-inflation": "/canada",
  "rent-burden": "/housing",
  "population-vs-housing": "/population",
  "tax-receipt": "/tax-dollar",
  "equalization-epp": "/government",
  "youth-jobs": "/youth",
  productivity: "/canada",
};

export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = destinations[slug];
  if (!destination) notFound();
  redirect(destination);
}
