/**
 * scripts/launch.mjs
 *
 * Single-command launcher: starts ComfyUI then Vite together.
 * Run with:  npm run dev:full
 *
 * Config lives in .env.local (gitignored):
 *   COMFYUI_PATH   — path to the ComfyUI subfolder (where main.py lives)
 *   COMFYUI_PYTHON — full path to the Python executable to use
 *   COMFYUI_ARGS   — (optional) extra flags passed to main.py
 *   COMFYUI_URL    — (optional) override if ComfyUI runs on a different port
 *
 * Ctrl+C shuts down both processes cleanly.
 */

import { spawn }     from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Colour helpers ─────────────────────────────────────────────────────────

const ESC = "\x1b";
const c = {
  reset:  `${ESC}[0m`,
  bold:   `${ESC}[1m`,
  dim:    `${ESC}[2m`,
  cyan:   `${ESC}[36m`,
  violet: `${ESC}[35m`,
  green:  `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  red:    `${ESC}[31m`,
};

const tag   = (colour, label) => `${colour}${c.bold}[${label}]${c.reset}`;
const COMFY = tag(c.violet, "ComfyUI");
const VITE  = tag(c.cyan,   "Vite   ");
const SYS   = tag(c.dim,    "Launch ");

// ── Load .env.local then .env ──────────────────────────────────────────────

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*)$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}
loadEnv();

// ── Validate COMFYUI_PATH ──────────────────────────────────────────────────

const COMFYUI_PATH = process.env.COMFYUI_PATH;
if (!COMFYUI_PATH) {
  console.error(`
${c.red}${c.bold}Error:${c.reset} COMFYUI_PATH is not set.

Add it to ${c.yellow}.env.local${c.reset} in the project root:

  COMFYUI_PATH=F:\\comfyuiAutoInstallerFLUX_v41\\ComfyUI_windows_portable\\ComfyUI
  COMFYUI_PYTHON=F:\\comfyuiAutoInstallerFLUX_v41\\ComfyUI_windows_portable\\python_embeded\\python.exe

Then run ${c.cyan}npm run dev:full${c.reset} again.
`);
  process.exit(1);
}

const comfyDir = resolve(COMFYUI_PATH);
if (!existsSync(comfyDir)) {
  console.error(`${c.red}${c.bold}Error:${c.reset} COMFYUI_PATH not found:\n  ${comfyDir}`);
  process.exit(1);
}
const mainPy = join(comfyDir, "main.py");
if (!existsSync(mainPy)) {
  console.error(`${c.red}${c.bold}Error:${c.reset} main.py not found at ${mainPy}\n  Is COMFYUI_PATH pointing to the ComfyUI subfolder (not the portable root)?`);
  process.exit(1);
}

// ── Resolve Python executable ──────────────────────────────────────────────

function resolvePython() {
  if (process.env.COMFYUI_PYTHON) {
    const p = resolve(process.env.COMFYUI_PYTHON);
    if (existsSync(p)) return p;
    console.warn(`${SYS} ${c.yellow}Warning:${c.reset} COMFYUI_PYTHON not found at ${p} — falling back to auto-detect`);
  }
  // Portable Windows install keeps python_embeded one level up from the ComfyUI folder
  const portableRoot = resolve(comfyDir, "..");
  const candidates = [
    join(portableRoot, "python_embeded", "python.exe"),   // standard portable layout
    join(portableRoot, "python_embedded", "python.exe"),  // alternate spelling
    join(comfyDir, "venv", "Scripts", "python.exe"),      // venv on Windows
    join(comfyDir, "venv", "bin", "python"),               // venv on macOS/Linux
    "python",                                              // system PATH last resort
  ];
  for (const p of candidates) {
    if (p === "python" || existsSync(p)) return p;
  }
  return "python";
}

const pythonExe = resolvePython();

// ── Extra args ─────────────────────────────────────────────────────────────
// Defaults mirror what run_nvidia_gpu.bat uses for the portable install.
// Override per-machine via COMFYUI_ARGS in .env.local.

const DEFAULT_ARGS = "--windows-standalone-build --enable-cors-header";
const extraArgStr  = process.env.COMFYUI_ARGS ?? DEFAULT_ARGS;
const extraArgs    = extraArgStr.split(/\s+/).filter(Boolean);

// ── Poll until ComfyUI is ready ────────────────────────────────────────────

const COMFY_URL  = (process.env.COMFYUI_URL ?? "http://127.0.0.1:8188").replace(/\/$/, "");
const POLL_MS    = 1500;
const TIMEOUT_MS = 120_000;

async function waitForComfyUI() {
  const deadline = Date.now() + TIMEOUT_MS;
  let dots = 0;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${COMFY_URL}/system_stats`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch { /* not ready yet */ }
    process.stdout.write(dots++ % 30 === 0 ? `${SYS} Still waiting${".".repeat(dots % 4)}\r` : "");
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return false;
}

// ── Spawn helper ───────────────────────────────────────────────────────────

function spawnProc(label, cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd:        opts.cwd ?? ROOT,
    stdio:      "pipe",
    shell:      false,
    windowsHide: false,
  });
  child.stdout?.on("data", (d) =>
    process.stdout.write(`${label} ${c.dim}${d.toString().trimEnd()}${c.reset}\n`)
  );
  child.stderr?.on("data", (d) =>
    process.stderr.write(`${label} ${c.yellow}${d.toString().trimEnd()}${c.reset}\n`)
  );
  child.on("error", (e) =>
    console.error(`${label} ${c.red}spawn error:${c.reset} ${e.message}`)
  );
  return child;
}

