# Momentum AI Creator

Premium synthetic-character studio for fashion, cinematic portraits, concept art,
and brand content. Powered by **FLUX.1-dev** on RunPod serverless.

Production domain: **[momentumaicreator.com](https://momentumaicreator.com)**

## What it does

- **Studio** — Build recurring digital characters from text + a locked random seed. No uploaded photos, ever.
- **Images** — Text-to-image generation with style presets, aspect control, batch, upscale, and character-seed consistency.
- **Videos** — Queue text-to-video jobs against a separate RunPod endpoint (Wan 2.1 / LTX / CogVideo, etc.).
- **Marketing** — Branded ad sets: pair your character with a text-described product and render ready-to-post creatives.
- **Gallery** — Masonry vault with filters, favorites, batch delete, and remix-to-forge.
- **Settings** — RunPod endpoint + API key, cost estimator, backup export/import.

## Tech

- React 19 + Vite 6 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Motion (Framer Motion) for every micro-interaction
- Zustand + IndexedDB persistence
- RunPod Serverless API (FLUX)

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

Build for prod:
```bash
npm run build
npm run preview
```

## Deploying the RunPod backend

The Python handler lives at `../runpod_script/`:

- `handler.py` — text-to-image FLUX handler (no face upload, no NSFW bypass).
- `Dockerfile` — bakes FLUX.1-dev into the image so cold starts are fast.
- `requirements.txt` — pinned Python deps.

### Build & push

```bash
cd ../runpod_script

# FLUX.1-dev is gated — create an HF token at https://huggingface.co/settings/tokens
docker build --build-arg HF_TOKEN=hf_xxxxx -t yourname/momentum-flux:latest .
docker push yourname/momentum-flux:latest
```

### Create the serverless endpoint

1. Go to **RunPod → Serverless → New Endpoint**
2. Container: `yourname/momentum-flux:latest`
3. GPU: A100 80GB or L40S (FLUX needs ≥48GB VRAM comfortably)
4. Container Disk: 40 GB
5. Network Volume: **optional** — mount one at `/runpod-volume` if you want to load user-trained LoRAs from `/runpod-volume/loras/*.safetensors`
6. Max Workers: 3, Idle Timeout: 5s
7. Save, copy the **Endpoint ID**

### Wire the frontend

1. Open the app, go to **Settings**
2. Paste your RunPod **API Key** and **Image Endpoint ID**
3. Click **Test image endpoint** — you should see workers ready
4. Go to **Studio**, build a character, **Lock Character**
5. Move to **Images**, write a prompt, **FORGE IMAGE**

## Deploying the frontend

### Vercel (recommended for `momentumaicreator.com`)

1. Push this repo to GitHub
2. In Vercel: **New Project → Import → Framework: Vite**
3. Build command: `npm run build`
4. Output: `dist`
5. Go to **Settings → Domains → Add `momentumaicreator.com`**
6. Point your DNS A record to `76.76.21.21` (Vercel's apex) and CNAME `www` to `cname.vercel-dns.com`

No server-side env vars are required — the app reads RunPod creds from the user's browser (IndexedDB / localStorage).

## Character consistency — how it works

- Characters are **synthetic**: a name, description, seed, and optional style keywords.
- Every generation prepends the character's description to your prompt.
- The deterministic **seed** keeps pose / feature drift low across generations.
- For stronger consistency, train a LoRA on 20–40 synthetic outputs of your character, upload the `.safetensors` to `/runpod-volume/loras/yourchar.safetensors`, and set `loraName` on the character.

## Data model

- Characters, gallery, and settings live in **IndexedDB** (`momentum-vault-v1`).
- API keys mirror into `localStorage` under `momentum.apiKey`, `momentum.endpointId`, `momentum.videoEndpointId` (read by the RunPod client).
- Nothing leaves the browser except requests to RunPod.

## License

Private. All rights reserved.
