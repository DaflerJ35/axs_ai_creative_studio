import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Heart, Trash2, Download, Filter, Search, Sparkles,
  Video, Image as ImageIcon, CheckSquare, Square, X,
  BarChart3, Layers, Star, TrendingUp, DollarSign, Clock,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { GlassCard } from "../ui/glass-card";
import { useNyxStore } from "../../store/useNyxStore";
import type { ForgeResult } from "../../lib/types";

type FilterKind = "all" | "images" | "videos" | "favorites";
type SortKind = "newest" | "oldest" | "favorites";

export const Gallery = () => {
  const { gallery, removeFromGallery, toggleFavorite, setDraftPrompt, setActiveTab } = useNyxStore();
  const [filter, setFilter] = useState<FilterKind>("all");
  const [sort, setSort] = useState<SortKind>("newest");
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<ForgeResult | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let items = gallery.filter((g) => {
      if (filter === "images" && g.type !== "image") return false;
      if (filter === "videos" && g.type !== "video") return false;
      if (filter === "favorites" && !g.favorite) return false;
      if (q && !g.prompt.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "oldest") items = [...items].reverse();
    if (sort === "favorites") items = [...items].sort((a, b) => Number(b.favorite) - Number(a.favorite));
    return items;
  }, [gallery, filter, sort, query]);

  const stats = useMemo(() => ({
    total: gallery.length,
    images: gallery.filter((g) => g.type === "image").length,
    videos: gallery.filter((g) => g.type === "video").length,
    favorites: gallery.filter((g) => g.favorite).length,
    estimatedValue: gallery.length > 0
      ? `$${(gallery.length * 8).toLocaleString()}`
      : "$0",
  }), [gallery]);

  const download = (r: ForgeResult) => {
    const a = document.createElement("a");
    a.href = r.url;
    a.download = `momentum-${r.id.slice(0, 8)}.${r.type === "video" ? "mp4" : "png"}`;
    a.click();
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const bulkDelete = () => {
    selected.forEach((id) => removeFromGallery(id));
    toast.success(`Deleted ${selected.size} assets`);
    setSelected(new Set());
    setSelectMode(false);
  };

  const bulkDownload = () => {
    const items = gallery.filter((g) => selected.has(g.id));
    items.forEach((r) => download(r));
    toast.success(`Downloading ${items.length} assets`);
  };

  const FILTERS: { id: FilterKind; label: string; Icon: typeof Filter; count: number }[] = [
    { id: "all",       label: "All",       Icon: Filter,    count: stats.total },
    { id: "images",    label: "Images",    Icon: ImageIcon, count: stats.images },
    { id: "videos",    label: "Videos",    Icon: Video,     count: stats.videos },
    { id: "favorites", label: "Favorites", Icon: Heart,     count: stats.favorites },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Asset Vault</div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              gallery
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button variant="outline" onClick={() => { setSelectMode(false); setSelected(new Set()); }}>
                Cancel
              </Button>
              {selected.size > 0 && (
                <Button
                  variant="outline"
                  onClick={bulkDownload}
                  className="border-white/20"
                >
                  <Download className="w-4 h-4 mr-2" /> Download {selected.size}
                </Button>
              )}
              <Button
                onClick={bulkDelete}
                disabled={selected.size === 0}
                className="bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border-rose-500/30 border"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete {selected.size}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setSelectMode(true)}>
              <CheckSquare className="w-4 h-4 mr-2" /> Select
            </Button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Assets", value: stats.total, Icon: Layers, color: "text-violet-400" },
            { label: "Images", value: stats.images, Icon: ImageIcon, color: "text-cyan-400" },
            { label: "Videos", value: stats.videos, Icon: Video, color: "text-pink-400" },
            { label: "Est. Campaign Value", value: stats.estimatedValue, Icon: DollarSign, color: "text-emerald-400" },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="relative rounded-3xl overflow-hidden backdrop-blur-3xl border border-white/[0.08] bg-white/[0.04] p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div>
                <div className="font-black text-lg leading-none">{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + search + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(({ id, label, Icon, count }) => {
            const on = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 h-10 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                  on
                    ? "border-violet-400/60 bg-violet-400/10 text-violet-100"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${on ? "bg-violet-400/30 text-violet-100" : "bg-white/10 text-white/40"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 border border-white/10 rounded-xl p-1">
          {(["newest", "oldest", "favorites"] as SortKind[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                sort === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-white/10 p-20 flex flex-col items-center justify-center text-white/30 gap-4">
          <Sparkles className="w-14 h-14 opacity-40" />
          <div className="text-xl font-bold">Nothing here yet</div>
          <div className="text-sm text-white/20">
            Forge images and videos — they all land here.
          </div>
          <button
            onClick={() => setActiveTab("images")}
            className="mt-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold hover:bg-white/[0.1] transition-all"
          >
            Open Image Forge
          </button>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {filtered.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative break-inside-avoid rounded-2xl overflow-hidden border border-white/[0.08] group cursor-pointer"
              onClick={() => (selectMode ? toggleSelect(r.id) : setPreview(r))}
            >
              {r.type === "image" ? (
                <img src={r.url} alt="" className="w-full h-auto block" loading="lazy" />
              ) : (
                <video src={r.url} className="w-full h-auto block" muted loop playsInline />
              )}

              {/* Type badge */}
              <div className="absolute top-2 left-2">
                {r.type === "video" && (
                  <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] text-white/70 border border-white/10 flex items-center gap-1">
                    <Video className="w-2.5 h-2.5" /> Video
                  </div>
                )}
              </div>

              {/* Select overlay */}
              {selectMode && (
                <div className="absolute top-2 right-2 z-10">
                  {selected.has(r.id) ? (
                    <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
                      <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <Square className="w-3.5 h-3.5 text-white/50" />
                    </div>
                  )}
                </div>
              )}

              {/* Hover actions */}
              {!selectMode && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-250 flex flex-col justify-end p-3 gap-2">
                  <div className="text-[10px] text-white/70 line-clamp-2 leading-relaxed">
                    {r.prompt}
                  </div>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => download(r)}
                      className="flex-1 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(r.id)}
                      className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                        r.favorite ? "bg-pink-500/40 text-pink-200" : "bg-white/10 hover:bg-white/20"
                      }`}
                      title="Favorite"
                    >
                      <Heart className="w-3.5 h-3.5" fill={r.favorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => {
                        setDraftPrompt(r.prompt);
                        setActiveTab("images");
                        toast.success("Prompt loaded into Image Forge");
                      }}
                      className="flex-1 h-8 rounded-lg bg-white/10 hover:bg-violet-500/30 flex items-center justify-center transition-all"
                      title="Remix prompt"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        removeFromGallery(r.id);
                        toast.info("Deleted");
                      }}
                      className="flex-1 h-8 rounded-lg bg-white/10 hover:bg-rose-500/40 flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {r.favorite && !selectMode && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pink-500/90 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" fill="currentColor" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-3xl overflow-hidden"
            >
              {preview.type === "image" ? (
                <img src={preview.url} className="w-full h-auto max-h-[85vh] object-contain" />
              ) : (
                <video src={preview.url} controls autoPlay className="w-full rounded-3xl" />
              )}
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm hover:bg-black flex items-center justify-center border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pt-20">
                <div className="text-sm text-white/80 max-w-2xl">{preview.prompt}</div>
                <div className="flex items-center gap-4 mt-3">
                  {preview.seed && (
                    <div className="text-[11px] font-mono text-white/30">seed {preview.seed}</div>
                  )}
                  <button
                    onClick={() => download(preview)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => {
                      toggleFavorite(preview.id);
                      setPreview({ ...preview, favorite: !preview.favorite });
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5" fill={preview.favorite ? "currentColor" : "none"} />
                    {preview.favorite ? "Unfavorite" : "Favorite"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
