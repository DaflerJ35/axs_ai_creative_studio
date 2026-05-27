import { useState } from "react";
import { Archive, ArrowRight, Download, Eye, EyeOff, FolderOpen, History, Layers3, ShieldAlert, ShoppingBag, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAxsStore } from "../../store/useAxsStore";
import { CommandMetric, CommandPanel } from "../command/CommandDeck";

const templates = ["Cinematic launch sequence", "Character intro reel", "30-day creator sprint", "Director's Cut teaser"];
const marketplace = ["Premium prompt packs", "LTX motion presets", "Universe bible templates", "Campaign swipe files"];

export function VaultStudio() {
  const { gallery, contentRating, setContentRating, setActiveTab, removeFromGallery, clearGallery } = useAxsStore();
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const protectedMode = contentRating === "X" || contentRating === "XXX";

  const revealAsset = (id: string) => {
    setRevealedIds((current) => current.includes(id) ? current : [...current, id]);
  };

  const deleteAsset = (id: string) => {
    removeFromGallery(id);
    toast.success("Asset deleted from Vault");
  };

  const deleteAllAssets = () => {
    if (gallery.length === 0) return;
    const confirmed = window.confirm(`Delete all ${gallery.length} generated assets from the Vault? This cannot be undone.`);
    if (!confirmed) return;
    clearGallery();
    toast.success("Vault history cleared");
  };

  return (
    <div className="space-y-7 axs-workspace-page">
      <CommandPanel className="p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--axs-border)] bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--axs-gold)]">
              <Archive className="h-3.5 w-3.5 text-cyan-200" />
              Vault
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Templates, marketplace assets, and production history.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/52">
              Your creative memory: every generated asset, reusable workflow, showrunner template, and premium preset lives here.
            </p>
          </div>
          <Button onClick={() => setActiveTab("images")} className="h-12 rounded-xl bg-[linear-gradient(135deg,var(--axs-cyan),var(--axs-violet))] px-6 font-semibold text-black">
            Forge New Assets <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CommandPanel>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <CommandMetric label="Total assets" value="24,842" delta="+312 this week" Icon={Archive} accent="cyan" />
        <CommandMetric label="Collections" value="128" delta="+6 this week" Icon={FolderOpen} accent="gold" />
        <CommandMetric label="Storage used" value="1.42 TB" delta="of 5 TB" Icon={Download} accent="violet" />
        <CommandMetric label="Favorites" value="1,246" delta="Pinned" Icon={Star} accent="gold" />
        <CommandMetric label="Gallery" value={String(gallery.length)} delta="Local outputs" Icon={History} accent="cyan" />
      </section>

      <CommandPanel className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/16 bg-cyan-200/10 text-cyan-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/40">Protected vault browsing</p>
              <h2 className="mt-1 text-2xl font-black text-white">Content class: {contentRating}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">
                Mature vault assets stay blurred until intentionally revealed. This keeps SFW brand work and after-hours production separate while preserving the same creative memory system.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["PG-13", "R", "X", "XXX"] as const).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setContentRating(rating)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                  contentRating === rating ? "border-cyan-200/35 bg-cyan-200 text-black" : "border-white/10 bg-white/5 text-white/52 hover:bg-white/10 hover:text-white"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      </CommandPanel>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          { title: "History", subtitle: `${gallery.length} generated assets`, Icon: History },
          { title: "Templates", subtitle: `${templates.length} production systems`, Icon: Layers3 },
          { title: "Marketplace", subtitle: `${marketplace.length} premium packs`, Icon: ShoppingBag },
        ].map(({ title, subtitle, Icon }) => (
          <div key={title} className="axs-panel axs-panel-corners rounded-2xl p-6">
            <Icon className="h-6 w-6 text-cyan-200" />
            <h2 className="mt-8 text-3xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm text-white/45">{subtitle}</p>
          </div>
        ))}
      </section>

      <CommandPanel className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/40">Generation history</p>
            <h2 className="mt-1 text-2xl font-black text-white">Recent assets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/12 bg-white/8 text-white hover:bg-white/12">
              Export Vault <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={deleteAllAssets}
              disabled={gallery.length === 0}
              variant="outline"
              className="rounded-full border-red-300/20 bg-red-500/10 text-red-100 hover:bg-red-500/18 disabled:opacity-40"
            >
              Clear Assets <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {gallery.length === 0 ? (
          <div className="mt-5 flex min-h-[360px] items-center justify-center rounded-[1.45rem] border border-dashed border-white/12 bg-black/22 text-center">
            <div className="px-6">
              <FolderOpen className="mx-auto h-10 w-10 text-cyan-200/70" />
              <h3 className="mt-4 text-xl font-black text-white">Vault is ready for your first asset</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">Forge images, videos, scripts, and campaigns to build your production history.</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/24 transition hover:border-cyan-200/25 hover:bg-white/[0.055]">
                <div className="relative aspect-video bg-black">
                  {item.url ? <img src={item.url} alt={item.prompt} className={`h-full w-full object-cover transition duration-500 ${protectedMode && !revealedIds.includes(item.id) ? "scale-105 blur-xl brightness-50" : ""}`} /> : null}
                  {protectedMode && !revealedIds.includes(item.id) ? (
                    <button
                      type="button"
                      onClick={() => revealAsset(item.id)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center backdrop-blur-sm"
                    >
                      <EyeOff className="h-6 w-6 text-cyan-100" />
                      <span className="mt-3 text-sm font-black text-white">Mature asset hidden</span>
                      <span className="mt-1 text-xs leading-5 text-white/48">Click to reveal this item only.</span>
                    </button>
                  ) : null}
                  <div className="absolute inset-x-3 top-3 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                    {protectedMode ? (
                      <button
                        onClick={() => revealAsset(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white backdrop-blur-xl hover:bg-white/15"
                        title="Reveal asset"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : null}
                    {item.url ? (
                      <a
                        href={item.url}
                        download={`axs-vault-${item.id}.${item.type === "video" ? "mp4" : "png"}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white backdrop-blur-xl hover:bg-white/15"
                        title="Download asset"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : null}
                    <button
                      onClick={() => deleteAsset(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-300/25 bg-red-500/20 text-red-100 backdrop-blur-xl hover:bg-red-500/35"
                      title="Delete asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-white/76">{item.prompt}</p>
                      <p className="mt-2 text-xs text-white/35">{item.type}</p>
                    </div>
                    <button
                      onClick={() => deleteAsset(item.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/42 transition hover:border-red-300/30 hover:bg-red-500/15 hover:text-red-100"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CommandPanel>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
          <h3 className="text-xl font-black text-white">Templates</h3>
          <div className="mt-4 space-y-3">
            {templates.map((template) => (
              <button key={template} onClick={() => setActiveTab("scene")} className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-black/24 p-4 text-left hover:bg-white/8">
                <span className="font-bold text-white/74">{template}</span>
                <Star className="h-4 w-4 text-fuchsia-200" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
          <h3 className="text-xl font-black text-white">Marketplace</h3>
          <div className="mt-4 space-y-3">
            {marketplace.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-black/24 p-4">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <p className="mt-3 font-bold text-white/74">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
