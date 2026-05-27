import React, { useEffect, useRef } from 'react';

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Responsive setup
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction for subtle cinematic parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if(e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Particle Configuration
    // Adjust density based on screen size to maintain performance while looking rich
    const particleCount = Math.min(Math.floor((width * height) / 11000), 120); 
    const connectionDistance = 160;
    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      z: number; // Parallax depth layer

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slow cinematic drift
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.6 + 0.3;
        this.z = Math.random() * 0.6 + 0.4; // Multiplier for parallax shift
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen edges smoothly out of bounds to avoid popping
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;
      }

      draw(context: CanvasRenderingContext2D, parallaxX: number, parallaxY: number) {
        // Shift drawing position based on mouse parallax and the particle's depth layer (z)
        const drawX = this.x + parallaxX * this.z;
        const drawY = this.y + parallaxY * this.z;

        // Core particle point
        context.beginPath();
        context.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(212, 175, 55, ${this.baseAlpha})`;
        context.fill();
        
        // Premium cinematic bloom/glow around the particle
        context.beginPath();
        context.arc(drawX, drawY, this.radius * 3.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(212, 175, 55, ${this.baseAlpha * 0.15})`;
        context.fill();
      }
    }

    // Populate initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Main animation loop
    const animate = () => {
      // Clear screen with a slight trace opacity for a smooth motion blur trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.4)'; // #0A0A0A with opacity for trails
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse follow easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const parallaxX = (mouseX - width / 2) * -0.06;
      const parallaxY = (mouseY - height / 2) * -0.06;

      // Update & Draw
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx, parallaxX, parallaxY);

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p1X = particles[i].x + parallaxX * particles[i].z;
          const p1Y = particles[i].y + parallaxY * particles[i].z;
          
          const p2X = particles[j].x + parallaxX * particles[j].z;
          const p2Y = particles[j].y + parallaxY * particles[j].z;

          const dx = p1X - p2X;
          const dy = p1Y - p2Y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1X, p1Y);
            ctx.lineTo(p2X, p2Y);
            
            // Fade the line out as they get further apart
            const opacity = 1 - (distance / connectionDistance);
            
            // Average Z depth dictates line thickness and base opacity
            const avgZ = (particles[i].z + particles[j].z) / 2;
            
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * 0.5 * avgZ})`;
            ctx.lineWidth = 1.2 * avgZ;
            ctx.stroke();
          }
        }
      }

      // Add a subtle vignette over the canvas to focus the center
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) / 1.5);
      gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      id="axs-background"
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{
        backgroundColor: '#0A0A0A' // The Obsidian Black base
      }}
    />
  );
}
