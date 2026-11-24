import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

// Every route reads live session/database data at request time.
// Prevent the build from prerendering DB-backed pages on Vercel.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "ReUse Campus", template: "%s · ReUse Campus" },
  description: "Share More. Waste Less. Learn Together. A student-to-student resource exchange platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
