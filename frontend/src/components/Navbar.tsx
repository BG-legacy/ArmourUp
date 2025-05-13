/**
 * @file Navigation bar component for ArmorUp
 * @description A responsive navigation bar with scroll-based animations and interactive hover effects.
 * Uses Framer Motion for smooth animations and transitions.
 */

"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Navigation bar component with scroll-based animations
 * @component
 * @returns {JSX.Element} The animated navigation bar
 */
const Navbar = () => {
  // State to track scroll position
  const [scrolled, setScrolled] = useState(false);
  
  // Framer Motion scroll hooks for dynamic animations
  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const navbarHeight = useTransform(scrollY, [0, 50], ['6rem', '4rem']);
  const navbarShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 2px 4px rgba(0,0,0,0.01)', '0 4px 8px rgba(0,0,0,0.05)']
  );

  /**
   * Effect hook for handling scroll events
   * Updates the scrolled state based on window scroll position
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.nav 
      className={`w-full py-6 px-8 bg-white sticky top-0 z-10 ${scrolled ? 'border-b border-gray-100' : ''}`}
      style={{ 
        opacity: navbarOpacity,
        height: navbarHeight,
        boxShadow: navbarShadow
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-center">
        <ul className="flex space-x-16 text-lg font-semibold tracking-wide">
          {/* Navigation links with hover and tap animations */}
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              HOME
            </Link>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/encourage" className="hover:text-blue-600 transition-colors">
              ENCOURAGE
            </Link>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/history" className="hover:text-blue-600 transition-colors">
              HISTORY
            </Link>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              ABOUT
            </Link>
          </motion.li>
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navbar; 