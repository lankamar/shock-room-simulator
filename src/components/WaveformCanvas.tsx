import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  param: 'ECG' | 'SpO2' | 'RESP' | 'EtCO2';
  color: string;
  speed: number;
  isRunning: boolean;
  value?: number;
}

function gauss(x: number, c: number, w: number, a: number): number {
  return a * Math.exp(-Math.pow((x - c) / w, 2));
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function WaveformCanvas({ param, color, speed, isRunning, value }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ x: 0, lastX: 0, lastY: 0, timePassed: 0, rng: 12345 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let animId: number;
    let lastTs = performance.now();
    const centerY = canvas.height / 2;
    stateRef.current.lastY = centerY;

    const draw = (ts: number) => {
      const delta = ts - lastTs;
      lastTs = ts;

      if (isRunning) {
        const st = stateRef.current;
        st.timePassed += delta;
        st.rng += 0.07;
        const tMs = st.timePassed;
        const pxPerSec = speed * 2;
        const step = (pxPerSec * delta) / 1000;

        let newX = st.x + step;
        let wrap = false;
        if (newX > canvas.width) { newX = 0; wrap = true; }

        let yOff = 0;
        const rate = value || 60;

        if (param === 'ECG') {
          const beatMs = 60000 / rate;
          const phase = (tMs % beatMs) / beatMs;
          const amp = 1 + Math.sin(tMs / 3000 + st.rng) * 0.06;
          const p  = gauss(phase, 0.14, 0.028, -12 * amp);
          const q  = gauss(phase, 0.235, 0.012, 3);
          const r  = gauss(phase, 0.265, 0.022, -42 * amp);
          const s  = gauss(phase, 0.295, 0.016, 7);
          const t  = gauss(phase, 0.52, 0.075, -10 * amp);
          const noise  = Math.sin(tMs / 83) * 0.8 + Math.sin(tMs / 137) * 0.6;
          const wander = Math.sin(tMs / 3000) * 2 + Math.sin(tMs / 7000) * 1.5;
          yOff = p + q + r + s + t + noise + wander;

        } else if (param === 'SpO2') {
          const beatMs = 60000 / rate;
          const phase = (tMs % beatMs) / beatMs;
          const amp = 1 + Math.sin(tMs / 4000) * 0.04;
          if (phase < 0.35) {
            yOff = -32 * amp * smoothstep(0, 0.35, phase);
          } else if (phase < 0.5) {
            yOff = -32 * amp + 3 * amp * ((phase - 0.35) / 0.15);
          } else {
            yOff = -29 * amp * Math.exp(-(phase - 0.5) / 0.18);
          }
          yOff += gauss(phase, 0.42, 0.025, 6);
          yOff += Math.sin(tMs / 2000) * 0.5;

        } else if (param === 'RESP') {
          const brMs = 60000 / rate;
          const phase = (tMs % brMs) / brMs;
          const amp = 1 + Math.sin(tMs / 5000) * 0.03;
          yOff = -22 * amp * Math.sin(smoothstep(0, 1, phase) * Math.PI);
          yOff += Math.sin(tMs / 3000) * 0.5 + Math.sin(tMs / 97) * 0.4;

        } else if (param === 'EtCO2') {
          const brMs = 60000 / rate;
          const phase = (tMs % brMs) / brMs;
          if (phase < 0.04) {
            yOff = 0;
          } else if (phase < 0.18) {
            yOff = -28 * smoothstep(0.04, 0.18, phase);
          } else if (phase < 0.65) {
            yOff = -28 - 2 * ((phase - 0.18) / 0.47);
          } else if (phase < 0.75) {
            const t = 1 - smoothstep(0.65, 0.75, phase);
            yOff = (-30 + 2 * ((phase - 0.18) / 0.47)) * t;
          } else {
            yOff = 0;
          }
          yOff += Math.sin(tMs / 1500) * 0.3;
        }

        const newY = centerY + yOff;

        ctx.clearRect(newX, 0, Math.ceil(step) + 2, canvas.height);

        if (!wrap && st.lastY !== centerY) {
          ctx.beginPath();
          ctx.moveTo(st.lastX, st.lastY);
          ctx.lineTo(newX, newY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          if (param === 'ECG') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        st.x = newX;
        st.lastX = newX;
        st.lastY = newY;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, param, color, speed, value]);

  return (
    <div className="relative w-full flex-1 bg-[#05050a] rounded flex items-center overflow-hidden border border-zinc-800">
      <span className="absolute top-1 left-2 text-xs font-bold font-mono z-10" style={{ color }}>{param}</span>
      <canvas ref={canvasRef} width={1000} height={140} className="w-full h-full block" />
    </div>
  );
}
