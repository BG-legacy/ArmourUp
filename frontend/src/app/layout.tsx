/**
 * @file Root layout component for the ArmorUp application
 * @description This is the main layout wrapper that provides the base structure for all pages,
 * including font configuration, metadata, and authentication context.
 */

import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
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
 * Configure Orbitron font for tactical/tech aesthetic
 * @constant
 * @type {Object}
 */
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

/**
 * Application metadata configuration
 * @constant
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "ArmorUp - Put on the Full Armor of God",
  description: "ArmorUp helps you strengthen your faith and stand firm against life's challenges through scripture, prayer, and community.",
  other: {
    'font-cargo': 'https://fonts.cdnfonts.com/css/cargo',
  },
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
    <html lang="en" className="scroll-smooth bg-black">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <link
          href="https://fonts.cdnfonts.com/css/cargo"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased min-h-screen min-h-[100dvh] flex flex-col bg-black`}>
        <AuthProvider>
          <main className="flex-grow">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
