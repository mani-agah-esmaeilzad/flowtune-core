import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listActivities, getActivityMetrics } from "@/lib/admin/activity";
import { listSubscribers } from "@/lib/subscription/store";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Date(value).toLocaleString("fa-IR", { hour12: false });
}

export default async function AdminPage() {
  const [activities, subscribers, metrics] = await Promise.all([
    listActivities(40),
    listSubscribers(),
    getActivityMetrics(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-semibold">FlowTune Insights</h1>
          <p className="text-sm text-muted-foreground">وضعیت اشتراک‌ها و تولیدات AI در یک نگاه.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glassy">
          <CardHeader className="pb-2">
            <CardDescription>تعداد تولیدات</CardDescription>
            <CardTitle className="text-3xl">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            آخرین اجرا: {metrics.lastRun ? formatDate(metrics.lastRun.createdAt) : "—"}
          </CardContent>
        </Card>
        <Card className="glassy">
          <CardHeader className="pb-2">
            <CardDescription>آخرین تمپو</CardDescription>
            <CardTitle className="text-3xl">{metrics.lastTempo ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">bpm از آخرین پاسخ شامل تمپو</CardContent>
        </Card>
        <Card className="glassy">
          <CardHeader className="pb-2">
            <CardDescription>کاربران اشتراک</CardDescription>
            <CardTitle className="text-3xl">{subscribers.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            آخرین ایمیل: {subscribers[0]?.email ?? "—"}
          </CardContent>
        </Card>
        <Card className="glassy">
          <CardHeader className="pb-2">
            <CardDescription>توزیع ابزارها</CardDescription>
            <CardTitle className="text-lg">{Object.keys(metrics.byTool).length} ابزار</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {Object.entries(metrics.byTool).map(([tool, count]) => (
              <div key={tool} className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
                <span>{tool}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glassy shine-border">
        <CardHeader>
          <CardTitle>لیست تولیدات AI</CardTitle>
          <CardDescription>آخرین ۴۰ اجرا با ورودی و خروجی کامل.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2">زمان</th>
                <th className="p-2">ابزار</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">ورودی</th>
                <th className="p-2">خروجی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activities.map((activity) => (
                <tr key={activity.id} className="align-top">
                  <td className="p-2 whitespace-nowrap text-xs text-muted-foreground">{formatDate(activity.createdAt)}</td>
                  <td className="p-2 font-semibold">{activity.type}</td>
                  <td className="p-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${
                        activity.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td className="p-2 text-xs">
                    <pre className="whitespace-pre-wrap break-words bg-white/5 p-2 rounded-md">{JSON.stringify(activity.payload, null, 2)}</pre>
                  </td>
                  <td className="p-2 text-xs max-w-[360px]">
                    {activity.response ? (
                      <pre className="whitespace-pre-wrap break-words bg-white/5 p-2 rounded-md max-h-48 overflow-auto">
                        {JSON.stringify(activity.response, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {activity.error && (
                      <p className="text-xs text-red-400 mt-1">{activity.error}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="glassy">
        <CardHeader>
          <CardTitle>مشترکین</CardTitle>
          <CardDescription>ثبت‌شده از فرم اشتراک.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2">ایمیل</th>
                <th className="p-2">پلن</th>
                <th className="p-2">نام</th>
                <th className="p-2">هدف</th>
                <th className="p-2">زمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {subscribers.map((sub) => (
                <tr key={`${sub.email}-${sub.plan}`}>
                  <td className="p-2">{sub.email}</td>
                  <td className="p-2 font-semibold uppercase">{sub.plan}</td>
                  <td className="p-2">{sub.name ?? "—"}</td>
                  <td className="p-2 text-muted-foreground">{sub.goal ?? "—"}</td>
                  <td className="p-2 text-xs text-muted-foreground">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                    هنوز مشترکی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
