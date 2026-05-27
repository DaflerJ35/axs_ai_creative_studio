import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Download,
  Eye,
  FileText,
  MousePointerClick,
  Share2,
  TrendingUp,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAxsStore } from "../../store/useAxsStore";
import { CommandMetric, CommandPanel } from "../command/CommandDeck";

const metrics = [
  { label: "Total reach", value: "45.8M", delta: "+18.6% vs last 30 days", Icon: Eye, accent: "cyan" as const },
  { label: "Engagements", value: "3.24M", delta: "+23.7% vs last 30 days", Icon: MousePointerClick, accent: "violet" as const },
  { label: "Eng. rate", value: "7.08%", delta: "+12.3% vs last 30 days", Icon: Activity, accent: "gold" as const },
  { label: "Conversions", value: "126.8K", delta: "+31.2% vs last 30 days", Icon: TrendingUp, accent: "cyan" as const },
  { label: "Revenue", value: "$512.4K", delta: "+26.8% vs last 30 days", Icon: BarChart3, accent: "gold" as const },
];

const platformRows = [
  ["Instagram", "18.7M", "8.4%", "48.2K"],
  ["TikTok", "14.3M", "9.1%", "41.7K"],
  ["YouTube", "8.6M", "6.2%", "21.6K"],
  ["X", "3.9M", "3.6%", "8.9K"],
  ["LinkedIn", "0.6M", "1.8%", "2.3K"],
];

const funnelRows = [
  ["Impressions", "78.3M", "100%"],
  ["Views", "32.1M", "41.0%"],
  ["Engagements", "3.24M", "10.1%"],
  ["Link Clicks", "1.47M", "45.4%"],
  ["Conversions", "126.8K", "8.6%"],
];

const insightRows = [
  "Video content is driving 68% more conversions than images.",
  "Posting between 6PM - 9PM shows 27% higher engagement.",
  "Character-led openers are outperforming product demos by 41%.",
  "Audience is responding strongest to transformation arcs.",
];

