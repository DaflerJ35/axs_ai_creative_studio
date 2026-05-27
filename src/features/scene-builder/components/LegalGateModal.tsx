import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalGateModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/78 px-5 backdrop-blur-xl">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-fuchsia-300/20 bg-[#0A0718] shadow-[0_0_120px_rgba(192,38,211,0.22)]">
        <div className="flex items-center justify-between border-b border-fuchsia-200/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-fuchsia-400/12 text-fuchsia-200 ring-1 ring-fuchsia-300/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">18+ Legal Gate</h2>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200/45">
                Director&apos;s Cut access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex size-9 items-center justify-center rounded-full text-white/42 transition hover:bg-white/10 hover:text-white"
            aria-label="Close legal gate"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-7 text-white/72">
            This mode enables unrestricted explicit adult content including nudity and sexual scenes.
            You must be 18 years or older to use this mode.
            All content generated is for private use only. Do you confirm you are 18+?
          </p>
          <div className="rounded-2xl border border-fuchsia-300/12 bg-fuchsia-300/[0.055] p-4 text-xs font-semibold leading-6 text-fuchsia-50/62">
            NSFW Director&apos;s Cut transforms the studio into a private adult-content production workspace while preserving Character DNA consistency and cinematic controls.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-fuchsia-200/10 px-6 py-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-white/12 bg-white/[0.035] text-white/72 hover:bg-white/[0.07]"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-400 text-sm font-black text-white shadow-[0_0_34px_rgba(192,38,211,0.32)] hover:brightness-110"
            onClick={onConfirm}
          >
            Confirm 18+
          </Button>
        </div>
      </div>
    </div>
  );
}
