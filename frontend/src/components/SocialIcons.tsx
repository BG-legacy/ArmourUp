/**
 * @file SocialIcons component for ArmorUp
 * @description A component that displays social media icons with hover and tap animations.
 * Uses Framer Motion for smooth interactive effects and SVG icons for crisp rendering.
 */

"use client";

import { motion } from 'framer-motion';

/**
 * SocialIcons component that displays animated social media links
 * @component
 * @returns {JSX.Element} A row of interactive social media icons
 */
const SocialIcons = () => {
  return (
    <div className="flex justify-center space-x-8 py-8 bg-white">
      {/* Facebook social media link with hover and tap animations */}
      <motion.a 
        href="https://facebook.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      </motion.a>
      
      {/* Twitter/X social media link with hover and tap animations */}
      <motion.a 
        href="https://twitter.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      </motion.a>
      
      {/* Instagram social media link with hover and tap animations */}
      <motion.a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </motion.a>
      
      {/* YouTube social media link with hover and tap animations */}
      <motion.a 
        href="https://youtube.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      </motion.a>
    </div>
  );
};

export default SocialIcons; 