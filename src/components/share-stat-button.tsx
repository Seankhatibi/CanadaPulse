"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ShareStatButton({
  text,
  title = "Share this stat",
  variant = "dark",
  url,
}: {
  text: string;
  title?: string;
  variant?: "dark" | "light";
  url?: string;
}) {
  const [result, setResult] = useState<"shared" | "copied" | null>(null);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setResult(null), 2400);
    return () => window.clearTimeout(timer);
  }, [result]);

  async function share() {
    const shareUrl = url ? new URL(url, window.location.href).toString() : window.location.href;
    const shareText = `${text}\n\nCanada Pulse`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Canada Pulse", text: shareText, url: shareUrl });
        setResult("shared");
      } catch {
        return;
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText}: ${shareUrl}`);
      setResult("copied");
    } catch {
      return;
    }
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
      {result ? <Check className="size-3.5" aria-hidden="true" /> : <Share2 className="size-3.5" aria-hidden="true" />}
      <span aria-live="polite">{result === "shared" ? "Shared" : result === "copied" ? "Link copied" : "Share"}</span>
    </button>
  );
}
