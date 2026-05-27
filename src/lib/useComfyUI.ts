import { useCallback, useEffect, useRef, useState } from "react";
import { comfyGenerate, testComfyUIConnection, uploadReferenceImage } from "./comfyui";
import type { ComfyParams } from "./comfyui";
import type { ImageJobOutput } from "./types";

export type ComfyStatus = "idle" | "testing" | "connected" | "error" | "generating";

export interface ComfyConnection {
  status: ComfyStatus;
  models: string[];
  loras: string[];
  gpuName: string;
  url: string;
  error?: string;
}

export interface UseComfyUIReturn {
  /** Current connection state */
  connection: ComfyConnection;
  /** Test / refresh the ComfyUI connection */
  connect: (url?: string) => Promise<void>;
  /** Generate images — returns the job output */
  generate: (params: ComfyParams, onProgress?: (step: number) => void) => Promise<ImageJobOutput>;
  /** Upload a reference image (data URL → ComfyUI filename) */
  uploadImage: (dataUrl: string) => Promise<string>;
  /** Is a generation currently running? */
  isGenerating: boolean;
  /** Current generation step (0–n) for progress bars */
  generationStep: number;
  /** Reset error state */
  reset: () => void;
}

const readLocalSetting = (key: string): string =>
  typeof globalThis.localStorage === "undefined" ? "" : globalThis.localStorage.getItem(key) || "";

/**
 * React hook for ComfyUI — handles connection testing, model discovery,
 * image generation with progress, and reference-image uploads.
 *
 * Example:
 * ```ts
 * const comfy = useComfyUI();
 * await comfy.connect();           // probes default URL
 * const result = await comfy.generate({ prompt: "a cyberpunk cat", model: "pony...safetensors" });
 * ```
 */
export function useComfyUI(): UseComfyUIReturn {
  const [status, setStatus] = useState<ComfyStatus>("idle");
  const [models, setModels] = useState<string[]>([]);
  const [loras, setLoras] = useState<string[]>([]);
  const [gpuName, setGpuName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const url = readLocalSetting("axs.comfyuiUrl") || "http://127.0.0.1:8188";

  const connect = useCallback(
    async (overrideUrl?: string) => {
      setStatus("testing");
      setError(undefined);
      try {
        const result = await testComfyUIConnection(overrideUrl);
        if (result.ok) {
          setStatus("connected");
          setModels(result.models ?? []);
          setLoras(result.loras ?? []);
          setGpuName(result.gpuName ?? "");
        } else {
          setStatus("error");
          setError(result.error ?? "Unknown connection error");
          setModels([]);
          setLoras([]);
          setGpuName("");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Connection failed");
      }
    },
    []
  );

  const generate = useCallback(
    async (params: ComfyParams, onProgress?: (step: number) => void): Promise<ImageJobOutput> => {
      setIsGenerating(true);
      setGenerationStep(0);
      abortRef.current = new AbortController();
      try {
        const result = await comfyGenerate(params, (step) => {
          setGenerationStep(step);
          onProgress?.(step);
        });
        return result;
      } finally {
        setIsGenerating(false);
        setGenerationStep(0);
        abortRef.current = null;
      }
    },
    []
  );

  const uploadImage = useCallback(async (dataUrl: string): Promise<string> => {
    return uploadReferenceImage(dataUrl);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
  }, []);

  // Auto-connect on mount if we already have a saved model (user has connected before)
  useEffect(() => {
    const savedModel = readLocalSetting("axs.comfyuiModel");
    if (savedModel) {
      connect();
    }
  }, [connect]);

  return {
    connection: { status, models, loras, gpuName, url, error },
    connect,
    generate,
    uploadImage,
    isGenerating,
    generationStep,
    reset,
  };
}
