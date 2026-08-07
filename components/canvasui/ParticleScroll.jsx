import { useEffect, useRef } from "react";

const defaults = {
  point: 0.68,
  band: 420,
  density: 2,
  size: 1.25,
  spread: 220,
  gravity: 0.35,
  drift: 0.7,
  swirl: 60,
  stagger: 0.7,
  fade: 0.85,
  settle: 1.2,
  smoothing: 0.6,
};

function hash(value) {
  const result = Math.sin(value * 127.1) * 43758.5453123;
  return result - Math.floor(result);
}

export function ParticleScroll({
  children,
  className = "",
  style,
  point = defaults.point,
  band = defaults.band,
  density = defaults.density,
  size = defaults.size,
  spread = defaults.spread,
  gravity = defaults.gravity,
  drift = defaults.drift,
  swirl = defaults.swirl,
  stagger = defaults.stagger,
  fade = defaults.fade,
  settle = defaults.settle,
  smoothing = defaults.smoothing,
}) {
  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !content || !canvas || !context) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let smoothScroll = window.scrollY;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let particles = [];
    let destroyed = false;

    const makeParticles = () => {
      const spacing = Math.max(8, density * 5.5);
      const count = Math.min(1100, Math.max(220, Math.round((width * Math.min(band, 520)) / (spacing * spacing))));
      particles = Array.from({ length: count }, (_, index) => {
        const xSeed = hash(index + 1.31);
        const ySeed = hash(index + 7.93);
        const depth = hash(index + 19.7);
        return {
          x: xSeed * width,
          y: (ySeed - 0.35) * band,
          depth,
          phase: hash(index + 41.2) * Math.PI * 2,
          warm: hash(index + 61.8) > 0.88,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const paint = (time) => {
      if (destroyed) return;
      const scroll = window.scrollY;
      const smoothingSeconds = Math.max(smoothing, 0.01);
      smoothScroll += (scroll - smoothScroll) * Math.min(1, 0.12 / smoothingSeconds);
      velocity += scroll - lastScroll;
      velocity *= 0.86;
      lastScroll = scroll;

      const rootTop = root.getBoundingClientRect().top + scroll;
      const lineInDocument = smoothScroll + height * Math.min(Math.max(point, 0), 1);
      const lineInRoot = Math.max(0, lineInDocument - rootTop);
      content.style.setProperty("--particle-line", `${lineInRoot}px`);
      content.style.setProperty("--particle-band", `${Math.max(band, 1)}px`);

      context.clearRect(0, 0, width, height);
      if (!reducedMotion) {
        const line = height * point;
        const seconds = time / 1000;
        const speed = Math.max(drift, 0);
        const visibleVelocity = Math.min(Math.abs(velocity), 90);

        particles.forEach((particle) => {
          const randomness = 0.35 + particle.depth * Math.max(stagger, 0.05);
          const floatX = Math.sin(seconds * speed * (0.45 + randomness) + particle.phase) * swirl * 0.08;
          const floatY = Math.cos(seconds * speed * (0.38 + randomness) + particle.phase) * spread * 0.025;
          const scrollPull = Math.sign(velocity) * visibleVelocity * (0.16 + particle.depth * 0.22);
          const x = particle.x + floatX + scrollPull * (particle.depth - 0.5);
          const y = line + particle.y + floatY + gravity * spread * particle.depth * 0.35;
          const distance = Math.abs(y - line);
          const alpha = Math.max(0, 1 - distance / Math.max(band * 0.72, 1)) * fade * (0.18 + particle.depth * 0.62);
          if (alpha < 0.015) return;

          const radius = Math.max(0.45, size * (0.5 + particle.depth * 0.8));
          context.globalAlpha = alpha;
          context.fillStyle = particle.warm ? "#37a6a1" : "#d4e0de";
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        });
        context.globalAlpha = 1;
      }

      frame = window.requestAnimationFrame(paint);
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      content.classList.toggle("particle-scroll-reduced", reducedMotion);
    };

    resize();
    onMotionChange();
    window.addEventListener("resize", resize, { passive: true });
    motionQuery.addEventListener("change", onMotionChange);
    frame = window.requestAnimationFrame(paint);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [band, density, drift, fade, gravity, point, settle, size, smoothing, spread, stagger, swirl]);

  return (
    <div ref={rootRef} className={`particle-scroll ${className}`.trim()} style={style}>
      <div ref={contentRef} className="particle-scroll-content">{children}</div>
      <canvas ref={canvasRef} className="particle-scroll-canvas" aria-hidden="true" />
    </div>
  );
}

export default ParticleScroll;
