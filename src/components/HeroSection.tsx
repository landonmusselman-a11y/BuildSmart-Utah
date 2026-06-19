'use client';

import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface HeroSectionProps {
  onGetRepresented: () => void;
  stats: { builders: number; communities: number; activeIncentives: number; citiesServed: number };
}

const BG_COLOR = { r: 152, g: 160, b: 134 }; // #98A086 — Sage Green

function useChromaKey(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
) {
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rafId: number;

    function processFrame() {
      if (!video || !canvas || !ctx) return;
      if (video.readyState < 2) { rafId = requestAnimationFrame(processFrame); return; }

      canvas.width  = video.videoWidth  || 1280;
      canvas.height = video.videoHeight || 720;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = frame.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Background detection: green channel dominant, muted saturation
        // Clay house: warm (red > blue, low green dominance)
        const isGreenDominant = g > r && g > b;
        const greenExcess     = g - Math.max(r, b);
        const isMuted         = Math.max(r, g, b) - Math.min(r, g, b) < 80;

        if (isGreenDominant && greenExcess > 8 && isMuted) {
          // Blend toward target bg — soft edge by mixing based on confidence
          const confidence = Math.min(greenExcess / 40, 1);
          d[i]     = Math.round(r + (BG_COLOR.r - r) * confidence);
          d[i + 1] = Math.round(g + (BG_COLOR.g - g) * confidence);
          d[i + 2] = Math.round(b + (BG_COLOR.b - b) * confidence);
        }
      }

      ctx.putImageData(frame, 0, 0);
      rafId = requestAnimationFrame(processFrame);
    }

    video.addEventListener('play', processFrame);
    if (!video.paused) processFrame();

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('play', processFrame);
    };
  }, [videoRef, canvasRef]);
}

export default function HeroSection({ onGetRepresented, stats }: HeroSectionProps) {
  void stats;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useChromaKey(videoRef, canvasRef);

  function scrollToForm() {
    document.getElementById('get-analysis')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      className="utah-hero-bg relative flex flex-col justify-end overflow-hidden px-6 sm:px-12 lg:px-20 pb-16 lg:pb-20 pt-32"
      style={{ minHeight: 'calc(100vh - 80px)' }}
    >
      {/* Clay house — full-height right panel, bleeds to edge */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[48%]">
        {/* Gradient fade: blends left edge into sage hero */}
        <div
          className="absolute inset-y-0 left-0 w-48 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #98A086 0%, transparent 100%)' }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #98A086 0%, transparent 100%)' }}
        />

        {/* Hidden video — source for chroma key */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <source src="/clay-house.mp4" type="video/mp4" />
          <source src="/clay-house.mov" type="video/quicktime" />
        </video>

        {/* Canvas — chroma-keyed output */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Content */}
      <div className="max-w-xl relative z-20">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-gold-600 flex-shrink-0" />
          <span className="text-navy-800 text-[11px] font-bold tracking-[0.22em] uppercase font-sans">
            New Construction · Utah
          </span>
        </div>

        <h1 className="font-display font-bold leading-[0.93] tracking-tight text-navy-900 mb-8">
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Utah&apos;s #1 New
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Construction
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream-50">
            Specialist.
          </span>
        </h1>

        <p className="text-navy-800 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
          I spent 8 years learning exactly how Utah builders make money — on contracts, on design
          centers, on lot premiums, on timing. Then I switched sides. Now I use everything I know
          to make sure that money stays with you.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-3 bg-gold-600 hover:bg-gold-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg"
          >
            Get My Free Builder Analysis
            <ArrowUpRight size={18} />
          </button>
          <button
            onClick={onGetRepresented}
            className="inline-flex items-center gap-2 text-navy-800 hover:text-navy-900 text-sm font-semibold transition-colors"
          >
            Schedule a specific time →
          </button>
        </div>
      </div>
    </section>
  );
}