// ── Main ───────────────────────────────────────────────────────────────────

let comfyProc = null;
let viteProc  = null;

async function main() {
  console.log(`
${c.violet}${c.bold}  AXS AI Creative Studios${c.reset} ${c.dim}— unified launcher${c.reset}
${SYS} ComfyUI  ${c.yellow}${comfyDir}${c.reset}
${SYS} Python   ${c.yellow}${pythonExe}${c.reset}
${SYS} Args     ${extraArgs.join(" ")}
`);

  // 1. Start ComfyUI
  comfyProc = spawnProc(
    COMFY,
    pythonExe,
    ["-s", mainPy, "--listen", "127.0.0.1", "--port", "8188", ...extraArgs],
    { cwd: comfyDir }
  );
  comfyProc.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`\n${COMFY} ${c.red}exited with code ${code}${c.reset}`);
      cleanup(1);
    }
  });

  // 2. Wait for it to accept connections
  process.stdout.write(`${SYS} Waiting for ComfyUI at ${COMFY_URL} …\n`);
  const ready = await waitForComfyUI();
  if (!ready) {
    console.error(`\n${c.red}${c.bold}Timed out${c.reset} — ComfyUI did not respond after ${TIMEOUT_MS / 1000}s.`);
    cleanup(1);
    return;
  }
  process.stdout.write(`\n${SYS} ${c.green}${c.bold}ComfyUI ready!${c.reset}  Starting Vite…\n\n`);

  // 3. Start Vite — spawn node directly with the local vite bin (no npx needed)
  const viteBin = join(ROOT, "node_modules", "vite", "bin", "vite.js");
  viteProc = spawnProc(VITE, process.execPath, [viteBin, "--port=3000", "--host=0.0.0.0"]);
  viteProc.on("exit", (code) => { if (code !== null) cleanup(code ?? 0); });
}

// ── Graceful shutdown ──────────────────────────────────────────────────────

let cleaning = false;
function cleanup(exitCode = 0) {
  if (cleaning) return;
  cleaning = true;
  process.stdout.write(`\n${SYS} Shutting down both processes…\n`);
  try { if (viteProc  && !viteProc.killed)  viteProc.kill("SIGTERM");  } catch {}
  try { if (comfyProc && !comfyProc.killed) comfyProc.kill("SIGTERM"); } catch {}
  setTimeout(() => process.exit(exitCode), 800);
}

process.on("SIGINT",  () => cleanup(0));
process.on("SIGTERM", () => cleanup(0));

main().catch((e) => { console.error(e); cleanup(1); });
