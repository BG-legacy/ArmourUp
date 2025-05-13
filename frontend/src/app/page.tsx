/**
 * @file Landing page component for ArmorUp
 * @description The main landing page featuring an animated hero section with text reveal effects,
 * background image, and a call-to-action button.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Landing page component with animated text reveal and interactive elements
 * @component
 * @returns {JSX.Element} The landing page with animated content
 */
export default function LandingPage() {
  // State for controlling animation visibility and text reveal
  const [visible, setVisible] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  
  // Static content
  const title = "ArmorUp";
  const subtitle = "Put on the Full Armor of God";

  /**
   * Effect hook for handling text reveal animation
   * Triggers on component mount and manages character-by-character reveal
   */
  useEffect(() => {
    setVisible(true);
    
    // Text reveal animation with interval
    const interval = setInterval(() => {
      setCharIndex(prev => {
        if (prev < title.length + subtitle.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image with leather texture */}
      <Image
        src="/images/black leather texture.jpeg"
        alt="Leather texture background"
        fill
        className="object-cover"
        priority
      />
      
      {/* Main content overlay with semi-transparent background */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-black/40">
        {/* Animated title with character reveal effect */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-center relative">
          {title.split('').map((char, index) => (
            <span 
              key={index}
              className={`inline-block transition-all duration-700 transform`}
              style={{ 
                color: charIndex > index ? '#DAA520' : 'transparent',
                textShadow: charIndex > index ? '0 0 20px rgba(218, 165, 32, 0.8), 0 0 30px rgba(218, 165, 32, 0.4)' : 'none',
                transform: charIndex > index ? 'translateY(0) rotate(0deg)' : 'translateY(-50px) rotate(20deg)',
                opacity: charIndex > index ? 1 : 0,
                filter: charIndex > index ? 'blur(0px)' : 'blur(10px)',
                transitionDelay: `${index * 120}ms`,
                WebkitBackgroundClip: 'text',
                position: 'relative',
                fontWeight: 900,
                letterSpacing: '2px'
              }}
            >
              {char}
              {/* Glowing underline effect for revealed characters */}
              {charIndex > index && (
                <span 
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                  style={{
                    animation: 'glow 2s infinite',
                    opacity: 0.7
                  }}
                ></span>
              )}
            </span>
          ))}
        </h1>
        
        {/* Animated subtitle with word-by-word reveal */}
        <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl px-4">
          {subtitle.split(' ').map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-2">
              {word.split('').map((char, charIdx) => (
                <span
                  key={charIdx}
                  className="inline-block"
                  style={{
                    color: charIndex > title.length + wordIndex * 2 + charIdx ? '#FFD700' : 'transparent',
                    textShadow: charIndex > title.length + wordIndex * 2 + charIdx ? '0 0 15px rgba(255, 215, 0, 0.7), 0 0 25px rgba(255, 215, 0, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                    transform: charIndex > title.length + wordIndex * 2 + charIdx ? 'translateY(0)' : 'translateY(20px)',
                    opacity: charIndex > title.length + wordIndex * 2 + charIdx ? 1 : 0,
                    display: 'inline-block',
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </p>
        
        {/* Call-to-action button with hover effects and animations */}
        <div 
          className={`transition-all duration-1000 delay-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          style={{
            animation: visible ? 'float 3s ease-in-out infinite' : 'none'
          }}
        >
          <Link 
            href="/login" 
            className="px-8 py-4 text-xl font-semibold rounded-lg relative overflow-hidden group
                     transition-all duration-300 transform hover:scale-105
                     shadow-lg hover:shadow-2xl"
            style={{ 
              background: 'transparent',
              border: '2px solid #DAA520',
              boxShadow: '0 0 20px rgba(218, 165, 32, 0.4)'
            }}
          >
            <span 
              className="relative z-10 group-hover:text-white transition-colors duration-300"
              style={{ color: '#DAA520' }}
            >
              Start Your Journey
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
          </Link>
        </div>

        {/* CSS animations for glowing and floating effects */}
        <style jsx>{`
          @keyframes glow {
            0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
            50% { opacity: 0.8; transform: scaleX(1.2); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
} 