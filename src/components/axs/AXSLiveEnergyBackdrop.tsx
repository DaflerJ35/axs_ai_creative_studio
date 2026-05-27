import { useEffect, useRef } from "react";
import "./AXSLiveEnergyBackdrop.css";

interface AXSLiveEnergyBackdropProps {
  imageUrl?: string;
  intensity?: number;
}

interface EnergyColor {
  core: string;
  glow: string;
}

interface EnergyPoint {
  x: number;
  y: number;
}

interface EnergyParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: EnergyColor;
}

interface EnergyBranch {
  points: EnergyPoint[];
  color: EnergyColor;
  widthScale: number;
}

interface EnergyBolt {
  points: EnergyPoint[];
  branches: EnergyBranch[];
  color: EnergyColor;
  life: number;
  maxLife: number;
  width: number;
  power: number;
}

const CONFIG = {
  maxParticles: 70,
  particleSpawnRate: 1,
  particleLifeMin: 24,
  particleLifeMax: 52,
  clickBoltCount: 3,
  hoverBoltChance: 0.006,
  boltLifeMin: 10,
  boltLifeMax: 22,
  boltSegmentsMin: 4,
  boltSegmentsMax: 7,
  colors: [
    { core: "rgba(235, 253, 255, 1)", glow: "rgba(0, 242, 255, 0.95)" },
    { core: "rgba(245, 236, 255, 1)", glow: "rgba(155, 92, 255, 0.92)" },
  ],
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export default function AXSLiveEnergyBackdrop({
  imageUrl = "/assets/axs-circuit-bg.png",
  intensity = 1,
}: AXSLiveEnergyBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false, lastMove: 0 });
  const scrollRef = useRef(0);
  const particlesRef = useRef<EnergyParticle[]>([]);
  const boltsRef = useRef<EnergyBolt[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const getPortalOrigin = () => ({ x: width * 0.5, y: height * 0.92 });

    const spawnParticle = (x: number, y: number, power = 1) => {
      if (particlesRef.current.length > CONFIG.maxParticles) particlesRef.current.shift();

      const color = pick(CONFIG.colors);
      const angle = random(0, Math.PI * 2);
      const speed = random(0.35, 1.5) * power * intensity;

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(0.1, 0.7),
        life: 0,
        maxLife: random(CONFIG.particleLifeMin, CONFIG.particleLifeMax),
        size: random(1.1, 3.4) * power,
        color,
      });
    };

    const makeBranches = (points: EnergyPoint[], color: EnergyColor, power: number): EnergyBranch[] => {
      const branches: EnergyBranch[] = [];

      for (let i = 1; i < points.length - 1; i += 1) {
        if (Math.random() > 0.38 * power) continue;

        const origin = points[i];
        const branch: EnergyPoint[] = [origin];
        let angle = random(0, Math.PI * 2);
        let x = origin.x;
        let y = origin.y;

        for (let j = 0; j < Math.floor(random(2, 5)); j += 1) {
          angle += pick([-Math.PI / 2, -Math.PI / 4, Math.PI / 4, Math.PI / 2]);
          x += Math.cos(angle) * random(16, 55) * power;
          y += Math.sin(angle) * random(16, 55) * power;
          branch.push({ x, y });
        }

        branches.push({ points: branch, color, widthScale: random(0.35, 0.7) });
      }

      return branches;
    };

    const makeBolt = (startX: number, startY: number, endX: number, endY: number, power = 1) => {
      const adjustedPower = power * intensity;
      const color = pick(CONFIG.colors);
      const points: EnergyPoint[] = [{ x: startX, y: startY }];
      const segments = Math.floor(random(CONFIG.boltSegmentsMin, CONFIG.boltSegmentsMax));
      const normalAngle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;

      for (let i = 1; i < segments; i += 1) {
        const t = i / segments;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        const offset = random(-38, 38) * adjustedPower;
        points.push({
          x: x + Math.cos(normalAngle) * offset,
          y: y + Math.sin(normalAngle) * offset,
        });
      }

      points.push({ x: endX, y: endY });
      boltsRef.current.push({
        points,
        branches: makeBranches(points, color, adjustedPower),
        color,
        life: 0,
        maxLife: random(CONFIG.boltLifeMin, CONFIG.boltLifeMax),
        width: random(1.3, 2.7) * adjustedPower,
        power: adjustedPower,
      });
    };

    const drawPath = (points: EnergyPoint[]) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    };

    const drawLightningPath = (points: EnergyPoint[], color: EnergyColor, alpha: number, lineWidth: number, power: number) => {
      if (!points || points.length < 2 || alpha <= 0.01) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.globalAlpha = alpha * 0.08;
      ctx.strokeStyle = color.glow;
      ctx.lineWidth = lineWidth * 10;
      ctx.shadowBlur = 24 * power;
      ctx.shadowColor = color.glow;
      drawPath(points);

      ctx.globalAlpha = alpha * 0.28;
      ctx.strokeStyle = color.glow;
      ctx.lineWidth = lineWidth * 3.2;
      ctx.shadowBlur = 12 * power;
      ctx.shadowColor = color.glow;
      drawPath(points);

      ctx.globalAlpha = alpha * 0.95;
      ctx.strokeStyle = color.core;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 4 * power;
      ctx.shadowColor = color.core;
      drawPath(points);

      ctx.restore();
    };

    const drawBolt = (bolt: EnergyBolt) => {
      const progress = bolt.life / bolt.maxLife;
      const alpha = progress < 0.08 ? 1 : progress < 0.42 ? 0.92 : Math.max(0, 1 - (progress - 0.42) / 0.58);
      const finalAlpha = alpha * (0.72 + Math.random() * 0.34);

      drawLightningPath(bolt.points, bolt.color, finalAlpha, bolt.width, bolt.power);
      for (const branch of bolt.branches) {
        drawLightningPath(branch.points, branch.color, finalAlpha * 0.62, bolt.width * branch.widthScale, bolt.power);
      }

      bolt.life += 1;
      return bolt.life < bolt.maxLife;
    };

    const drawParticle = (particle: EnergyParticle) => {
      const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.life += 1;

      ctx.save();
      ctx.globalAlpha = alpha * 0.75;
      ctx.fillStyle = particle.color.core;
      ctx.shadowBlur = 16;
      ctx.shadowColor = particle.color.glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return particle.life < particle.maxLife;
    };

    const drawPortalGlow = () => {
      const portal = getPortalOrigin();
      const scrollBoost = Math.min(scrollRef.current / 800, 1);
      const pointerBoost = pointerRef.current.active ? 0.16 : 0;
      const alpha = 0.08 + scrollBoost * 0.1 + pointerBoost;
      const gradient = ctx.createRadialGradient(portal.x, portal.y, 0, portal.x, portal.y, height * 0.42);

      gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha})`);
      gradient.addColorStop(0.22, `rgba(34, 211, 238, ${alpha * 0.7})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    const pulseFromPortal = (power = 1) => {
      const portal = getPortalOrigin();
      for (let i = 0; i < 4; i += 1) {
        makeBolt(portal.x + random(-40, 40), portal.y + random(-10, 30), random(width * 0.12, width * 0.88), random(height * 0.14, height * 0.78), power);
      }
      for (let i = 0; i < 18; i += 1) spawnParticle(portal.x, portal.y, power);
    };

    const animate = () => {
      if (!visible) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      drawPortalGlow();

      if (!reducedMotion) {
        particlesRef.current = particlesRef.current.filter(drawParticle);
        boltsRef.current = boltsRef.current.filter(drawBolt);

        const pointer = pointerRef.current;
        const now = performance.now();
        if (pointer.active && now - pointer.lastMove < 120) {
          for (let i = 0; i < CONFIG.particleSpawnRate; i += 1) spawnParticle(pointer.x, pointer.y, 0.75);
          if (Math.random() < CONFIG.hoverBoltChance) {
            const portal = getPortalOrigin();
            makeBolt(portal.x + random(-30, 30), portal.y, pointer.x + random(-30, 30), pointer.y + random(-30, 30), 0.45);
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
      pointerRef.current.lastMove = performance.now();
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handleClick = (event: MouseEvent) => {
      if (reducedMotion) return;
      const portal = getPortalOrigin();

      for (let i = 0; i < CONFIG.clickBoltCount; i += 1) {
        makeBolt(portal.x + random(-50, 50), portal.y + random(-20, 20), event.clientX + random(-40, 40), event.clientY + random(-40, 40), 0.85);
      }
      for (let i = 0; i < 10; i += 1) spawnParticle(event.clientX, event.clientY, 0.75);
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    };

    const handleEnergyPulse = (event: Event) => {
      pulseFromPortal((event as CustomEvent<{ power?: number }>).detail?.power ?? 1);
    };

    const handleEnergyHover = (event: MouseEvent) => {
      if (reducedMotion) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-axs-energy]") : null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      makeBolt(width * 0.5, height * 0.92, rect.left + rect.width / 2, rect.top + rect.height / 2, Number(target.dataset.axsEnergy) || 0.7);
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
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("axs:energy-pulse", handleEnergyPulse);
    window.addEventListener("mouseover", handleEnergyHover);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery?.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("axs:energy-pulse", handleEnergyPulse);
      window.removeEventListener("mouseover", handleEnergyHover);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery?.removeEventListener("change", handleMotionChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <div className="axs-live-energy-backdrop" aria-hidden="true">
      <div className="axs-live-energy-image" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="axs-live-energy-darken" />
      <canvas ref={canvasRef} className="axs-live-energy-canvas" />
      <div className="axs-live-energy-vignette" />
    </div>
  );
}
