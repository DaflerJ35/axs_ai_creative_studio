import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type PointerMemory = {
  mouse: { x: number; y: number };
  hover: { x: number; y: number; strength: number };
  click: { x: number; y: number; time: number };
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uLayer;
  uniform vec2 uMouse;
  uniform vec3 uHover;
  uniform vec3 uClick;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = mat2(1.62, -1.18, 1.18, 1.62) * p + 0.17;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    vec2 mouse = uMouse;
    vec2 hover = uHover.xy;
    vec2 click = uClick.xy;

    float t = uTime * (0.045 + uLayer * 0.018);
    float deepFalloff = smoothstep(1.08, 0.12, length(centered));
    float verticalDepth = smoothstep(1.08, 0.05, abs(uv.y - 0.46));

    vec2 flow = centered;
    flow.x += sin(centered.y * 2.6 + t * 2.0) * 0.10;
    flow.y += cos(centered.x * 2.2 - t * 1.7) * 0.08;

    float density = fbm(flow * (2.0 + uLayer * 1.15) + vec2(t, -t * 0.7));
    float veil = fbm(flow * (5.0 + uLayer * 1.8) - vec2(t * 1.7, t * 0.9));
    float thought = pow(max(density * 0.68 + veil * 0.32, 0.0), 2.15);

    float cursorDist = distance(uv, mouse);
    float cursorField = exp(-cursorDist * cursorDist * 42.0) * 0.55;
    float hoverDist = distance(uv, hover);
    float hoverField = exp(-hoverDist * hoverDist * 80.0) * uHover.z;

    float clickAge = max(uTime - uClick.z, 0.0);
    float clickDist = distance(uv, click);
    float ripple = exp(-clickAge * 0.75) * smoothstep(0.035, 0.0, abs(clickDist - clickAge * 0.105));

    vec3 voidBase = mix(vec3(0.002, 0.003, 0.010), vec3(0.005, 0.012, 0.022), verticalDepth);
    vec3 coldMatter = vec3(0.00, 0.44, 0.56);
    vec3 violetMemory = vec3(0.23, 0.13, 0.44);
    vec3 color = voidBase;

    color += coldMatter * thought * deepFalloff * (0.13 + uLayer * 0.055);
    color += violetMemory * veil * deepFalloff * 0.035;
    color += coldMatter * cursorField * (0.10 + uLayer * 0.04);
    color += mix(coldMatter, vec3(0.78, 0.92, 1.0), 0.45) * hoverField * 0.24;
    color += vec3(0.65, 0.95, 1.0) * ripple * 0.22;

    float vignette = smoothstep(1.08, 0.18, length(centered));
    float alpha = (0.35 + thought * 0.32 + cursorField * 0.18 + hoverField * 0.24 + ripple * 0.18) * vignette;
    alpha *= 0.42 + uLayer * 0.16;

    gl_FragColor = vec4(color, alpha);
  }
`;

function VoidLayer({ layer, pointer }: { layer: number; pointer: React.MutableRefObject<PointerMemory> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLayer: { value: layer },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uClick: { value: new THREE.Vector3(0.5, 0.5, -100) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [layer]
  );

  useFrame(({ clock, size }) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uMouse.value.lerp(new THREE.Vector2(pointer.current.mouse.x, pointer.current.mouse.y), 0.055);
    material.uniforms.uHover.value.lerp(new THREE.Vector3(pointer.current.hover.x, pointer.current.hover.y, pointer.current.hover.strength), 0.08);
    material.uniforms.uClick.value.set(pointer.current.click.x, pointer.current.click.y, pointer.current.click.time);
    material.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function NullRealityCanvas({ pointer }: { pointer: React.MutableRefObject<PointerMemory> }) {
  return (
    <Canvas dpr={[1, 1.7]} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }} camera={{ position: [0, 0, 1], fov: 75 }}>
      <VoidLayer layer={0} pointer={pointer} />
      <VoidLayer layer={1} pointer={pointer} />
      <VoidLayer layer={2} pointer={pointer} />
    </Canvas>
  );
}

export function NullRealityBackground() {
  const pointer = useRef<PointerMemory>({
    mouse: { x: 0.5, y: 0.5 },
    hover: { x: 0.5, y: 0.5, strength: 0 },
    click: { x: 0.5, y: 0.5, time: -100 },
  });

  useEffect(() => {
    const normalize = (clientX: number, clientY: number) => ({
      x: clientX / Math.max(window.innerWidth, 1),
      y: 1 - clientY / Math.max(window.innerHeight, 1),
    });

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.mouse = normalize(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      const click = normalize(event.clientX, event.clientY);
      pointer.current.click = { ...click, time: performance.now() / 1000 };
    };

    const onHover = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest("button,a,[data-void-reactive='true']") : null;
      if (!target) {
        pointer.current.hover.strength = 0;
        return;
      }

      const rect = target.getBoundingClientRect();
      pointer.current.hover = {
        x: (rect.left + rect.width / 2) / Math.max(window.innerWidth, 1),
        y: 1 - (rect.top + rect.height / 2) / Math.max(window.innerHeight, 1),
        strength: 1,
      };
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onHover, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onHover);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#010104]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(0,34,46,0.46),transparent_34%),linear-gradient(180deg,#010104_0%,#020611_48%,#000000_100%)]" />
      <NullRealityCanvas pointer={pointer} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_0%,transparent_46%,rgba(0,0,0,0.76)_100%)]" />
    </div>
  );
}
