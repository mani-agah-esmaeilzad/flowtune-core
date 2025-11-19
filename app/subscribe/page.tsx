"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createSubscription } from "./actions";
import type { SubscriptionRecord } from "@/lib/types/subscription";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    cadence: "ماهانه",
    badge: "ایده‌پردازها",
    blurb: "آغاز سریع با خروجی‌های سبک و بیسیک.",
    perks: ["2x سرعت در ساخت JSON", "دانلود MIDI", "API مشترک /api/generate"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "ماهانه",
    badge: "استودیو",
    blurb: "بهترین بالانس سرعت و کیفیت برای تیم‌های کوچک.",
    perks: ["ولوسیتی انسانی و swing", "پریست سبک برای هر ابزار", "پشتیبانی اولویت‌دار"],
    highlight: true,
  },
  {
    id: "label",
    name: "Label",
    price: "$39",
    cadence: "ماهانه",
    badge: "پروداکشن",
    blurb: "اکسپورت حجیم، ریت لیمیت بالا و قابلیت تیمی.",
    perks: ["Export batch", "ریتم‌های چند لایه", "پروفایل تیمی تا ۱۰ نفر"],
  },
] as const;

export default function SubscribePage() {
  const [pending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]["id"]>("pro");
  const [form, setForm] = useState({ name: "", email: "", teamSize: "", goal: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<SubscriptionRecord | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await createSubscription({ ...form, plan: selectedPlan });
        setRecord(result);
        setMessage("اشتراک با موفقیت ثبت شد. ایمیل‌تان را چک کنید.");
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <div className="space-y-10">
      <section className="glassy shine-border rounded-3xl p-8 shadow-floating">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FlowTune Premium</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">سیستم اشتراک برای تولیدکننده‌های حرفه‌ای</h1>
            <p className="text-muted-foreground">
              دسترسی سریع‌تر به Gemini Flash 2.0، کنترل انسانی بر ولوسیتی و ریتم، و خروجی MIDI آماده DAW با Tone.js روی
              کلاینت.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                <Zap className="h-4 w-4" /> Latency Boost
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <Shield className="h-4 w-4" /> Secure Actions
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">API آماده</p>
            <p>POST /api/generate برای هر ۵ ابزار.</p>
            <p>Server Actions روی صفحات ابزار و همین فرم اشتراک.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">پلن خود را انتخاب کنید</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                  selectedPlan === plan.id
                    ? "border-primary/60 bg-primary/10 shadow-[0_10px_40px_rgba(99,102,241,0.35)]"
                    : "border-white/10 bg-white/5 hover:border-primary/30"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                    محبوب
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{plan.badge}</p>
                    <p className="text-lg font-semibold">{plan.name}</p>
                  </div>
                  <p className="text-xl font-semibold text-primary">{plan.price}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{plan.blurb}</p>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] text-muted-foreground">{plan.cadence}</p>
              </button>
            ))}
          </div>
        </div>

        <Card className="glassy h-full">
          <CardHeader>
            <CardTitle>ثبت اشتراک</CardTitle>
            <CardDescription>ایمیل و جزئیات تیم را وارد کنید تا فعال‌سازی را ارسال کنیم.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="name">نام</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="نام یا نام استودیو"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">تعداد نفرات / نقش</Label>
                <Input
                  id="teamSize"
                  name="teamSize"
                  placeholder="Solo, Duo, 5 نفره..."
                  value={form.teamSize}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamSize: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">چه می‌سازید؟</Label>
                <Textarea
                  id="goal"
                  name="goal"
                  rows={3}
                  placeholder="مثلاً پلی‌لیست لو-فای روزانه، پادکست، موسیقی فیلم..."
                  value={form.goal}
                  onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "در حال ثبت..." : "ثبت اشتراک"}
              </Button>
            </form>

            {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {record && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">رسید اشتراک</p>
                <p>پلن: {record.plan}</p>
                <p>ایمیل: {record.email}</p>
                {record.teamSize && <p>تیم: {record.teamSize}</p>}
                {record.goal && <p>هدف: {record.goal}</p>}
                <p>زمان: {new Date(record.createdAt).toLocaleString("fa-IR")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">دسترسی سریع‌تر به ابزارها</p>
            <p>بعد از فعال‌سازی اشتراک می‌توانید مستقیم از UI یا API خروجی بگیرید.</p>
          </div>
          <Link
            href="/tools/chords"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-foreground transition hover:border-primary hover:text-primary"
          >
            رفتن به ابزارها
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
