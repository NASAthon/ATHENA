"use client";

// Bedside-monitor style waveform for the Live Monitor (heart rate → ECG-style trace, SpO₂ → pulse
// wave, blood pressure → arterial wave, breathing → breathing wave, skin temperature → steady line). A write head sweeps left to right in real time and erases just
// ahead of itself, like a hospital monitor.
//
// ILLUSTRATIVE ONLY: the shape is generated from the live RATE (beats or breaths per minute) of the
// simulated sensor feed. It is not a recorded ECG, and ATHENA never reads or diagnoses waveforms
// (docs/DECISIONS.md › Always-On Live Monitoring, No Medicines or Diagnoses). The numbers beside it
// are the values ATHENA evaluates.
//
// Accessibility: decorative (aria-hidden; the value and state are shown as text). With "reduce
// motion" it draws one still trace instead of moving (docs/DECISIONS.md › Inclusive Design).

import { useEffect, useRef } from "react";

const SWEEP_SECONDS = 4; // one sweep across the strip, like a monitor at standard speed
const GAP = 10; // px erased ahead of the write head

const g = (x, mu, sigma, a) => a * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));

/** Signal value (about -0.4 to 1) at a phase 0–1 within one beat or breath. */
const SHAPES = {
  // P wave, Q dip, R spike, S dip, T wave.
  ecg: (p) => g(p, 0.12, 0.025, 0.12) + g(p, 0.27, 0.008, -0.14) + g(p, 0.3, 0.01, 1) + g(p, 0.33, 0.01, -0.3) + g(p, 0.56, 0.05, 0.28),
  // Quick rise, slower fall, small second bump (dicrotic notch).
  pleth: (p) => g(p, 0.2, 0.07, 0.95) + g(p, 0.45, 0.07, 0.35),
  // Smooth in and out.
  resp: (p) => 0.5 - 0.5 * Math.cos(2 * Math.PI * p),
  // Arterial pressure: steep upstroke, notch, then run-off (like an arterial line on a monitor).
  arterial: (p) => g(p, 0.16, 0.05, 0.9) + g(p, 0.4, 0.06, 0.38) - g(p, 0.3, 0.02, 0.06),
  // No beat (e.g. skin temperature): a steady live line with a slow, gentle wave.
  level: (p) => 0.45 + 0.06 * Math.sin(2 * Math.PI * p),
};

/**
 * @param {{ kind: "ecg" | "pleth" | "arterial" | "resp" | "level", rate: number | null, colour: string }} props
 *   `rate` per minute; null = no signal (flat line).
 */
export default function LiveWaveform({ kind, rate, colour }) {
  const canvasRef = useRef(null);
  const live = useRef({ rate, colour });

  // Latest rate and colour, read by the animation loop without restarting it.
  useEffect(() => {
    live.current = { rate, colour };
  }, [rate, colour]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const shape = SHAPES[kind] ?? SHAPES.ecg;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let x = 0; // write-head position, px
    let phase = 0; // position within the current beat or breath
    let lastY = null;
    let lastTime = 0;

    const resolveColour = (c) => {
      const m = /^var\((--[^)]+)\)$/.exec(c ?? "");
      return m ? getComputedStyle(canvas).getPropertyValue(m[1]).trim() || "#6fb7ff" : c || "#6fb7ff";
    };
    const yFor = (v) => height * 0.85 - v * height * 0.7;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      x = 0;
      lastY = null;
      if (reduceMotion) drawStill();
    };

    // Reduced motion: one still strip of the trace at the current rate.
    const drawStill = () => {
      const { rate: r, colour: c } = live.current;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = resolveColour(c);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 1) {
        const p = r ? (((px / width) * SWEEP_SECONDS * r) / 60) % 1 : 0;
        const y = yFor(r ? shape(p) : 0);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    };

    const step = (time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 0;
      lastTime = time;
      const { rate: r, colour: c } = live.current;
      const pxPerSecond = width / SWEEP_SECONDS;
      const steps = Math.max(1, Math.round(dt * pxPerSecond));
      ctx.strokeStyle = resolveColour(c);
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      for (let i = 0; i < steps; i += 1) {
        const nextX = x + dt * pxPerSecond / steps;
        phase = r ? (phase + (dt / steps) * (r / 60)) % 1 : 0;
        const y = yFor(r ? shape(phase) : 0);
        if (nextX >= width) {
          // Wrap to the left edge.
          x = 0;
          lastY = null;
          continue;
        }
        ctx.clearRect(nextX, 0, GAP, height); // erase just ahead of the head
        if (lastY !== null) {
          ctx.beginPath();
          ctx.moveTo(x, lastY);
          ctx.lineTo(nextX, y);
          ctx.stroke();
        }
        x = nextX;
        lastY = y;
      }
      frame = requestAnimationFrame(step);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduceMotion) frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [kind]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-12 w-full rounded-md bg-black/40" />
      {!rate && (
        <span className="pointer-events-none absolute top-0.5 right-1.5 text-[10px] uppercase tracking-wider text-muted-foreground" aria-hidden="true">
          no signal
        </span>
      )}
    </div>
  );
}
