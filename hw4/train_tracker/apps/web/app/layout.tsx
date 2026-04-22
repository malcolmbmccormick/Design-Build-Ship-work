import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CTA Train Tracker",
  description: "Live CTA train positions with Supabase Realtime and personal route preferences."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
