"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./Synthesis.module.css";

/* ============================================================
 * کوره — Forge atmosphere
 * ------------------------------------------------------------
 * سه لایه روی یک canvas و یک requestAnimationFrame:
 *
 *   ۱) هاله (haze)  — دودِ گرمِ کم‌نور، عمق می‌سازد
 *   ۲) شبکه (lattice) — از پراکندگی جمع می‌شود، بعد نور را
 *      از گره‌ای به گره‌ی دیگر عبور می‌دهد
 *   ۳) خاکستر (embers + sparks) — از دهانه‌های کف زاده می‌شوند
 *
 * نکته‌ی اصلیِ حرکت: هیچ ذره‌ای «ساعتِ خودش» را ندارد.
 * همه از یک میدانِ جریانِ مشترک (flow field) سرعت می‌گیرند،
 * پس ذراتِ همسایه با هم حرکت می‌کنند — این تفاوتِ دود واقعی
 * با نوسانِ سینوسیِ تک‌تکِ ذرات است.
 * ============================================================ */

type RGB = [number, number, number];

/* رمپِ رنگِ خاکستر — از سفیدِ داغ تا خاکسترِ سرد.
   پنج توقف، نه دو: همین باعث می‌شود ember «سرد شدن» را
   واقعاً نشان دهد. */
const EMBER_RAMP: Array<{ at: number; c: RGB }> = [
  { at: 0.0, c: [255, 243, 219] }, // سفیدِ داغ
  { at: 0.18, c: [255, 214, 143] }, // طلاییِ روشن
  { at: 0.45, c: [224, 168, 96] }, // کهربا
  { at: 0.72, c: [176, 112, 58] }, // کهرباییِ سیر
  { at: 1.0, c: [92, 78, 66] }, // خاکستر
];

function rampColor(t: number): RGB {
  const stops = EMBER_RAMP;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].at) {
      const a = stops[i - 1];
      const b = stops[i];
      const k = (t - a.at) / (b.at - a.at);
      return [
        a.c[0] + (b.c[0] - a.c[0]) * k,
        a.c[1] + (b.c[1] - a.c[1]) * k,
        a.c[2] + (b.c[2] - a.c[2]) * k,
      ];
    }
  }
  return stops[stops.length - 1].c;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/* ------------------------------------------------------------
 * میدانِ جریان — curl یک تابعِ پتانسیل
 * ------------------------------------------------------------
 * ψ را از جمعِ چند سینوس می‌سازیم و سرعت را از curl آن
 * می‌گیریم: u = ∂ψ/∂y ، v = -∂ψ/∂x
 *
 * چون میدان divergence-free است، هیچ نقطه‌ای چشمه یا چاه
 * نمی‌شود؛ نتیجه گردابه‌های واقعی‌ست، نه کشیده‌شدنِ همه‌ی
 * ذرات به یک سمت.
 * ------------------------------------------------------------ */
const OCTAVES = [
  { a: 1.0, kx: 3.1, ky: 2.3, wx: 0.00021, wy: -0.00014 },
  { a: 0.5, kx: 6.7, ky: 5.1, wx: -0.00034, wy: 0.00025 },
  { a: 0.26, kx: 13.3, ky: 10.7, wx: 0.00052, wy: 0.00041 },
];

function flowAt(x: number, y: number, t: number, out: [number, number]) {
  let u = 0;
  let v = 0;
  for (const o of OCTAVES) {
    const p = o.kx * x + o.wx * t;
    const q = o.ky * y + o.wy * t;
    const sp = Math.sin(p);
    const cp = Math.cos(p);
    const sq = Math.sin(q);
    const cq = Math.cos(q);
    // ∂ψ/∂y = -a·ky·sin(p)·sin(q)
    u += -o.a * o.ky * sp * sq;
    // -∂ψ/∂x = -a·kx·cos(p)·cos(q)
    v += -o.a * o.kx * cp * cq;
  }
  out[0] = u;
  out[1] = v;
}

/* ------------------------------------------------------------
 * سپرایت‌ها — یک بار ساخته می‌شوند
 * hardness بالاتر = مغزِ متمرکزتر
 * ------------------------------------------------------------ */
