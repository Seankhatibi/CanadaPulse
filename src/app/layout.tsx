import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Canada Pulse | Canadian Economic Intelligence",
    template: "%s | Canada Pulse",
  },
  description:
    "Official Canadian economic releases translated into structured facts, visual research briefs, and province comparisons.",
  metadataBase: new URL("https://canadapulse.vercel.app"),
  openGraph: {
    title: "Canada Pulse | Canadian Economic Intelligence",
    description: "Track the latest Canadian economic releases, housing data, labour markets, prices and provincial impacts.",
    url: "https://canadapulse.vercel.app",
    siteName: "Canada Pulse",
    locale: "en_CA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full"
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
