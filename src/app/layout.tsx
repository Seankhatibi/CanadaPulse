import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Canada Pulse | Canadian Data for Everyday Life",
    template: "%s | Canada Pulse",
  },
  description:
    "Understand how Canadian economic, political and social changes affect your money, home, work and community.",
  metadataBase: new URL("https://canadapulse.vercel.app"),
  openGraph: {
    title: "Canada Pulse | Canadian Data for Everyday Life",
    description: "Track the latest Canadian economic releases, housing data, labour markets, prices and provincial impacts.",
    url: "https://canadapulse.vercel.app",
    siteName: "Canada Pulse",
    locale: "en_CA",
    type: "website",
    images: [{ url: "/api/og/province", width: 1200, height: 630, alt: "Canada Pulse province explorer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canada Pulse | Canadian Data for Everyday Life",
    description: "Current official Canadian data, made understandable province by province.",
    images: ["/api/og/province"],
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
