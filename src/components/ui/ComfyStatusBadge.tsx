import { Cpu, Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { useComfyUI } from "../../lib/useComfyUI";

export function ComfyStatusBadge({ className = "" }: { className?: string }) {
  const { connection, connect } = useComfyUI();

  const icon =
    connection.status === "testing" ? (
      <Loader2 className="size-3.5 animate-spin" />
    ) : connection.status === "connected" ? (
      <Wifi className="size-3.5" />
    ) : connection.status === "error" ? (
      <WifiOff className="size-3.5" />
    ) : (
      <Cpu className="size-3.5" />
    );

  const label =
    connection.status === "testing"
      ? "Connecting…"
      : connection.status === "connected"
        ? `ComfyUI · ${connection.models.length} models`
        : connection.status === "error"
          ? "ComfyUI Offline"
          : "ComfyUI";

  const styles =
    connection.status === "testing"
      ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-300"
      : connection.status === "connected"
        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300"
        : connection.status === "error"
          ? "border-rose-300/30 bg-rose-400/10 text-rose-300"
          : "border-white/10 bg-white/[.04] text-zinc-400";

  return (
    <button
      onClick={() => connect()}
      title={connection.error ?? connection.gpuName ?? "Click to test ComfyUI connection"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition hover:brightness-110 ${styles} ${className}`}
    >
      {icon}
      {label}
      {connection.status === "error" && <AlertTriangle className="size-3" />}
    </button>
  );
}
