"use client";

import { Share2 } from "lucide-react";

export function ShareStatButton({
  text,
  title = "Share this stat",
}: {
  text: string;
  title?: string;
}) {
  async function share() {
    const url = window.location.href;
    const shareText = `${text}\n\nCanada Pulse: ${url}`;

    if (navigator.share) {
      await navigator.share({ title: "Canada Pulse", text: shareText, url }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(shareText).catch(() => undefined);
  }

  return (
    <button
      type="button"
      onClick={share}
      title={title}
      aria-label={title}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/10 px-2.5 text-xs font-semibold text-stone-200 transition hover:bg-white/15"
    >
      <Share2 className="size-3.5" aria-hidden="true" />
      Share
    </button>
  );
}
