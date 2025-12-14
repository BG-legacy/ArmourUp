/**
 * @file Landing page component for ArmourUp
 * @description Modern landing page with dark aesthetic, inspired by tech/design agency style
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Landing page component with modern tech aesthetic
 * @component
 * @returns {JSX.Element} The landing page with dark theme and animated content
 */
export default function LandingPage() {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    // Random glitch effect
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Textured dark background with noise effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.02) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 50%), #000000',
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Navigation */}
        <header className="w-full px-8 md:px-16 py-8 flex items-center justify-between">
          {/* Left - Navigation item with corner bracket */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm tracking-wider">┌</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm tracking-wider transition-colors">
              PLANS
            </Link>
          </div>

          {/* Center - Logo */}
          <div className="flex flex-col items-center">
            <h1 className="text-white font-bold text-2xl md:text-3xl tracking-tight" style={{ fontFamily: 'sans-serif', letterSpacing: '0.1em' }}>
              ARMOURUP
            </h1>
            <p className="text-gray-400 text-xs md:text-sm tracking-widest mt-1">
              SPIRITUAL ARMOR
            </p>
          </div>

          {/* Right - Menu with corner bracket */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm tracking-wider transition-colors">
              MENU
            </Link>
            <span className="text-gray-400 text-sm tracking-wider">┘</span>
          </div>
        </header>

        {/* Main Content - Centered */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 pb-20">
          {/* Large Headline with multi-color text */}
          <div className={`text-center mb-8 relative ${glitchActive ? 'glitch' : ''}`}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4 relative z-10">
              <span className="text-[#a0aec0] block">STREAMLINED</span>
              <span className="text-[#f97316] block mt-2">ARMOR</span>
              <span className="text-[#a0aec0] block mt-2">SPIRITUAL</span>
            </h2>
          </div>
          
          {/* Scanline effect overlay */}
          <div 
            className="fixed inset-0 pointer-events-none opacity-[0.03] z-20"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
            }}
          />

          {/* Tagline */}
          <div className="text-center mb-12 space-y-2">
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              Stand firm against life's challenges. Daily spiritual protection.
            </p>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              One simple commitment.
            </p>
          </div>

          {/* CTA Button */}
          <Link 
            href="/register"
            className="px-8 py-4 bg-gray-100 text-gray-800 text-sm font-medium tracking-wider uppercase rounded-sm hover:bg-gray-200 transition-colors border border-gray-300"
          >
            GET STARTED
          </Link>
        </main>
      </div>

      {/* Glitch animation styles */}
      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
            text-shadow: 0 0 0 transparent;
          }
          20% {
            transform: translate(-1px, 1px);
            text-shadow: -1px 1px 0 rgba(255, 0, 0, 0.3);
          }
          40% {
            transform: translate(-1px, -1px);
            text-shadow: -1px -1px 0 rgba(0, 255, 255, 0.3);
          }
          60% {
            transform: translate(1px, 1px);
            text-shadow: 1px 1px 0 rgba(255, 0, 255, 0.3);
          }
          80% {
            transform: translate(1px, -1px);
            text-shadow: 1px -1px 0 rgba(0, 255, 255, 0.3);
          }
          100% {
            transform: translate(0);
            text-shadow: 0 0 0 transparent;
          }
        }

        .glitch {
          animation: glitch 0.15s steps(2, end) infinite;
        }

        /* Scanline effect */
        @keyframes scanline {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
