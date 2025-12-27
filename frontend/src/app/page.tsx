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
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [taglineText, setTaglineText] = useState('');
  const [showTaglineCursor, setShowTaglineCursor] = useState(false);

  useEffect(() => {
    // Typewriter animation to form "ARMOR UP"
    const fullText = 'ARMOR UP';
    let index = 0;
    
    const startTaglineTyping = () => {
      const tagline = 'Biblical Strength for Life\'s Battles';
      let taglineIndex = 0;
      
      const taglineInterval = setInterval(() => {
        if (taglineIndex < tagline.length) {
          setTaglineText(tagline.slice(0, taglineIndex + 1));
          taglineIndex++;
        } else {
          clearInterval(taglineInterval);
          // Hide tagline cursor after typing is complete
          setTimeout(() => setShowTaglineCursor(false), 500);
        }
      }, 100);
    };
    
    const typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterInterval);
        // Hide cursor after typing is complete
        setTimeout(() => {
          setShowCursor(false);
          // Start tagline typing after main title is done
          setShowTaglineCursor(true);
          startTaglineTyping();
        }, 500);
      }
    }, 150);

    return () => {
      clearInterval(typewriterInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="animated-orb orb-1"></div>
        <div className="animated-orb orb-2"></div>
        <div className="animated-orb orb-3"></div>
        
        {/* Animated grid pattern */}
        <div className="animated-grid"></div>
        
        {/* Floating particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Scanline effect overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <main className="flex flex-col items-center justify-center space-y-12 text-center">
          {/* Title with typewriter animation */}
          <h1 
            className="armor-up-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider"
            style={{ 
              fontFamily: 'var(--font-orbitron)', 
              color: '#f97316',
              textShadow: '0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(249, 115, 22, 0.3)',
            }}
          >
            {displayText}
            {showCursor && <span className="blinking-cursor">|</span>}
          </h1>

          {/* Tagline with typewriter animation */}
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-light tracking-[0.3em] uppercase"
            style={{ 
              color: '#d1d5db', 
              fontFamily: 'var(--font-inter)',
              minHeight: '2.5rem'
            }}
          >
            {taglineText}
            {showTaglineCursor && <span className="blinking-cursor">|</span>}
          </p>

          {/* CTA Button */}
          <Link 
            href="/register"
            className="px-8 py-4 bg-[#f97316] text-black text-sm font-medium tracking-wider uppercase rounded-sm hover:bg-[#ea580c] transition-all border-2 border-[#f97316] hover:border-[#ea580c] shadow-lg hover:shadow-[#f97316]/50 tactical-button"
          >
            GET STARTED
          </Link>
        </main>
      </div>

      {/* Enhanced ARMOR UP styles */}
      <style jsx>{`
        .armor-up-headline {
          letter-spacing: 0.15em;
          animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 
              0 0 10px rgba(249, 115, 22, 0.5),
              0 0 20px rgba(249, 115, 22, 0.3),
              0 0 30px rgba(249, 115, 22, 0.2);
          }
          to {
            text-shadow: 
              0 0 20px rgba(249, 115, 22, 0.8),
              0 0 40px rgba(249, 115, 22, 0.5),
              0 0 60px rgba(249, 115, 22, 0.3);
          }
        }

        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .tactical-button {
          position: relative;
          overflow: hidden;
        }

        .tactical-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .tactical-button:hover::before {
          left: 100%;
        }

        /* Animated Gradient Orbs */
        .animated-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        /* Animated Grid */
        .animated-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          opacity: 0.5;
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        /* Floating Particles */
        .particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(249, 115, 22, 0.6);
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(249, 115, 22, 0.8);
          animation: particleFloat 15s ease-in-out infinite;
        }

        .particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 12s; }
        .particle:nth-child(2) { left: 30%; top: 10%; animation-delay: 1s; animation-duration: 18s; }
        .particle:nth-child(3) { left: 50%; top: 30%; animation-delay: 2s; animation-duration: 15s; }
        .particle:nth-child(4) { left: 70%; top: 15%; animation-delay: 0.5s; animation-duration: 20s; }
        .particle:nth-child(5) { left: 20%; top: 60%; animation-delay: 1.5s; animation-duration: 14s; }
        .particle:nth-child(6) { left: 80%; top: 50%; animation-delay: 2.5s; animation-duration: 16s; }
        .particle:nth-child(7) { left: 15%; top: 80%; animation-delay: 0.8s; animation-duration: 19s; }
        .particle:nth-child(8) { left: 60%; top: 70%; animation-delay: 1.2s; animation-duration: 13s; }
        .particle:nth-child(9) { left: 40%; top: 90%; animation-delay: 2.2s; animation-duration: 17s; }
        .particle:nth-child(10) { left: 90%; top: 25%; animation-delay: 0.3s; animation-duration: 21s; }
        .particle:nth-child(11) { left: 5%; top: 40%; animation-delay: 1.8s; animation-duration: 14s; }
        .particle:nth-child(12) { left: 85%; top: 75%; animation-delay: 0.7s; animation-duration: 18s; }
        .particle:nth-child(13) { left: 25%; top: 5%; animation-delay: 2.3s; animation-duration: 16s; }
        .particle:nth-child(14) { left: 55%; top: 55%; animation-delay: 1.1s; animation-duration: 15s; }
        .particle:nth-child(15) { left: 75%; top: 85%; animation-delay: 0.6s; animation-duration: 20s; }
        .particle:nth-child(16) { left: 35%; top: 45%; animation-delay: 1.9s; animation-duration: 13s; }
        .particle:nth-child(17) { left: 65%; top: 35%; animation-delay: 0.4s; animation-duration: 17s; }
        .particle:nth-child(18) { left: 45%; top: 65%; animation-delay: 2.1s; animation-duration: 19s; }
        .particle:nth-child(19) { left: 95%; top: 60%; animation-delay: 1.4s; animation-duration: 14s; }
        .particle:nth-child(20) { left: 12%; top: 35%; animation-delay: 0.9s; animation-duration: 16s; }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translate(30px, -40px) scale(1.3) rotate(90deg);
            opacity: 0.7;
          }
          50% {
            transform: translate(-20px, 30px) scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          75% {
            transform: translate(40px, 20px) scale(1.2) rotate(270deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

