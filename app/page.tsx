import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "AI Chord Suggestion",
    description: "پیشرفت‌های هارمونیک در گام دلخواه برای استارت ایده.",
    href: "/tools/chords",
  },
  {
    title: "AI Melody Generator",
    description: "ملودی‌های ساخت‌دار بر اساس گام و حس انتخابی.",
    href: "/tools/melody",
  },
  {
    title: "AI Drum Pattern",
    description: "ریتم‌های ضربی دقیق با کِیک، اسنیر و های‌هت.",
    href: "/tools/drums",
  },
  {
    title: "AI Arpeggio Maker",
    description: "حرکت‌های آرپژ از آکورد دلخواه و سرعت مشخص.",
    href: "/tools/arpeggio",
  },
  {
    title: "AI Bass & Guitar",
    description: "لاین بیس و ریتم گیتار هماهنگ با سبک و تمپو.",
    href: "/tools/bass-guitar",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.5em] text-muted-foreground">FlowTune Mini</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          ۵ ابزار هوش مصنوعی برای ایده‌پردازی موسیقی
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          هر ابزار JSON خالص برمی‌گرداند و با Tone.js روی مرورگر اجرا می‌شود. فایل نت را به صورت JSON یا MIDI دانلود کنید.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Card
            key={tool.href}
            className="border border-border/60 bg-card/80 backdrop-blur hover:shadow-floating transition-shadow"
          >
            <CardHeader>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={tool.href}
                className="inline-flex items-center gap-2 text-primary font-medium"
              >
                ورود به ابزار
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
