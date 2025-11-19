import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Wand2 } from "lucide-react";
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
    title: "Layered Groove Studio",
    description: "لاین‌های ذخیره‌شده را روی هم بندازید و درام را به گیتار و بیس زنده وصل کنید.",
    href: "/tools/layers",
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

const highlights = [
  {
    title: "Gemini Flash 2.0",
    description: "پرامپت‌های دقیق موسیقایی و JSON معتبر برای هر ابزار.",
  },
  {
    title: "Cross-Layer Chaining",
    description: "نتیجه هر ابزار را به ابزار بعدی بدهید و استک‌های طولانی روی هم پلی کنید.",
  },
  {
    title: "Tone.js Playback",
    description: "پخش سریع روی مرورگر بدون دانلود فایل صوتی.",
  },
  {
    title: "Exports",
    description: "دانلود JSON یا MIDI با یک کلیک برای DAW.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl glassy shine-border p-10 shadow-floating">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 lg:max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> نسخه پریمیوم FlowTune Mini
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              ۵ ابزار هوش مصنوعی برای خلق ایده‌های موسیقیایی آینده
            </h1>
            <p className="text-lg text-muted-foreground">
              آکورد، ملودی، درام، آرپژ و ریتم گیتار را در چند ثانیه بسازید و خروجی هرکدام را روی دیگری بیندازید. همه‌چیز
              JSON استاندارد است، مستقیم با Tone.js پخش می‌شود و آماده خروجی MIDI برای DAW.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-[1.02]"
              >
                شروع اشتراک پریمیوم
                <BadgeCheck className="h-4 w-4" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                دیدن ابزارها
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid w-full gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 lg:w-[360px]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>AI Stack</span>
              <span>Realtime JSON</span>
            </div>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-inner backdrop-blur"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 p-4 text-sm font-semibold">
              <span className="flex items-center gap-2 text-primary">
                <Wand2 className="h-4 w-4" /> Flash 2.0 Ready
              </span>
              <span className="text-muted-foreground">Latency &lt; 1s</span>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FlowTune Tools</p>
            <h2 className="text-2xl font-semibold">۵ ابزار تخصصی برای هر لاین موسیقی</h2>
          </div>
          <Link href="/subscribe" className="text-sm font-semibold text-primary hover:underline">
            اشتراک فعال = خروجی سریع‌تر
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Card
              key={tool.href}
              className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/0 p-px shadow-floating transition hover:translate-y-[-2px]"
            >
              <div className="glassy rounded-[14px] h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(99,102,241,0.2)]" />
                    {tool.title}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    ورود به ابزار
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-xs text-muted-foreground">JSON + Tone.js + MIDI</span>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="glassy shine-border">
          <CardHeader>
            <CardTitle>کیفیت استودیویی با اشتراک Pro</CardTitle>
            <CardDescription>
              مدل Gemini Flash 2.0، ولوسیتی انسانی، اکسانت گذاری و برچسب BPM آماده export به DAW.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {["Humanized Velocity", "Timing Swing", "Genre-aware prompts", "Export MIDI"]
              .map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            <Link
              href="/subscribe"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary/30"
            >
              فعال‌سازی اشتراک
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glassy">
          <CardHeader>
            <CardTitle>API و Server Actions</CardTitle>
            <CardDescription>تمامی ابزارها هم از طریق UI و هم API / Server Action آماده‌اند.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>endpoint مشترک: <code className="text-primary">/api/generate</code></p>
            <p>نتیجه ساختاریافته JSON + خروجی MIDI از کلاینت.</p>
            <p>خروجی بدون صدا؛ پخش ۱۰۰٪ سمت فرانت با Tone.js.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
