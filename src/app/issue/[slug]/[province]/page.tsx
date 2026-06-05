import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { getIssueProvince, issues } from "@/lib/issue-data";

export function generateStaticParams() {
  return issues.flatMap((issue) =>
    issue.provinceValues.map((province) => ({
      slug: issue.slug,
      province: province.slug,
    })),
  );
}

export default async function IssueProvincePage({
  params,
}: {
  params: Promise<{ slug: string; province: string }>;
}) {
  const { slug, province } = await params;
  const data = getIssueProvince(slug, province);

  if (!data) {
    notFound();
  }

  const { issue, province: provinceValue, components } = data;
  const Icon = issue.icon;
  const maxComponent = Math.max(...components.map((item) => Math.abs(item.numeric)));

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${issue.tone}`} />
          <div className="p-5 sm:p-7">
            <Link
              href={`/issue/${issue.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to {issue.title}
            </Link>
            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.38fr]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-red-600 text-white">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                    {issue.title} in {provinceValue.province}
                  </p>
                  <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                    {provinceValue.province}: {provinceValue.value}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-stone-300">
                    {provinceValue.note}. This page breaks the national issue into local components.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill>{issue.source}</StatusPill>
                    <StatusPill>Province-specific breakdown</StatusPill>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-black/35 p-5">
                <p className="text-xs text-stone-500">{issue.nationalLabel}</p>
                <p className="mt-3 font-mono text-4xl font-semibold text-white sm:text-5xl">{provinceValue.value}</p>
                <p className="mt-4 text-xs leading-5 text-stone-500">{provinceValue.note}</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">
            Components in {provinceValue.province}
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {components.map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.note}</p>
                  </div>
                  <p className="font-mono text-lg font-semibold text-white sm:text-right sm:text-xl">{item.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${Math.max(8, (Math.abs(item.numeric) / maxComponent) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
