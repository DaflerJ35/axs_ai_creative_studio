import { ImagePlus, Library, Sparkles, Upload, X } from "lucide-react";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHARACTER_ITEMS } from "../data/library-items";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";

function makeSvgDataUrl(label: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#0A0718"/>
          <stop offset="0.45" stop-color="#27213A"/>
          <stop offset="1" stop-color="#00D4FF"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="512" cy="74" r="120" fill="${accent}" opacity="0.38"/>
      <text x="48" y="206" fill="white" font-family="Inter, Arial" font-size="42" font-weight="800">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function UploadModal() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"exact" | "style">("exact");
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const uploadTarget = useSceneBuilderStore((state) => state.uploadTarget);
  const closeUploadModal = useSceneBuilderStore((state) => state.closeUploadModal);
  const addReferenceImage = useSceneBuilderStore((state) => state.addReferenceImage);
  const nsfw = studioMode === "nsfw";
  const targetLabel = uploadTarget === "start-frame" ? "Start Frame" : uploadTarget === "end-frame" ? "End Frame" : "Reference Image";
  const dnaImports = useMemo(() => CHARACTER_ITEMS.slice(0, 3), []);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        addReferenceImage({ name: file.name, dataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/72 px-5 backdrop-blur-xl">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div
        className={cn(
          "w-full max-w-xl overflow-hidden rounded-[28px] border shadow-[0_28px_100px_rgba(0,0,0,0.5)]",
          nsfw ? "border-fuchsia-200/18 bg-[#10091F] shadow-[0_0_100px_rgba(192,38,211,0.20)]" : "border-white/14 bg-[#111112]"
        )}
      >
        <header className={cn("flex items-center justify-between border-b px-6 py-5", nsfw ? "border-fuchsia-200/12" : "border-white/10")}>
          <div>
            <p className={cn("text-xs font-black uppercase tracking-[0.22em]", nsfw ? "text-fuchsia-200/48" : "text-white/34")}>
              Upload to {targetLabel}
            </p>
            <h2 className="mt-1 text-xl font-black text-white">Add Visual Reference</h2>
          </div>
          <button
            type="button"
            onClick={closeUploadModal}
            className="flex size-9 items-center justify-center rounded-full text-white/48 transition hover:bg-white/10 hover:text-white"
            aria-label="Close upload modal"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 px-6 py-6">
          <div className={cn("grid grid-cols-2 rounded-full border p-1", nsfw ? "border-fuchsia-200/12 bg-fuchsia-950/35" : "border-white/10 bg-black/35")}>
            {(["exact", "style"] as const).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => setMode(nextMode)}
                className={cn(
                  "h-10 rounded-full text-sm font-black transition",
                  mode === nextMode
                    ? nsfw ? "bg-fuchsia-300 text-[#16051D]" : "bg-white text-black"
                    : nsfw ? "text-fuchsia-50/48 hover:text-fuchsia-50" : "text-white/46 hover:text-white"
                )}
              >
                {nextMode === "exact" ? "Exact Match" : "Style Reference"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn("flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition", nsfw ? "border-fuchsia-200/12 bg-fuchsia-300/[0.055] text-fuchsia-50 hover:bg-fuchsia-300/[0.10]" : "border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.06]")}
          >
            <div className={cn("flex size-11 items-center justify-center rounded-full", nsfw ? "bg-fuchsia-300/14" : "bg-white/10")}>
              <Upload className="size-5" />
            </div>
            <div>
              <div className="text-sm font-black">Upload Image</div>
              <div className="mt-1 text-xs font-semibold text-white/38">Use a local file as {mode === "exact" ? "an exact frame match" : "a visual style reference"}.</div>
            </div>
          </button>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/34">
              <Library className="size-3.5" />
              Import from DNA Library
            </div>
            <div className="grid grid-cols-3 gap-3">
              {dnaImports.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    addReferenceImage({
                      name: `${item.name} DNA Reference`,
                      dataUrl: makeSvgDataUrl(item.name, item.accent.includes("fuchsia") ? "#C026D3" : "#00D4FF"),
                    })
                  }
                  className={cn("rounded-2xl border p-3 text-left transition", nsfw ? "border-fuchsia-200/12 bg-[#0B0617] hover:bg-fuchsia-300/[0.08]" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.06]")}
                >
                  <div className={cn("flex h-20 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-black", item.accent)}>
                    {item.thumbnail}
                  </div>
                  <div className="mt-3 truncate text-xs font-black text-white">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              addReferenceImage({
                name: "My Creation Reference",
                dataUrl: makeSvgDataUrl("My Creation", nsfw ? "#C026D3" : "#00D4FF"),
              })
            }
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-black text-white/72 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ImagePlus className="size-4" />
            My Creations
            <Sparkles className="ml-auto size-4 text-white/34" />
          </button>
        </div>
      </div>
    </div>
  );
}
