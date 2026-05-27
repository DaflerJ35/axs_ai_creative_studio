import type { ForgeSettings, VoiceOverResult } from "./types";

export type VoiceEngine = ForgeSettings["voiceEngine"];

export interface VoiceGenerationRequest {
  script: string;
  engine: VoiceEngine;
  voiceId: string;
  voiceName: string;
  settings: ForgeSettings;
  stability: number;
  clarity: number;
  pace: number;
  pitch: number;
  emotions: Record<string, number>;
}

export interface VoiceGenerationResponse {
  audioUrl?: string;
  status: VoiceOverResult["status"];
  message?: string;
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function buildVoicePrompt(request: VoiceGenerationRequest): string {
  const dominantEmotion = Object.entries(request.emotions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "calm";
  return [
    `Performance direction: ${dominantEmotion}.`,
    `Pace ${request.pace}%, pitch ${request.pitch}%, stability ${request.stability}%, clarity ${request.clarity}%.`,
    request.script,
  ].join("\n\n");
}

async function generateElevenLabs(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  if (!request.settings.elevenLabsApiKey) {
    return { status: "mock", message: "Add an ElevenLabs API key in Voice Studio to render real audio." };
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": request.settings.elevenLabsApiKey,
    },
    body: JSON.stringify({
      text: buildVoicePrompt(request),
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: request.stability / 100,
        similarity_boost: request.clarity / 100,
        style: Math.min(1, Math.max(0, (request.emotions.excited + request.emotions.seductive) / 200)),
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { status: "error", message: message || "ElevenLabs voice generation failed." };
  }

  return { status: "ready", audioUrl: await toDataUrl(await response.blob()) };
}

async function generateOpenAI(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  if (!request.settings.openaiApiKey) {
    return { status: "mock", message: "Add an OpenAI API key in Voice Studio to render the fallback voice." };
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${request.settings.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: request.voiceId || "alloy",
      input: buildVoicePrompt(request),
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { status: "error", message: message || "OpenAI speech generation failed." };
  }

  return { status: "ready", audioUrl: await toDataUrl(await response.blob()) };
}

async function generateGoogle(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  if (!request.settings.googleTtsApiKey) {
    return { status: "mock", message: "Add a Google TTS key in Voice Studio to render the fallback voice." };
  }

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${request.settings.googleTtsApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text: buildVoicePrompt(request) },
      voice: { languageCode: "en-US", name: request.voiceId || "en-US-Neural2-J" },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Math.min(1.6, Math.max(0.65, request.pace / 100)),
        pitch: Math.max(-10, Math.min(10, (request.pitch - 50) / 5)),
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { status: "error", message: message || "Google TTS generation failed." };
  }

  const json = await response.json();
  return { status: "ready", audioUrl: `data:audio/mp3;base64,${json.audioContent}` };
}

async function generateLocal(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  const endpoint = request.settings.localVoiceUrl?.trim() || "http://127.0.0.1:8020/tts";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: request.script,
      prompt: buildVoicePrompt(request),
      voice_id: request.voiceId,
      voice_name: request.voiceName,
      engine: "local-open-source",
      pace: request.pace,
      pitch: request.pitch,
      stability: request.stability,
      clarity: request.clarity,
      emotions: request.emotions,
      output_format: "mp3",
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    return {
      status: "mock",
      message:
        message ||
        `Local voice server is not ready at ${endpoint}. Start XTTS/OpenVoice/Piper locally, then generate again.`,
    };
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("audio/")) {
    return { status: "ready", audioUrl: await toDataUrl(await response.blob()) };
  }

  const json = await response.json();
  const audioUrl =
    typeof json.audioUrl === "string"
      ? json.audioUrl
      : typeof json.url === "string"
        ? json.url
        : typeof json.audio_base64 === "string"
          ? `data:audio/mp3;base64,${json.audio_base64}`
          : typeof json.audioContent === "string"
            ? `data:audio/mp3;base64,${json.audioContent}`
            : undefined;

  if (!audioUrl) {
    return {
      status: "mock",
      message: "Local voice server responded, but did not return audioUrl, url, audio_base64, or audioContent.",
    };
  }

  return { status: "ready", audioUrl };
}

export async function generateVoiceOver(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  try {
    if (request.engine === "local") return generateLocal(request);
    if (request.engine === "elevenlabs") return generateElevenLabs(request);
    if (request.engine === "openai") return generateOpenAI(request);
    return generateGoogle(request);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Voice generation failed.",
    };
  }
}

export function createWaveform(seed: string, points = 64): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: points }, (_, index) => {
    hash = (hash * 1664525 + 1013904223 + index) >>> 0;
    return 18 + (hash % 82);
  });
}
