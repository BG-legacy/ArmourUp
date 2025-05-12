/**
 * @file ScrollReveal component for ArmourUp
 * @description A reusable component that animates elements as they come into view.
 * Uses Framer Motion for smooth scroll-based animations with configurable directions and timing.
 */

"use client";

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Props interface for the ScrollReveal component
 * @interface ScrollRevealProps
 * @property {ReactNode} children - The content to be animated
 * @property {("fit-content" | "100%")} [width="fit-content"] - Width of the container
 * @property {number} [delay=0] - Animation delay in seconds
 * @property {('up' | 'down' | 'left' | 'right' | 'none')} [direction='up'] - Direction of the reveal animation
 * @property {string} [className=""] - Additional CSS classes
 * @property {boolean} [once=true] - Whether the animation should only play once
 */
interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  once?: boolean;
}

/**
 * ScrollReveal component that animates content as it enters the viewport
 * @component
 * @param {ScrollRevealProps} props - Component props
 * @returns {JSX.Element} The animated content wrapper
 */
export default function ScrollReveal({
  children,
  width = "fit-content",
  delay = 0,
  direction = 'up',
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px 0px" });

  /**
   * Generates initial and animate properties based on the specified direction
   * @returns {Object} Object containing initial and animate properties for the motion component
   */
  const getInitialAndAnimate = () => {
    switch (direction) {
      case 'up':
        return {
          initial: { opacity: 0, y: 30 },
          animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
        };
      case 'down':
        return {
          initial: { opacity: 0, y: -30 },
          animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }
        };
      case 'left':
        return {
          initial: { opacity: 0, x: 30 },
          animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
        };
      case 'right':
        return {
          initial: { opacity: 0, x: -30 },
          animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
        };
      case 'none':
        return {
          initial: { opacity: 0 },
          animate: isInView ? { opacity: 1 } : { opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 0, y: 30 },
          animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
        };
    }
  };

  const { initial, animate } = getInitialAndAnimate();

  return (
    <div ref={ref} className={className} style={{ width }}>
      <motion.div
        initial={initial}
        animate={animate}
        transition={{ duration: 0.5, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
} 