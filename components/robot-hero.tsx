"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ────────────────────────────────────────────────────────────────────────────────
// CODEBLOOM — 3-D ROBOT HERO
// Inspired by Junca Studio's retro monitor-head robot.
// Pure CSS-3D + Canvas — no Three.js dependency required.
// ────────────────────────────────────────────────────────────────────────────────

const TERMINAL_LINES = [
  "$ codebloom --init",
  "$ git clone https://codebloom.dev/projects",
  "$ npm run discover --open-source",
  "> Scanning 1,247 open projects...",
  "$ codebloom contribute --project signal-garden",
  "> Fetching open issues... done.",
  "$ git checkout -b feature/dark-mode",
  "> Branch 'feature/dark-mode' created.",
  "$ codebloom collab --invite @devs",
  "> 3 developers joined the session.",
  "$ npm run build",
  "> ✓ Build successful in 2.4s",
  "$ codebloom ideas --explore",
  "> 89 new ideas worth building.",
  "$ codebloom --version",
  "> CodeBloom OS v2026.1 — ready.",
  "$ git commit -m 'grow together'",
  "> [main 3f2a1c9] grow together",
  "$ codebloom deploy --community",
  "> Deploying to community network...",
];

export function RobotHero() {
  // ── Cursor tracking ─────────────────────────────────────────────────────────
  const rotXRef = useRef(0);   // current (lerped) rotation-x
  const rotYRef = useRef(0);   // current (lerped) rotation-y
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const headRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // ── Terminal ─────────────────────────────────────────────────────────────────
  const [termLines, setTermLines] = useState<string[]>([]);
  const [curLine, setCurLine] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const lineIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const termBodyRef = useRef<HTMLDivElement>(null);

  // ── Scanline canvas ──────────────────────────────────────────────────────────
  const scanlineCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Ambient particle canvas ──────────────────────────────────────────────────
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Viewport ─────────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);

  // ── Cursor tracking loop ─────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Normalize to -1 … +1
    const nx = (e.clientX / vw) * 2 - 1;
    const ny = (e.clientY / vh) * 2 - 1;
    // Map to rotation angles: head tilts ±18°
    targetYRef.current = nx * 18;
    targetXRef.current = -ny * 12;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  // RAF loop for smooth lerp
  useEffect(() => {
    const LERP = 0.06;
    function tick() {
      rotXRef.current += (targetXRef.current - rotXRef.current) * LERP;
      rotYRef.current += (targetYRef.current - rotYRef.current) * LERP;
      if (headRef.current) {
        headRef.current.style.transform = `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Terminal typewriter ──────────────────────────────────────────────────────
  useEffect(() => {
    // Cursor blink
    const blinkInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    // Type characters
    const typeInterval = setInterval(() => {
      const line = TERMINAL_LINES[lineIndexRef.current % TERMINAL_LINES.length];
      if (charIndexRef.current < line.length) {
        setCurLine(line.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
      } else {
        // Finished line — pause then move on
        clearInterval(typeInterval);
        setTimeout(() => {
          const completedLine = line;
          setTermLines((prev) => {
            const next = [...prev, completedLine];
            // Keep last 8 lines visible
            return next.slice(-8);
          });
          setCurLine("");
          charIndexRef.current = 0;
          lineIndexRef.current++;
          // Restart typing
        }, 600);
      }
    }, 40);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(typeInterval);
    };
  }, []);

  // Auto-scroll terminal body
  useEffect(() => {
    if (termBodyRef.current) {
      termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
    }
  }, [termLines, curLine]);

  // ── Scanlines overlay (canvas) ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = scanlineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawScanlines() {
      if (!canvas || !ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, y, canvas.width, 1);
      }
      // Vignette
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.75
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawScanlines();
    window.addEventListener("resize", drawScanlines);
    return () => window.removeEventListener("resize", drawScanlines);
  }, []);

  // ── Ambient particle canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      alpha: number; size: number;
      color: string;
    };

    const COLORS = ["#ff2200", "#cc1100", "#ff5533", "#881100", "#ff3311"];
    const particles: Particle[] = [];
    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function spawnParticle() {
      if (!canvas) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 0.8 + 0.3),
        alpha: Math.random() * 0.4 + 0.05,
        size: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.0008;
        if (p.alpha <= 0 || p.y < -10) {
          particles.splice(i, 1);
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (Math.random() < 0.3) spawnParticle();
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="rb-hero" ref={sectionRef} aria-label="CodeBloom hero">
      {/* ── Ambient particle layer ── */}
      <canvas
        ref={particleCanvasRef}
        className="rb-particles"
        aria-hidden="true"
      />

      {/* ── Background radial fog ── */}
      <div className="rb-fog" aria-hidden="true" />

      {/* ── ROBOT SCENE (perspective container) ── */}
      <div className="rb-scene" aria-hidden="true">
        {/* Head — cursor-tracked */}
        <div className="rb-head-wrapper">
          <div className="rb-head" ref={headRef}>
            {/* Monitor bevel */}
            <div className="rb-bevel rb-bevel-tl" />
            <div className="rb-bevel rb-bevel-tr" />
            <div className="rb-bevel rb-bevel-bl" />
            <div className="rb-bevel rb-bevel-br" />

            {/* Ear grills */}
            <div className="rb-ear rb-ear-l">
              <span /><span /><span /><span /><span />
            </div>
            <div className="rb-ear rb-ear-r">
              <span /><span /><span /><span /><span />
            </div>

            {/* Antenna */}
            <div className="rb-antenna">
              <div className="rb-antenna-ball" />
              <div className="rb-antenna-stem" />
            </div>

            {/* CRT Screen */}
            <div className="rb-screen">
              {/* Screen glass glare */}
              <div className="rb-glare" />

              {/* Terminal content */}
              <div className="rb-terminal" ref={termBodyRef}>
                <div className="rb-term-header">
                  <span>CODEBLOOM OS v2026.1</span>
                  <span className="rb-term-status">● READY</span>
                </div>
                <div className="rb-term-body">
                  {termLines.map((line, i) => (
                    <p key={i} className="rb-term-line rb-term-done">
                      {line}
                    </p>
                  ))}
                  {curLine !== "" && (
                    <p className="rb-term-line rb-term-active">
                      {curLine}
                      <span
                        className="rb-caret"
                        style={{ opacity: cursorVisible ? 1 : 0 }}
                      >
                        █
                      </span>
                    </p>
                  )}
                </div>
                <div className="rb-term-footer">
                  <span>CODEBLOOM.DEV</span>
                  <span>RESET</span>
                </div>
              </div>

              {/* Scanline overlay canvas */}
              <canvas
                ref={scanlineCanvasRef}
                className="rb-scanlines"
                aria-hidden="true"
              />
            </div>

            {/* Top status LEDs */}
            <div className="rb-leds">
              <span className="rb-led rb-led-red" />
              <span className="rb-led rb-led-yellow" />
              <span className="rb-led rb-led-green" />
            </div>
          </div>
        </div>

        {/* Neck connector */}
        <div className="rb-neck" />

        {/* Torso body */}
        <div className="rb-body">
          <div className="rb-chest-grid">
            <span /><span /><span />
            <span /><span /><span />
            <span /><span /><span />
          </div>
          <div className="rb-chest-dial" />
        </div>

        {/* Pedestal / plinth */}
        <div className="rb-plinth">
          <div className="rb-plinth-top" />
          <div className="rb-plinth-face">
            <div className="rb-plinth-logo">CB</div>
          </div>
          <div className="rb-plinth-dial" />
        </div>
      </div>

      {/* ── Hero text overlay ── */}
      <div className="rb-copy">
        <p className="rb-eyebrow">Don&apos;t just build projects.</p>
        <h1 className="rb-headline">
          Grow them<br />together.
        </h1>
        <p className="rb-sub">
          Discover open-source projects, contribute code,<br />
          collaborate with developers worldwide.
        </p>
        <div className="rb-actions">
          <Link href="/signup" className="rb-btn rb-btn-primary">
            Get started
          </Link>
          <Link href="/explore" className="rb-btn rb-btn-ghost">
            Explore projects
          </Link>
        </div>
      </div>

      {/* ── Scroll hint ── */}
      <div className="rb-scroll-hint" aria-hidden="true">
        <span>Scroll to explore</span>
        <span className="rb-scroll-arrow">↓</span>
      </div>
    </section>
  );
}
