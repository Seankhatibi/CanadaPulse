"use client";

import { Share2 } from "lucide-react";

export function ShareStatButton({
  text,
  title = "Share this stat",
  variant = "dark",
}: {
  text: string;
  title?: string;
  variant?: "dark" | "light";
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
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-bold transition ${
        variant === "light"
          ? "border-stone-300 bg-white text-stone-800 hover:border-red-300 hover:text-red-800"
          : "border-white/10 bg-white/10 text-stone-200 hover:bg-white/15"
      }`}
    >
      <Share2 className="size-3.5" aria-hidden="true" />
      Share
    </button>
  );
}
