import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { IssueDetail } from "@/components/issues/issue-detail";
import { getIssue, issues } from "@/lib/issue-data";

export function generateStaticParams() {
  return issues.map((issue) => ({ slug: issue.slug }));
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssue(slug);

  if (!issue) {
    notFound();
  }

  return (
    <AppShell>
      <IssueDetail issue={issue} />
    </AppShell>
  );
}
