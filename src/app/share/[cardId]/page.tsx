import { redirect } from "next/navigation";

export default async function ShareCardPage({ params }: { params: Promise<{ cardId: string }> }) { await params; redirect("/"); }
