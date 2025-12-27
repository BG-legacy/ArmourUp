"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email: string;
  password: string;
  general: string;
}

export default function Login() {
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    general: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors: FormErrors = { email: "", password: "", general: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error when user types
    if (name in errors) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use AuthContext login
      await login(formData.email, formData.password);
      
      // If remember me is checked, we could set a longer expiry
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      // No need to redirect here as the AuthContext will handle that
    } catch (error: unknown) {
      console.error("Login error:", error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden" style={{ width: '100vw', height: '100vh', minHeight: '100vh', minHeight: '100dvh' }}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ width: '100%', height: '100%' }}>
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
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.03] z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
          width: '100%',
          height: '100%'
        }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-6 sm:p-4 overflow-y-auto" style={{ width: '100%', height: '100%' }}>
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-black/40 backdrop-blur-md border border-[#f97316]/30 rounded-sm shadow-lg my-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-orbitron)', color: '#f97316', letterSpacing: '0.05em' }}>
              Welcome Back
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#d1d5db', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              &ldquo;Be strong in the Lord and in his mighty power.&rdquo; — Ephesians 6:10
            </p>
          </div>

          {errors.general && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 backdrop-blur-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-400">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#d1d5db', fontFamily: 'var(--font-orbitron)', letterSpacing: '0.05em' }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/10 border border-[#f97316]/30 text-white rounded-sm shadow-sm focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 backdrop-blur-sm placeholder:text-gray-400"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#d1d5db', fontFamily: 'var(--font-orbitron)', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/10 border border-[#f97316]/30 text-white rounded-sm shadow-sm focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 backdrop-blur-sm placeholder:text-gray-400"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 border-[#f97316]/30 focus:ring-[#f97316] rounded bg-white/10 text-[#f97316]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: '#d1d5db', fontFamily: 'var(--font-inter)' }}>
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full flex justify-center py-2 px-4 bg-gray-100 text-gray-800 text-sm font-medium tracking-wider uppercase rounded-sm hover:bg-gray-200 transition-colors border border-gray-300 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-orbitron)', letterSpacing: '0.1em' }}
              >
                {isLoading || authLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm" style={{ color: '#d1d5db', fontFamily: 'var(--font-inter)' }}>
              Don't have an account?{" "}
              <Link href="/register" className="font-medium hover:text-[#f97316] transition-colors" style={{ color: '#f97316' }}>
                Join our community
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced styles matching landing page */}
      <style jsx>{`
        /* Animated Gradient Orbs */
        .animated-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: min(500px, 80vw);
          height: min(500px, 80vw);
          background: radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, transparent 70%);
          top: -20%;
          left: -20%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: min(400px, 70vw);
          height: min(400px, 70vw);
          background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
          bottom: -15%;
          right: -15%;
          animation-delay: -7s;
        }

        .orb-3 {
          width: min(350px, 60vw);
          height: min(350px, 60vw);
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
          width: 100%;
          height: 100%;
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
          width: 100%;
          height: 100%;
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