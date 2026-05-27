import { useEffect, useRef } from "react";
import "./AXSCircuitLightningBackdrop.css";

interface CircuitPoint {
  x: number;
  y: number;
}

interface CircuitColor {
  core: string;
  glow: string;
}

interface CircuitPath {
  points: CircuitPoint[];
}

interface LightningStrike {
  points: CircuitPoint[];
  branches: CircuitPoint[][];
  color: CircuitColor;
  age: number;
  life: number;
  width: number;
  bloom: number;
  flickerSeed: number;
}

const CONFIG = {
  backgroundFade: "rgba(2, 4, 10, 0.34)",
  hiddenPathCount: 90,
  maxPathSegments: 16,
  segmentMin: 65,
  segmentMax: 190,
  strikeChance: 0.018,
  clusterChance: 0.18,
  maxStrikes: 4,
  strikeMinLife: 18,
  strikeMaxLife: 42,
  branchChance: 0.5,
  smallBranchChance: 0.32,
  jaggedness: 12,
  coreWidthMin: 1.5,
  coreWidthMax: 3,
  turnChance: 0.78,
  strikeMinPoints: 5,
  strikeMaxPoints: 11,
  colors: [
    { core: "rgba(235, 253, 255, 1)", glow: "rgba(0, 242, 255, 1)" },
    { core: "rgba(248, 238, 255, 1)", glow: "rgba(139, 70, 255, 1)" },
    { core: "rgba(255, 248, 220, 1)", glow: "rgba(221, 184, 101, 1)" },
  ],
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function jitterPoint(point: CircuitPoint, amount: number): CircuitPoint {
  return {
    x: point.x + random(-amount, amount),
    y: point.y + random(-amount, amount),
  };
}

function subdivideLightning(points: CircuitPoint[], roughness: number): CircuitPoint[] {
  const result: CircuitPoint[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    result.push(a);

    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(2, Math.floor(distance / 28));

    for (let j = 1; j < steps; j += 1) {
      const t = j / steps;
      const sway = Math.sin(t * Math.PI) * roughness;
      result.push({
        x: a.x + (b.x - a.x) * t + random(-sway, sway),
        y: a.y + (b.y - a.y) * t + random(-sway, sway),
      });
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

export default function AXSCircuitLightningBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pathsRef = useRef<CircuitPath[]>([]);
  const strikesRef = useRef<LightningStrike[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let visible = !document.hidden;
    let reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const makeCircuitPath = (startX: number, startY: number, preferredAngle?: number): CircuitPath => {
      const points: CircuitPoint[] = [];
      let x = startX;
      let y = startY;
      let angle = preferredAngle ?? (Math.floor(Math.random() * 8) * Math.PI) / 4;

      points.push({ x, y });

      for (let i = 0; i < Math.floor(random(7, CONFIG.maxPathSegments)); i += 1) {
        if (Math.random() < CONFIG.turnChance) {
          angle += pick([-Math.PI / 2, -Math.PI / 4, Math.PI / 4, Math.PI / 2]);
        }

        x = clamp(x + Math.cos(angle) * random(CONFIG.segmentMin, CONFIG.segmentMax), -90, width + 90);
        y = clamp(y + Math.sin(angle) * random(CONFIG.segmentMin, CONFIG.segmentMax), -90, height + 90);
        points.push({ x, y });
      }

      return { points };
    };

    const buildCircuit = () => {
      const paths: CircuitPath[] = [];
      const coreX = width * 0.5;
      const coreY = height * 0.5;

      for (let i = 0; i < CONFIG.hiddenPathCount; i += 1) {
        const fromCore = i < CONFIG.hiddenPathCount * 0.5;
        paths.push(
          makeCircuitPath(
            fromCore ? coreX + random(-110, 110) : random(-120, width + 120),
            fromCore ? coreY + random(-110, 110) : random(-120, height + 120),
            fromCore ? (Math.floor(Math.random() * 8) * Math.PI) / 4 : undefined,
          ),
        );
      }

      for (let i = 0; i < 10; i += 1) {
        paths.push(makeCircuitPath(random(-160, width * 0.25), random(height * 0.1, height * 0.9), random(-0.28, 0.28)));
      }

      pathsRef.current = paths;
      strikesRef.current = [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      buildCircuit();
    };

    const createStrike = (): LightningStrike | null => {
      const path = pick(pathsRef.current);
      if (!path || path.points.length < CONFIG.strikeMinPoints) return null;

      const maxStart = Math.max(0, path.points.length - CONFIG.strikeMinPoints);
      const startIndex = Math.floor(random(0, maxStart));
      const length = Math.floor(random(CONFIG.strikeMinPoints, CONFIG.strikeMaxPoints));
      const sourcePoints = path.points.slice(startIndex, startIndex + length);
      const points = subdivideLightning(sourcePoints.map((point) => jitterPoint(point, 8)), CONFIG.jaggedness);
      const branches: CircuitPoint[][] = [];

      for (let i = 2; i < points.length - 2; i += Math.floor(random(2, 5))) {
        if (Math.random() > CONFIG.branchChance) continue;

        const origin = points[i];
        let branch: CircuitPoint[] = [origin];
        let angle = (Math.floor(Math.random() * 8) * Math.PI) / 4;

        for (let j = 0; j < Math.floor(random(3, 7)); j += 1) {
          angle += pick([-Math.PI / 3, -Math.PI / 5, Math.PI / 5, Math.PI / 3]);
          branch.push({
            x: branch[branch.length - 1].x + Math.cos(angle) * random(24, 74),
            y: branch[branch.length - 1].y + Math.sin(angle) * random(24, 74),
          });
        }

        branch = subdivideLightning(branch, 9);
        branches.push(branch);

        if (Math.random() < CONFIG.smallBranchChance && branch.length > 3) {
          const childOrigin = branch[Math.floor(random(1, branch.length - 2))];
          let childAngle = angle + pick([-Math.PI / 2, Math.PI / 2]);
          const child: CircuitPoint[] = [childOrigin];

          for (let j = 0; j < Math.floor(random(2, 5)); j += 1) {
            childAngle += pick([-Math.PI / 6, Math.PI / 6]);
            child.push({
              x: child[child.length - 1].x + Math.cos(childAngle) * random(16, 48),
              y: child[child.length - 1].y + Math.sin(childAngle) * random(16, 48),
            });
          }

          branches.push(subdivideLightning(child, 7));
        }
      }

      return {
        points,
        branches,
        color: pick(CONFIG.colors),
        age: 0,
        life: random(CONFIG.strikeMinLife, CONFIG.strikeMaxLife),
        width: random(CONFIG.coreWidthMin, CONFIG.coreWidthMax),
        bloom: random(0.85, 1.35),
        flickerSeed: Math.random() * 9999,
      };
    };

    const strokeLightning = (points: CircuitPoint[], color: CircuitColor, alpha: number, lineWidth: number) => {
      if (points.length < 2 || alpha <= 0.01) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = color.glow;

      ctx.globalAlpha = alpha * 0.18;
      ctx.strokeStyle = color.glow;
      ctx.lineWidth = lineWidth * 18;
      ctx.shadowBlur = 42;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.52;
      ctx.strokeStyle = color.glow;
      ctx.lineWidth = lineWidth * 6.5;
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color.core;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.92;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.5, lineWidth * 0.28);
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      ctx.restore();
    };

    const drawHiddenAtmosphere = () => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const centerGlow = ctx.createRadialGradient(width * 0.5, height * 0.9, 0, width * 0.5, height * 0.9, Math.max(width, height) * 0.55);
      centerGlow.addColorStop(0, "rgba(168, 85, 247, 0.045)");
      centerGlow.addColorStop(0.24, "rgba(34, 211, 238, 0.026)");
      centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      const sideGlow = ctx.createRadialGradient(width * 0.62, height * 0.42, 0, width * 0.62, height * 0.42, Math.max(width, height) * 0.72);
      sideGlow.addColorStop(0, "rgba(34, 211, 238, 0.025)");
      sideGlow.addColorStop(0.3, "rgba(168, 85, 247, 0.018)");
      sideGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sideGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();
    };

    const drawStrike = (strike: LightningStrike) => {
      const progress = strike.age / strike.life;
      const flash = progress < 0.08 ? 1 : 0;
      const linger = progress >= 0.08 && progress < 0.38 ? 0.88 : 0;
      const fade = progress >= 0.38 ? Math.max(0, 1 - (progress - 0.38) / 0.62) : 0;
      const flicker = 0.76 + Math.sin(strike.age * 1.9 + strike.flickerSeed) * 0.16 + Math.random() * 0.16;
      const alpha = clamp(Math.max(flash, linger, fade) * flicker * strike.bloom, 0, 1);

      strokeLightning(strike.points, strike.color, alpha, strike.width);
      for (const branch of strike.branches) {
        strokeLightning(branch, strike.color, alpha * 0.68, strike.width * 0.68);
      }

      const head = strike.points[strike.points.length - 1];
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = strike.color.core;
      ctx.shadowBlur = 24;
      ctx.shadowColor = strike.color.glow;
      ctx.beginPath();
      ctx.arc(head.x, head.y, random(1.8, 4.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      strike.age += 1;
    };

    const animate = () => {
      if (!visible) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = CONFIG.backgroundFade;
      ctx.fillRect(0, 0, width, height);

      drawHiddenAtmosphere();

      if (!reducedMotion) {
        if (strikesRef.current.length < CONFIG.maxStrikes && Math.random() < CONFIG.strikeChance) {
          const strike = createStrike();
          if (strike) strikesRef.current.push(strike);

          if (strike && Math.random() < CONFIG.clusterChance) {
            for (let i = 0; i < Math.floor(random(1, 3)); i += 1) {
              const clustered = createStrike();
              if (clustered) {
                clustered.color = strike.color;
                clustered.life *= random(0.65, 0.95);
                clustered.width *= random(0.58, 0.82);
                clustered.bloom *= random(0.75, 1.05);
                strikesRef.current.push(clustered);
              }
            }
          }
        }

        strikesRef.current = strikesRef.current.filter((strike) => {
          drawStrike(strike);
          return strike.age < strike.life;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      visible = !document.hidden;
    };

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      reducedMotion = motionQuery?.matches ?? false;
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery?.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery?.removeEventListener("change", handleMotionChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="axs-circuit-lightning" aria-hidden="true">
      <canvas ref={canvasRef} className="axs-circuit-lightning-canvas" />
      <div className="axs-circuit-lightning-depth" />
      <div className="axs-circuit-lightning-vignette" />
      <div className="axs-circuit-lightning-noise" />
    </div>
  );
}
