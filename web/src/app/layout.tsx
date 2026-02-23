import type { Metadata } from "next";
import "./globals.css";

import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "HateNPity",
  description: "Лента видео, загрузка и комментарии — спокойный светлый дизайн.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
