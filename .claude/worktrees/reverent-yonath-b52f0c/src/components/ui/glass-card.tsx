import { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  glow?: "none" | "violet" | "cyan" | "pink" | "emerald";
  hover?: boolean;
  children: ReactNode;
  className?: string;
}

export function GlassCard({
  intensity = "medium",
  glow = "none",
  hover = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  const bg = {
    light:  "bg-white/[0.035]",
    medium: "bg-white/[0.055]",
    heavy:  "bg-white/[0.085]",
  }[intensity];

  const borderOpacity = {
    light:  "border-white/[0.07]",
    medium: "border-white/[0.1]",
    heavy:  "border-white/[0.16]",
  }[intensity];

  const glowClass = {
    none:    "",
    violet:  "shadow-[0_0_40px_-4px_rgba(139,92,246,0.35)]",
    cyan:    "shadow-[0_0_40px_-4px_rgba(34,211,238,0.3)]",
    pink:    "shadow-[0_0_40px_-4px_rgba(236,72,153,0.3)]",
    emerald: "shadow-[0_0_40px_-4px_rgba(52,211,153,0.3)]",
  }[glow];

  return (
    <div
      className={cn(
        // Base structure
        "relative rounded-2xl border overflow-hidden",
        // Glass backdrop
        "backdrop-blur-[40px] saturate-[180%]",
        // Color layers
        bg,
        borderOpacity,
        // Depth shadow
        "shadow-[0_8px_40px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.2)]",
        // Glow
        glowClass,
        // Hover lift
        hover && "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.8)]",
        className
      )}
      {...props}
    >
      {/* Inner light reflection — top left specular */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(139,92,246,0.04) 100%)
          `,
          borderRadius: "inherit",
        }}
      />

      {/* Inner border highlight */}
      <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] border border-white/[0.04] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
