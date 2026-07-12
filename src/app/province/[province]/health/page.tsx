import { redirect } from "next/navigation";

export default async function ProvinceHealthPage({ params }: { params: Promise<{ province: string }> }) { await params; redirect("/health"); }