function makeSprite(size: number, hardness: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.12 * hardness, "rgba(255,255,255,0.82)");
    grad.addColorStop(0.34 * hardness, "rgba(255,255,255,0.34)");
    grad.addColorStop(0.62, "rgba(255,255,255,0.09)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

/* ------------------------------------------------------------
 * شبکه‌ی شش‌گوش + مجاورت (برای عبورِ نور)
 * ------------------------------------------------------------ */
interface LatticeNode {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  seed: number;
}

function buildLattice(rings: number, spacing: number) {
  const nodes: LatticeNode[] = [];
  const cx = 0.5;
  const cy = 0.4;
  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      if (Math.abs(q + r) > rings) continue;
      const x = cx + spacing * (q + r / 2);
      const y = cy + spacing * r * 0.866;
      const seed = (q * 73856093) ^ (r * 19349663);
      const ang = (seed % 628) / 100;
      const dist = 0.18 + ((seed >>> 3) % 100) / 420;
      nodes.push({
        sx: x + Math.cos(ang) * dist,
        sy: y + Math.sin(ang) * dist * 0.7,
        tx: x,
        ty: y,
        seed: Math.abs(seed % 1000) / 1000,
      });
    }
  }

  const edges: Array<[number, number]> = [];
  const adj: number[][] = nodes.map(() => []);
  const max = spacing * 1.06;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].tx - nodes[j].tx;
      const dy = nodes[i].ty - nodes[j].ty;
      if (Math.hypot(dx, dy) <= max) {
        edges.push([i, j]);
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  return { nodes, edges, adj };
}

/** فاصله‌ی گرافی (تعدادِ پرش) از یک گره — BFS */
function hopsFrom(origin: number, adj: number[][]): number[] {
  const dist = new Array<number>(adj.length).fill(-1);
  dist[origin] = 0;
  const queue = [origin];
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    for (const nb of adj[cur]) {
      if (dist[nb] === -1) {
        dist[nb] = dist[cur] + 1;
        queue.push(nb);
      }
    }
  }
  return dist;
}

/* ------------------------------------------------------------
 * ذرات
 * ------------------------------------------------------------ */
type Kind = 0 | 1 | 2; // 0=هاله 1=خاکستر 2=جرقه

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  peak: number;
  /** پاسخ به میدانِ جریان — ذراتِ سبک‌تر بیشتر می‌پیچند */
  swirl: number;
  /** شناوری */
  buoy: number;
  flick: number;
  spin: number;
}

function useForgeCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, active: boolean) {
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const emberSprite = makeSprite(64, 1);
    const hazeSprite = makeSprite(128, 0.35);

    let w = 0;
    let h = 0;
    let scale = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      scale = Math.min(w, h);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const { nodes, edges, adj } = buildLattice(mobile ? 2 : 3, mobile ? 0.075 : 0.062);

    /* --- دهانه‌های کفِ کوره ---
       ذرات از چند دهانه بیرون می‌آیند، نه یکنواخت از کلِ کف.
       دهانه‌ها آرام جابه‌جا می‌شوند و شدتشان می‌تپد، پس
       خاکستر به‌صورتِ فوران‌های نامنظم بالا می‌آید. */
    const vents = [
      { base: 0.5, amp: 0.055, wx: 0.00009, px: 0.0, wi: 0.00028, pi: 0.0 },
      { base: 0.37, amp: 0.07, wx: -0.00013, px: 2.1, wi: 0.00041, pi: 1.7 },
      { base: 0.63, amp: 0.065, wx: 0.00011, px: 4.3, wi: 0.00035, pi: 3.9 },
      { base: 0.5, amp: 0.13, wx: -0.00007, px: 5.6, wi: 0.00023, pi: 5.2 },
    ];
    const ventX = (i: number, t: number) =>
      vents[i].base + vents[i].amp * Math.sin(vents[i].wx * t + vents[i].px);
    const ventHeat = (i: number, t: number) =>
      0.35 + 0.65 * (0.5 + 0.5 * Math.sin(vents[i].wi * t + vents[i].pi));

    const counts = mobile
      ? { haze: 8, ember: 26, spark: 5 }
      : { haze: 16, ember: 54, spark: 10 };

    const spawn = (p: Particle, t: number, initial: boolean) => {
      // دهانه را به‌نسبتِ گرمایش انتخاب کن
      let pick = 0;
      let best = -1;
      for (let i = 0; i < vents.length; i++) {
        const score = ventHeat(i, t) * Math.random();
        if (score > best) {
          best = score;
          pick = i;
        }
      }
      const jitter = (Math.random() - 0.5) * 0.06;
      p.x = ventX(pick, t) + jitter;
      p.y = initial ? Math.random() * 1.05 : 1.03 + Math.random() * 0.05;
      p.vx = (Math.random() - 0.5) * 0.00003;
      p.life = 0;
      p.flick = Math.random() * Math.PI * 2;
      p.spin = (Math.random() - 0.5) * 0.004;

      if (p.kind === 0) {
        // هاله: بزرگ، کم‌نور، کند
        p.r = 26 + Math.random() * 44;
        p.vy = -(0.000022 + Math.random() * 0.000026);
        p.maxLife = 11000 + Math.random() * 9000;
        p.peak = 0.05 + Math.random() * 0.05;
        p.swirl = 0.55 + Math.random() * 0.35;
        p.buoy = 0.3;
      } else if (p.kind === 1) {
        // خاکستر: ستاره‌ی صحنه
        p.r = 0.8 + Math.random() * 2.2;
        p.vy = -(0.00006 + Math.random() * 0.00009);
        p.maxLife = 3600 + Math.random() * 6200;
        p.peak = 0.34 + Math.random() * 0.5;
        p.swirl = 0.9 + Math.random() * 0.8;
        p.buoy = 0.8 + Math.random() * 0.7;
      } else {
        // جرقه: کم، تند، کوتاه — نقطه‌گذاریِ صحنه
        p.r = 0.5 + Math.random() * 0.8;
        p.vy = -(0.00028 + Math.random() * 0.00026);
        p.maxLife = 620 + Math.random() * 680;
        p.peak = 0.75 + Math.random() * 0.25;
        p.swirl = 0.45;
        p.buoy = 1.5;
      }
      if (initial) p.life = Math.random() * p.maxLife;
    };

    const particles: Particle[] = [];
    const seed0 = performance.now();
    for (const [kind, n] of [
      [0, counts.haze],
      [1, counts.ember],
      [2, counts.spark],
    ] as Array<[Kind, number]>) {
      for (let i = 0; i < n; i++) {
        const p = { kind } as Particle;
        spawn(p, seed0, true);
        particles.push(p);
      }
    }

    /* --- نشانگر: جریانِ روبه‌بالای موضعی --- */
    const pointer = { x: -1, y: -1, strength: 0 };
    const onPointerMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (ev.clientX - rect.left) / rect.width;
      pointer.y = (ev.clientY - rect.top) / rect.height;
      pointer.strength = 1;
    };
    const onPointerLeave = () => {
      pointer.strength = 0;
    };

    /* --- بسته‌شدنِ شبکه --- */
    let assembly = reduced ? 1 : 0;
    const ASSEMBLY_MS = 2600;

    /* --- عبورِ نور از شبکه ---
       شبکه پس از بسته‌شدن ساکن نمی‌ماند: نور از یک گره
       شروع می‌شود و پرش‌به‌پرش در ساختار پیش می‌رود. مسیر را
       خودِ گرافِ شبکه تعیین می‌کند، نه یک انیمیشنِ دلبخواه. */
    let hops: number[] = hopsFrom(0, adj);
    let maxHop = Math.max(...hops);
    let pulseT = -1600; // تأخیرِ اولیه پس از بسته‌شدن
    const PULSE_MS = 2900;
    const nodeGlow = new Float32Array(nodes.length);

    const newPulse = () => {
      const origin = Math.floor(Math.random() * nodes.length);
      hops = hopsFrom(origin, adj);
      maxHop = Math.max(...hops);
      pulseT = -(900 + Math.random() * 1800); // مکث بین دو عبور
    };

    const px = new Float64Array(nodes.length);
    const py = new Float64Array(nodes.length);
    const fv: [number, number] = [0, 0];

    const draw = (dt: number, t: number) => {
      ctx.clearRect(0, 0, w, h);
      const p = easeOutCubic(assembly);

      /* ---------- به‌روزرسانیِ ذرات ---------- */
      if (!reduced) {
        for (const q of particles) {
          q.life += dt;
          if (q.life >= q.maxLife || q.y < -0.1) {
            spawn(q, t, false);
            continue;
          }

          flowAt(q.x, q.y, t, fv);

          // همگراییِ کف، واگراییِ بالا — شکلِ ستونِ دود
          const conv = (0.5 - q.x) * (0.00006 * Math.max(q.y - 0.25, 0));
          // شناوری با سرد شدن کم می‌شود
          const cool = q.life / q.maxLife;
          const lift = q.vy * q.buoy * (1 - 0.55 * cool);

          q.x += (fv[0] * 0.0000135 * q.swirl + q.vx + conv) * dt;
          q.y += (lift + fv[1] * 0.0000055 * q.swirl) * dt;

          if (pointer.strength > 0) {
            const dx = q.x - pointer.x;
            const dy = q.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 0.22) {
              const f = (1 - d / 0.22) * pointer.strength;
              q.y -= 0.00009 * f * dt * q.buoy;
              q.x += (dx / (d + 0.01)) * 0.00003 * f * dt;
            }
          }
        }
      }

      /* ---------- لایه ۱: هاله ---------- */
      ctx.globalCompositeOperation = "lighter";
      for (const q of particles) {
        if (q.kind !== 0) continue;
        const k = q.life / q.maxLife;
        const a = Math.pow(Math.sin(Math.PI * k), 1.1) * q.peak;
        if (a <= 0.002) continue;
        const size = q.r * (1 + 1.5 * k) * (scale / 900 + 0.7);
        ctx.globalAlpha = Math.min(a, 1);
        ctx.drawImage(hazeSprite, q.x * w - size / 2, q.y * h - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* ---------- لایه ۲: شبکه ---------- */
      if (p > 0.001) {
        const settled = p > 0.985 && !reduced;

        // مکانِ گره‌ها
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const drift = settled ? 0.0018 : 0;
          const bx = Math.sin(t * 0.00019 + n.seed * 6.283) * drift;
          const by = Math.cos(t * 0.00016 + n.seed * 5.1) * drift;
          px[i] = (n.sx + (n.tx - n.sx) * p + bx) * w;
          py[i] = (n.sy + (n.ty - n.sy) * p + by) * h;
        }

        // پیشرویِ موجِ نور
        nodeGlow.fill(0);
        if (settled) {
          pulseT += dt;
          if (pulseT > PULSE_MS) newPulse();
          if (pulseT > 0) {
            // جبهه‌ی موج از گرهِ مبدأ به بیرون می‌رود و برمی‌گردد
            const prog = pulseT / PULSE_MS;
            const front = prog * (maxHop + 1.6);
            // دامنه در ابتدا و انتها محو می‌شود
            const envelope = Math.sin(Math.PI * prog);
            for (let i = 0; i < nodes.length; i++) {
              const d = hops[i] - front;
              nodeGlow[i] = Math.exp(-(d * d) / 0.85) * envelope;
            }
          }
        }

        // یال‌های پایه
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(212,175,106,${(0.15 * p).toFixed(3)})`;
        ctx.beginPath();
        for (const [i, j] of edges) {
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
        }
        ctx.stroke();

        // یال‌های روشن — نور در حالِ عبور
        if (settled) {
          ctx.globalCompositeOperation = "lighter";
          ctx.lineCap = "round";
          for (const [i, j] of edges) {
            const g = (nodeGlow[i] + nodeGlow[j]) * 0.5;
            if (g < 0.03) continue;
            ctx.strokeStyle = `rgba(255,226,168,${(g * 0.5).toFixed(3)})`;
            ctx.lineWidth = 1 + g * 1.5;
            ctx.beginPath();
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[j], py[j]);
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }

        // گره‌ها
        for (let i = 0; i < nodes.length; i++) {
          const g = nodeGlow[i];
          ctx.fillStyle = `rgba(230,197,133,${(0.45 * p + g * 0.5).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px[i], py[i], 1.25 + g * 1.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // درخششِ گره‌ی روشن
        if (settled) {
          ctx.globalCompositeOperation = "lighter";
          for (let i = 0; i < nodes.length; i++) {
            const g = nodeGlow[i];
            if (g < 0.08) continue;
            const size = 16 + g * 22;
            ctx.globalAlpha = g * 0.5;
            ctx.drawImage(emberSprite, px[i] - size / 2, py[i] - size / 2, size, size);
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }

      /* ---------- لایه ۳: خاکستر و جرقه ---------- */
      ctx.globalCompositeOperation = "lighter";
      for (const q of particles) {
        if (q.kind === 0) continue;
        const k = q.life / q.maxLife;

        // پاکتِ روشنایی + لرزشِ ملایمِ شعله
        let a = Math.pow(Math.sin(Math.PI * k), q.kind === 2 ? 0.8 : 1.25) * q.peak;
        if (q.kind === 1) a *= 0.82 + 0.18 * Math.sin(t * 0.006 + q.flick);
        if (pointer.strength > 0) {
          const d = Math.hypot(q.x - pointer.x, q.y - pointer.y);
          if (d < 0.22) a += (1 - d / 0.22) * 0.2 * pointer.strength;
        }
        if (a <= 0.003) continue;

        const [r, g, b] = rampColor(q.kind === 2 ? k * 0.5 : k);
        const cx = q.x * w;
        const cy = q.y * h;
        const rad = q.r * (1 - 0.4 * k) * (scale / 900 + 0.72);

        if (q.kind === 2) {
          // جرقه: خطِ کشیده در راستای حرکت — حسِ سرعت
          const len = Math.min(Math.abs(q.vy) * 26000, 22);
          ctx.globalAlpha = Math.min(a, 1);
          ctx.strokeStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
          ctx.lineWidth = rad * 1.1;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - q.vx * 9000, cy + len);
          ctx.stroke();
        } else {
          const size = rad * 8;
          ctx.globalAlpha = Math.min(a, 1);
          ctx.drawImage(emberSprite, cx - size / 2, cy - size / 2, size, size);
          ctx.globalAlpha = Math.min(a * 1.6, 1);
          ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
          ctx.beginPath();
          ctx.arc(cx, cy, rad * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let last = performance.now();
    let started = 0;
    let running = false;

    if (reduced) {
      draw(0, seed0);
      const onResize = () => {
        resize();
        draw(0, seed0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    // Loop is paused while the canvas is offscreen or the tab is hidden
    // (FIX-8): cancel the rAF on exit, restart on enter. No visual change.
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const loop = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;
      if (activeRef.current) {
        if (!started) started = now;
        assembly = Math.min((now - started) / ASSEMBLY_MS, 1);
      }
      if (pointer.strength > 0) pointer.strength = Math.max(pointer.strength - dt / 900, 0);
      draw(dt, now);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [canvasRef]);
}

/* ============================================================
 * سه مرحله‌ی کوره — خام → حرارت → بلور
 * ============================================================ */
interface Stage {
  num: string;
  state: string;
  temp: string;
  question: string;
  title: string;
  desc: string;
  /** ۰..۱ — گرمای مرحله؛ عرضِ نوارِ پایینِ کارت */
  heat: number;
  glyph: ReactNode;
}

const stages: Stage[] = [
  {
    num: "۰۱",
    state: "خام",
    temp: "۲۲°",
    question: "چرا؟",
    title: "Humanities as OS",
    desc: "قبل از اینکه چیزی بسازی، باید بدانی چرا. فلسفه specification می‌دهد، کد پیاده می‌کند. علوم انسانی، سیستم‌عاملِ ذهنِ منه.",
    heat: 0.18,
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {/* شش‌گوشِ شکسته — ماده‌ی بی‌شکل */}
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="glyphDraw">
          <path d="M24 5 L41 14.5" />
          <path d="M41 21 L41 33.5" />
          <path d="M31 40 L24 43.5 L18 40" />
          <path d="M7 33.5 L7 22" />
        </g>
        {/* ذراتِ پراکنده */}
        <g fill="currentColor" className="glyphDots">
          <circle cx="19" cy="19" r="1.5" />
          <circle cx="29" cy="17" r="1.1" />
          <circle cx="24" cy="26" r="1.7" />
          <circle cx="17" cy="30" r="1.2" />
          <circle cx="31" cy="29" r="1.4" />
        </g>
      </svg>
    ),
  },
  {
    num: "۰۲",
    state: "کوره",
    temp: "۱۴۸۰°",
    question: "چگونه؟",
    title: "Code as Hermeneutics",
    desc: "هر تابع یک قرائت است. هر API یک قاعده‌ی هرمنوتیک. کد، تفسیرِ دنیاست — فقط به زبونِ صفر و یک.",
    heat: 1,
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <polygon
          points="24,4 41,14 41,34 24,44 7,34 7,14"
          stroke="currentColor"
          strokeWidth="1.4"
          className="glyphDraw"
        />
        {/* مادّه‌ی مذاب */}
        <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="glyphFlow">
          <path d="M13 30 Q19 25 24 30 T35 30" />
          <path d="M13 35 Q19 30 24 35 T35 35" opacity="0.6" />
        </g>
        {/* زبانه‌های حرارت */}
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="glyphHeat">
          <path d="M19 22 V16" />
          <path d="M24 20 V13" />
          <path d="M29 22 V17" />
        </g>
      </svg>
    ),
  },
  {
    num: "۰۳",
    state: "بلور",
    temp: "۲۲°",
    question: "چیست؟",
    title: "Structure as Freedom",
    desc: "typeها، schemaها، offline-first — همه محدودیت‌اند. ولی تازه همین محدودیت‌ها جاییه که خلاقیت می‌تونه نفس بکشه. آزادی بدون ساختار، فقط اضطرابه.",
    heat: 0.52,
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.4" className="glyphDraw">
          <polygon points="24,4 41,14 41,34 24,44 7,34 7,14" />
          <polygon points="24,13 33,18.5 33,29.5 24,35 15,29.5 15,18.5" opacity="0.7" />
        </g>
        {/* وجه‌ها — قفل‌شده */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.55" className="glyphFacets">
          <path d="M24 4 V13" />
          <path d="M41 14 L33 18.5" />
          <path d="M41 34 L33 29.5" />
          <path d="M24 44 V35" />
          <path d="M7 34 L15 29.5" />
          <path d="M7 14 L15 18.5" />
        </g>
        <circle cx="24" cy="24" r="3.2" fill="currentColor" className="glyphCore" />
      </svg>
    ),
  },
];

export default function Synthesis() {
  const { ref, revealed } = useScrollReveal<HTMLElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -12% 0px",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useForgeCanvas(canvasRef, revealed);

  return (
    <section
      ref={ref}
      id="synthesis"
      className={styles.synthesis}
      aria-labelledby="synthesis-title"
      data-revealed={revealed ? "true" : undefined}
    >
      {/* کوره — پس‌زمینه */}
      <div className={styles.forge} aria-hidden="true">
        <div className={styles.forgeFloor} />
        <canvas ref={canvasRef} className={styles.forgeCanvas} />
        <div className={styles.forgeVignette} />
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kicker} data-reveal>
            <span className={styles.kickerDot} aria-hidden="true" />
            §تبلور
          </span>
          <h2 id="synthesis-title" className={styles.title} data-reveal>
            ذهنم چطور به ساختن می‌رسه.
          </h2>
          <p className={styles.subtitle} data-reveal>
            اول آدم‌ها و مسئله‌ها را نگاه می‌کنم، بعد برایشان شکل می‌سازم. کد
            برای من آخر مسیر است؛ جایی که فکر بالاخره قابل لمس می‌شود.
          </p>
        </header>

        {/* معادله‌ی بصری زنده */}
        <div
          className={styles.equation}
          role="math"
          aria-label="مسئله‌ی انسانی به‌علاوه‌ی راهکار الگوریتمی مساویِ ابزارِ معنادار"
        >
          <div className={styles.term} data-reveal>
            <span className={styles.termBox}>
              <svg
                className={styles.termIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                <path d="M12 16v-3.2c1.8 0 3-1.1 3-2.7A3 3 0 0 0 9 10" strokeLinecap="round" />
                <circle cx="12" cy="19" r="0.9" fill="currentColor" stroke="none" />
              </svg>
              <span className={styles.termLabel}>مسئله‌ی انسانی</span>
            </span>
            <span className={styles.termSub}>«چرا؟»</span>
          </div>

          <span className={styles.operator} data-reveal aria-hidden="true">
            +
          </span>

          <div className={styles.term} data-reveal>
            <span className={styles.termBox}>
              <svg
                className={styles.termIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 5l-2 14" strokeLinecap="round" opacity="0.6" />
              </svg>
              <span className={styles.termLabel}>راهکارِ الگوریتمی</span>
            </span>
            <span className={styles.termSub}>«چگونه؟»</span>
          </div>

          <span className={styles.operator} data-reveal aria-hidden="true">
            =
          </span>

          <div className={`${styles.term} ${styles.termResult}`} data-reveal>
            <span className={styles.termBox}>
              <svg
                className={styles.termIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" />
                <polygon points="12,7.5 16,10 16,14 12,16.5 8,14 8,10" fill="currentColor" opacity="0.25" />
              </svg>
              <span className={styles.termLabel}>ابزارِ معنادار</span>
            </span>
            <span className={styles.termSub}>«چیست؟»</span>
          </div>
        </div>

        {/* ریختنِ مذاب — از معادله به سه قالب */}
        <div className={styles.pour} aria-hidden="true">
          <svg viewBox="0 0 1200 72" className={styles.pourSvg} preserveAspectRatio="none">
            <defs>
              <linearGradient id="synthesis-pour" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-bright)" stopOpacity="0" />
                <stop offset="45%" stopColor="var(--accent-bright)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path className={styles.pourPath} d="M600 0 C600 30 200 32 200 72" />
            <path className={styles.pourPath} d="M600 0 L600 72" />
            <path className={styles.pourPath} d="M600 0 C600 30 1000 32 1000 72" />
            <circle className={styles.pourDot} cx="200" cy="70" r="2.5" />
            <circle className={styles.pourDot} cx="600" cy="70" r="2.5" />
            <circle className={styles.pourDot} cx="1000" cy="70" r="2.5" />
          </svg>
        </div>

        {/* سه مرحله */}
        <ol className={styles.stages}>
          {stages.map((s) => (
            <li
              key={s.title}
              className={styles.stageCard}
              data-state={s.state}
              style={{ "--heat": s.heat } as React.CSSProperties}
              data-reveal
            >
              <span className={styles.sheen} aria-hidden="true" />

              <div className={styles.stageMeta}>
                <span className={styles.stageNum}>مرحله {s.num}</span>
                <span className={styles.stageTemp}>
                  <span className={styles.tempDot} aria-hidden="true" />
                  {s.temp}
                </span>
              </div>

              <span className={styles.glyph} aria-hidden="true">
                {s.glyph}
              </span>

              <span className={styles.stageState}>{s.state}</span>
              <h3 className={styles.stageTitle}>{s.title}</h3>
              <p className={styles.stageDesc}>{s.desc}</p>

              <span className={styles.stageQuestion} aria-hidden="true">
                «{s.question}»
              </span>

              <span className={styles.heatBar} aria-hidden="true">
                <span className={styles.heatFill} />
              </span>
            </li>
          ))}
        </ol>

        {/* ناودانِ خروجی — بلورِ آماده از کوره به میزِ آزمایشگاه می‌رود.
            نیمه‌ی دومِ این مسیر در بخشِ آزمایشگاه ادامه پیدا می‌کند. */}
        <div className={styles.outflow} aria-hidden="true">
          <span className={styles.outflowRail} />
          <span className={styles.outflowDrop} />
          <span className={styles.outflowLabel}>خروجی</span>
        </div>
      </div>
    </section>
  );
}
