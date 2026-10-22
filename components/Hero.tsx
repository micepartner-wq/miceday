import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from './ui/Container';
import { useReducedMotion } from '../src/utils/useReducedMotion';

export const Hero: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const saveData = typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const showVideo = !reducedMotion && !saveData && !videoFailed;
  const openPageAtTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section-for-header relative isolate flex min-h-screen min-h-[100svh] w-full items-center overflow-hidden bg-slate-900 pb-20 pt-28 sm:pb-24 sm:pt-32"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img src="/hero-poster.jpg" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        >
          <source src="/hero-bg-optimized.mp4" type="video/mp4" onError={() => setVideoFailed(true)} />
        </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/70 to-slate-950/85" />
      </div>

      <Container className="w-full">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <p className="max-w-3xl break-keep text-sm font-normal leading-relaxed text-slate-300 sm:text-base md:text-lg">
            행사 준비, 어디서부터 시작할지 막막하신가요?
          </p>
          <p className="mb-8 mt-3 max-w-3xl break-keep text-sm font-normal leading-loose text-slate-200 sm:mb-10 sm:mt-3 sm:text-base md:text-lg">
            장소 섭외부터 음향·케이터링·현장 운영까지 한 번에.
          </p>

          <h1
            id="hero-heading"
            className="break-keep text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.3] tracking-tight text-white"
          >
            <span className="inline-block">행사의 모든 것,</span>{' '}
            <span className="inline-block text-[#65d477]">행사어때</span>
          </h1>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/contact"
              onClick={openPageAtTop}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#278337] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#216f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900"
            >
              행사 상담하기
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};
