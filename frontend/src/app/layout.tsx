/**
 * @file Root layout component for the ArmourUp application
 * @description This is the main layout wrapper that provides the base structure for all pages,
 * including font configuration, metadata, and authentication context.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

/**
 * Configure Inter font with specific settings
 * @constant
 * @type {Object}
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Application metadata configuration
 * @constant
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "ArmourUp - Put on the Full Armor of God",
  description: "ArmourUp helps you strengthen your faith and stand firm against life's challenges through scripture, prayer, and community.",
};

/**
 * Root layout component that wraps all pages
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {JSX.Element} The root layout structure with authentication context
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <main className="flex-grow">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
