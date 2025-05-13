/**
 * @file Hero component for ArmorUp
 * @description A hero section featuring a two-column layout with animated text content
 * and an interactive image display. Uses Framer Motion for smooth animations.
 */

"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * Hero section component with animated content and interactive elements
 * @component
 * @returns {JSX.Element} The hero section with animated content and call-to-action
 */
const Hero = () => {
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column - Animated text content with call-to-action */}
        <motion.div 
          className="flex flex-col space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide">
            Put on the Full Armor of God
          </h1>
          <p className="text-lg md:text-xl text-gray-600 tracking-wide">
            Stand firm against life's challenges through scripture, prayer, and community. 
            ArmorUp helps you strengthen your faith daily.
          </p>
          <div>
            <motion.button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
        
        {/* Right column - Interactive image display with animated background */}
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md h-80 md:h-96 group">
            {/* Animated yellow circle background with continuous pulse effect */}
            <motion.div 
              className="absolute w-72 h-72 bg-yellow-400 rounded-full -z-10"
              animate={{ scale: [0.9, 0.95, 0.9] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            ></motion.div>
            
            {/* Image container with fade-in and hover animations */}
            <motion.div 
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <Image 
                src="/images/armor-silhouette.svg" 
                alt="Armor of God" 
                fill
                style={{ objectFit: 'contain' }}
                className="shadow-lg"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 