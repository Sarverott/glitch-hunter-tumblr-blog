/**
 * AnimeGlitchHud.tsx
 * "Fancy with anime.js"
 * High-tech cybernetic HUD with animated coordinate radar, scrambling telemetry counters,
 * audio waveform monitor, and scanning pulse lines.
 */

import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Activity, Radio, Compass, ShieldAlert, Cpu } from 'lucide-react';

interface AnimeGlitchHudProps {
  detectedAnomaliesCount?: number;
  lastScannedVenue?: string;
  isProcessing?: boolean;
}

export const AnimeGlitchHud: React.FC<AnimeGlitchHudProps> = ({
  detectedAnomaliesCount = 42,
  lastScannedVenue = "McDonald's Drive-Thru #4412",
  isProcessing = false,
}) => {
  const radarNeedleRef = useRef<SVGSVGElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const waveBarsRef = useRef<HTMLDivElement>(null);
  const statusGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Radar Needle Rotation Animation
    if (radarNeedleRef.current) {
      animate(radarNeedleRef.current, {
        rotate: 360,
        duration: 4000,
        ease: 'linear',
        loop: true,
      });
    }

    // 2. Audio/Signal Waveform Bar Pulsing
    if (waveBarsRef.current) {
      const bars = waveBarsRef.current.querySelectorAll('.hud-wave-bar');
      animate(bars, {
        height: [6, 28],
        duration: 450,
        alternate: true,
        ease: 'inOutSine',
        loop: true,
        delay: stagger(60),
      });
    }

    // 3. Telemetry Counter Scramble Animation
    if (counterRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: detectedAnomaliesCount,
        ease: 'outExpo',
        duration: 2000,
        onRender: () => {
          if (counterRef.current) {
            counterRef.current.innerText = Math.round(obj.val).toString().padStart(4, '0');
          }
        },
      });
    }

    // 4. Status Pulse Glow
    if (statusGlowRef.current) {
      animate(statusGlowRef.current, {
        opacity: [0.3, 1],
        scale: [0.96, 1.04],
        duration: 1200,
        alternate: true,
        loop: true,
        ease: 'inOutQuad',
      });
    }
  }, [detectedAnomaliesCount]);

  return (
    <div className="rounded-md border border-emerald-500/30 bg-black/90 p-4 font-mono shadow-[0_0_20px_rgba(0,255,102,0.1)] relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute top-0 right-0 p-2 text-[10px] text-emerald-500/40 select-none">
        HUD // ANIME.JS CORE
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Radar Scanner */}
        <div className="flex items-center gap-3 border-r border-emerald-500/20 pr-4">
          <div className="relative w-14 h-14 rounded-full border border-emerald-500/50 bg-emerald-950/40 flex items-center justify-center overflow-hidden">
            {/* Concentric rings */}
            <div className="absolute inset-2 rounded-full border border-emerald-500/30" />
            <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            </div>

            {/* Rotating radar sweep */}
            <svg
              ref={radarNeedleRef}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="radarSweep" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00ff66" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00ff66" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="50" y1="50" x2="50" y2="0" stroke="#00ff66" strokeWidth="2" />
              <polygon points="50,50 50,0 80,10" fill="url(#radarSweep)" opacity="0.3" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              PUBLIC SENSORS
            </div>
            <div className="text-xs text-emerald-300 font-bold tracking-wider">SWEEP: ONLINE</div>
            <div className="text-[10px] text-zinc-500">RADIUS: 15.4 KM</div>
          </div>
        </div>

        {/* Anomaly Counter Scramble */}
        <div className="border-r border-emerald-500/20 pr-4">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            LOGGED BREAKOUTS
          </div>
          <div className="flex items-baseline gap-2">
            <span
              ref={counterRef}
              className="text-2xl font-extrabold text-emerald-400 tracking-widest text-shadow-[0_0_10px_#00ff66]"
            >
              0000
            </span>
            <span className="text-[11px] text-emerald-500/80">CONFIRMED</span>
          </div>
          <div className="text-[10px] text-zinc-500 truncate">TARGET: {lastScannedVenue}</div>
        </div>

        {/* Waveform Telemetry Visualizer */}
        <div className="border-r border-emerald-500/20 pr-4">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            SIGNAL SPECTROGRAM
          </div>
          <div
            ref={waveBarsRef}
            className="flex items-end gap-1 h-8 bg-black/60 px-2 py-1 rounded border border-emerald-500/20"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="hud-wave-bar w-1.5 bg-gradient-to-t from-emerald-600 via-emerald-400 to-cyan-300 rounded-xs"
                style={{ height: `${8 + (i % 5) * 4}px` }}
              />
            ))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
            <span>MIC / VRAM STREAM</span>
            <span>60.4 dB</span>
          </div>
        </div>

        {/* System Daemon Status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              FORENSIC ENGINE
            </div>
            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5">
              <span
                ref={statusGlowRef}
                className={`w-2 h-2 rounded-full ${
                  isProcessing ? 'bg-amber-400 shadow-[0_0_8px_#ffb000]' : 'bg-emerald-400 shadow-[0_0_8px_#00ff66]'
                }`}
              />
              <span>{isProcessing ? 'THINKING_ACTIVE...' : 'STANDBY // ARMED'}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">GEMINI 3.1 PRO FORENSICS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
