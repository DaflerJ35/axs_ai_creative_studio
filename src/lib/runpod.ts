/**
 * AXS AI Creative Studios — RunPod client
 * Thin wrapper over /run and /runsync with toast-aware polling.
 */
import { toast } from "sonner";

export interface RunPodStatus {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMED_OUT";
  output?: unknown;
  error?: string;
  executionTime?: number;
  delayTime?: number;
}

function readCreds() {
  try {
    const apiKey = localStorage.getItem("axs.apiKey") || "";
    const endpointId = localStorage.getItem("axs.endpointId") || "";
    return { apiKey, endpointId };
  } catch {
    return { apiKey: "", endpointId: "" };
  }
}

function requireCreds(): { apiKey: string; endpointId: string } {
  const { apiKey, endpointId } = readCreds();
  if (!apiKey || !endpointId) {
    toast.error("RunPod not configured", {
      description: "Add your API key and Endpoint ID in Settings.",
    });
    throw new Error("RUNPOD_NOT_CONFIGURED");
  }
  return { apiKey, endpointId };
}

function buildHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export const RunPodClient = {
  /** Block until the job returns (RunPod holds the connection up to ~90s). */
  async runSync<T = unknown>(input: unknown, endpointOverride?: string): Promise<T> {
    const { apiKey, endpointId } = requireCreds();
    const ep = endpointOverride || endpointId;
    const res = await fetch(`https://api.runpod.ai/v2/${ep}/runsync`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({ input }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || `RunPod ${res.status}`);
    }
    if (data.status === "FAILED") {
      throw new Error(data?.error || "Job failed");
    }
    // runsync returns either { output } on completion or a queued id
    if (data.output !== undefined) return data.output as T;
    // Sometimes returns queued — fall through to polling
    if (data.id) return (await this.poll(data.id, undefined, endpointOverride)) as T;
    throw new Error("Unexpected runsync response");
  },

  /** Submit and return immediately with a job id. */
  async runAsync(input: unknown, endpointOverride?: string): Promise<{ id: string; status: string }> {
    const { apiKey, endpointId } = requireCreds();
    const ep = endpointOverride || endpointId;
    const res = await fetch(`https://api.runpod.ai/v2/${ep}/run`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({ input }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `RunPod ${res.status}`);
    return { id: data.id, status: data.status };
  },

  async status(jobId: string, endpointOverride?: string): Promise<RunPodStatus> {
    const { apiKey, endpointId } = requireCreds();
    const ep = endpointOverride || endpointId;
    const res = await fetch(`https://api.runpod.ai/v2/${ep}/status/${jobId}`, {
      headers: buildHeaders(apiKey),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return res.json();
  },

  async cancel(jobId: string, endpointOverride?: string): Promise<void> {
    const { apiKey, endpointId } = requireCreds();
    const ep = endpointOverride || endpointId;
    await fetch(`https://api.runpod.ai/v2/${ep}/cancel/${jobId}`, {
      method: "POST",
      headers: buildHeaders(apiKey),
    });
  },

  /**
   * Poll a job to completion. Progress callback receives coarse status + attempt.
   * Default budget: ~5 min (60 * 5s).
   */
  async poll<T = unknown>(
    jobId: string,
    onProgress?: (s: RunPodStatus, attempt: number) => void,
    endpointOverride?: string,
    opts: { intervalMs?: number; maxAttempts?: number } = {}
  ): Promise<T> {
    const intervalMs = opts.intervalMs ?? 3000;
    const maxAttempts = opts.maxAttempts ?? 120; // 6 minutes
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const s = await this.status(jobId, endpointOverride);
      if (s.status === "COMPLETED") return s.output as T;
      if (s.status === "FAILED" || s.status === "CANCELLED" || s.status === "TIMED_OUT") {
        throw new Error(s.error || `Job ${s.status}`);
      }
      onProgress?.(s, attempt);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("Job polling timed out");
  },
};
