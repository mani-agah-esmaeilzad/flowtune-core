import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowTune Mini",
  description:
    "FlowTune Mini • AI powered music ideation suite for chords, melodies, drums and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" className="bg-background">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="pointer-events-none fixed inset-0 grid-glow" aria-hidden />
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-[rgba(8,12,26,0.75)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-floating">
                  🎧
                </span>
                <span className="leading-none">FlowTune Mini</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link className="hover:text-primary transition-colors" href="/tools/chords">
                  آکورد
                </Link>
                <Link className="hover:text-primary transition-colors" href="/tools/melody">
                  ملودی
                </Link>
                <Link className="hover:text-primary transition-colors" href="/tools/drums">
                  درام
                </Link>
                <Link className="hover:text-primary transition-colors" href="/tools/layers">
                  لایه‌ها
                </Link>
                <Link className="hover:text-primary transition-colors" href="/tools/arpeggio">
                  آرپژ
                </Link>
                <Link className="hover:text-primary transition-colors" href="/tools/bass-guitar">
                  بیس / گیتار
                </Link>
                <Link className="hover:text-primary transition-colors" href="/admin">
                  ادمین
                </Link>
                <Link
                  className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20 hover:text-primary"
                  href="/subscribe"
                >
                  اشتراک
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