export function AnalyticsStudio() {
  const { setActiveTab } = useAxsStore();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--axs-gold)]">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Advanced analytics and actionable intelligence.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/52">
            Every output feeds the graph: audience behavior, campaign lift, creative velocity, and revenue attribution.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-[var(--axs-border)] bg-black/35 text-white/75 hover:bg-white/10">
            Export Report <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => setActiveTab("strategy")} className="bg-[linear-gradient(135deg,var(--axs-cyan),var(--axs-violet))] font-semibold text-black">
            Feed Strategy <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="grid gap-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <CommandMetric key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr_1fr]">
        <CommandPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Performance Over Time</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Reach, engagement, conversions</h2>
            </div>
            <span className="rounded-lg border border-[var(--axs-border)] bg-black/35 px-3 py-1 text-xs text-white/55">Last 30 Days</span>
          </div>
          <div className="mt-5 h-72 rounded-xl border border-white/8 bg-black/35 p-4">
            <div className="relative h-full overflow-hidden rounded-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_25%,8.333%_100%]" />
              {[24, 31, 29, 36, 34, 43, 39, 51, 49, 58, 61, 68].map((height, index) => (
                <div
                  key={index}
                  className="absolute bottom-5 w-[5.4%] rounded-t-md bg-[linear-gradient(180deg,var(--axs-cyan),rgba(0,212,255,0.1))] shadow-[0_0_18px_rgba(0,212,255,0.32)]"
                  style={{ height: `${height}%`, left: `${5 + index * 7.6}%` }}
                />
              ))}
              {[12, 18, 16, 21, 19, 27, 25, 31, 29, 38, 36, 42].map((height, index) => (
                <div
                  key={index}
                  className="absolute bottom-5 w-[5.4%] translate-x-5 rounded-t-md bg-[linear-gradient(180deg,var(--axs-violet),rgba(168,85,247,0.1))] shadow-[0_0_18px_rgba(168,85,247,0.28)]"
                  style={{ height: `${height}%`, left: `${5 + index * 7.6}%` }}
                />
              ))}
            </div>
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Engagement Breakdown</p>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative grid size-44 place-items-center rounded-full bg-[conic-gradient(var(--axs-cyan)_0_48%,var(--axs-violet)_48%_68%,#fbbf24_68%_83%,#245cff_83%_100%)] shadow-[0_0_45px_rgba(168,85,247,0.28)]">
              <div className="grid size-28 place-items-center rounded-full border border-white/10 bg-[#061018] text-center">
                <span className="text-xs text-white/45">Total</span>
                <strong className="text-2xl text-white">3.24M</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {["Likes 48.2%", "Comments 18.7%", "Shares 14.9%", "Saves 10.6%", "Clicks 7.6%"].map((row) => (
              <div key={row} className="flex items-center justify-between rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/64">
                <span>{row}</span>
                <span className="text-[var(--axs-cyan)]">●</span>
              </div>
            ))}
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Platform Performance</p>
          <div className="mt-5 space-y-2">
            <div className="grid grid-cols-4 gap-2 text-[11px] uppercase tracking-[0.18em] text-white/35">
              <span>Platform</span>
              <span>Reach</span>
              <span>Rate</span>
              <span>Conv.</span>
            </div>
            {platformRows.map(([platform, reach, rate, conv]) => (
              <div key={platform} className="grid grid-cols-4 gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/68">
                <span className="font-semibold text-white/82">{platform}</span>
                <span>{reach}</span>
                <span className="text-[var(--axs-cyan)]">{rate}</span>
                <span>{conv}</span>
              </div>
            ))}
          </div>
        </CommandPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.88fr_0.95fr]">
        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Content Funnel</p>
          <div className="mt-5 space-y-3">
            {funnelRows.map(([label, value, pct], index) => (
              <div key={label} className="grid grid-cols-[1fr_120px_70px] items-center gap-4 text-sm">
                <div className="h-8 rounded-r-lg bg-[linear-gradient(90deg,var(--axs-violet),rgba(168,85,247,0.18))]" style={{ width: `${100 - index * 13}%` }} />
                <span className="text-white/74">{value}</span>
                <span className="text-white/42">{pct}</span>
              </div>
            ))}
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Posting Heatmap</p>
          <div className="mt-5 grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }, (_, index) => (
              <div
                key={index}
                className="aspect-square rounded-sm border border-white/5"
                style={{
                  background: `rgba(${index % 5 === 0 ? "0,212,255" : "168,85,247"}, ${0.08 + ((index * 13) % 60) / 100})`,
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-white/42">
            <span>Low engagement</span>
            <span className="text-[var(--axs-gold)]">Best time today: 6PM - 8PM</span>
            <span>High engagement</span>
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Insights</p>
          <div className="mt-4 space-y-2">
            {insightRows.map((insight) => (
              <div key={insight} className="flex items-start gap-3 rounded-lg border border-white/8 bg-black/25 p-3 text-sm leading-6 text-white/64">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-[var(--axs-cyan)]" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </CommandPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Top Performing Assets</p>
          <div className="mt-4 space-y-2">
            {["Cyberpunk 2077 Teaser", "Galactic Empire Promo", "Neon Requiem Poster", "Eclipse Protocol Trailer"].map((name, index) => (
              <div key={name} className="grid grid-cols-[34px_1fr_90px] items-center gap-3 rounded-lg border border-white/8 bg-black/25 p-2 text-sm">
                <span className="grid size-7 place-items-center rounded-md border border-[var(--axs-border)] text-[var(--axs-gold)]">{index + 1}</span>
                <span className="text-white/72">{name}</span>
                <span className="text-right text-[var(--axs-cyan)]">{(8.7 - index * 1.1).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Recent Campaigns</p>
          <div className="mt-4 space-y-2">
            {["Cyberpunk 2077 Launch", "Galactic Empire Siege", "Neon Requiem Release", "Eclipse Protocol Update"].map((name) => (
              <div key={name} className="flex items-center justify-between rounded-lg border border-white/8 bg-black/25 p-3 text-sm">
                <span className="text-white/72">{name}</span>
                <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Active</span>
              </div>
            ))}
          </div>
        </CommandPanel>

        <CommandPanel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">Export Report</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["PDF", "PPTX", "CSV"].map((format) => (
              <Button key={format} variant="outline" className="border-[var(--axs-border)] bg-black/30 text-[var(--axs-gold)] hover:bg-white/10">
                <FileText className="h-4 w-4" />
                {format}
              </Button>
            ))}
          </div>
          <Button className="mt-4 w-full bg-[linear-gradient(135deg,var(--axs-gold),#fff1b8)] font-semibold text-black">
            Generate Report <Share2 className="h-4 w-4" />
          </Button>
        </CommandPanel>
      </section>
    </div>
  );
}
