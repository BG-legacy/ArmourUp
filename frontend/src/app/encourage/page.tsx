"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface TypewriterTextProps {
  text: string;
  delay?: number;
}

interface EncouragementResponse {
  verse: string;
  message: string;
}

// Typewriter effect component
const TypewriterText = ({ text, delay = 30 }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{displayText}</span>;
};

export default function Encourage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [struggle, setStruggle] = useState("");
  const [encouragement, setEncouragement] = useState<EncouragementResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    router.push("/login");
    return null;
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen dark-background overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="animated-orb orb-1"></div>
          <div className="animated-orb orb-2"></div>
          <div className="animated-orb orb-3"></div>
          <div className="animated-grid"></div>
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-center orange-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold orange-text orbitron-font">Loading...</h2>
          <p className="mt-2 gray-text">Please wait while we load your account information.</p>
        </div>
        <style jsx>{`
          .animated-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            animation: floatUp 25s ease-in-out infinite;
          }

          .orb-1 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, transparent 70%);
            bottom: -200px;
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
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            animation-delay: -14s;
          }

          @keyframes floatUp {
            0% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(50px, -100px) scale(1.1);
            }
            66% {
              transform: translate(-30px, -200px) scale(0.9);
            }
            100% {
              transform: translate(0, -300px) scale(1);
            }
          }

          .animated-grid {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMoveUp 20s linear infinite;
            opacity: 0.5;
          }

          @keyframes gridMoveUp {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, -50px);
            }
          }

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
            animation: particleFloatUp 15s ease-in-out infinite;
          }

          .particle:nth-child(1) { left: 10%; bottom: 20%; animation-delay: 0s; animation-duration: 12s; }
          .particle:nth-child(2) { left: 30%; bottom: 10%; animation-delay: 1s; animation-duration: 18s; }
          .particle:nth-child(3) { left: 50%; bottom: 30%; animation-delay: 2s; animation-duration: 15s; }
          .particle:nth-child(4) { left: 70%; bottom: 15%; animation-delay: 0.5s; animation-duration: 20s; }
          .particle:nth-child(5) { left: 20%; bottom: 60%; animation-delay: 1.5s; animation-duration: 14s; }
          .particle:nth-child(6) { left: 80%; bottom: 50%; animation-delay: 2.5s; animation-duration: 16s; }
          .particle:nth-child(7) { left: 15%; bottom: 80%; animation-delay: 0.8s; animation-duration: 19s; }
          .particle:nth-child(8) { left: 60%; bottom: 70%; animation-delay: 1.2s; animation-duration: 13s; }
          .particle:nth-child(9) { left: 40%; bottom: 90%; animation-delay: 2.2s; animation-duration: 17s; }
          .particle:nth-child(10) { left: 90%; bottom: 25%; animation-delay: 0.3s; animation-duration: 21s; }
          .particle:nth-child(11) { left: 5%; bottom: 40%; animation-delay: 1.8s; animation-duration: 14s; }
          .particle:nth-child(12) { left: 85%; bottom: 75%; animation-delay: 0.7s; animation-duration: 18s; }
          .particle:nth-child(13) { left: 25%; bottom: 5%; animation-delay: 2.3s; animation-duration: 16s; }
          .particle:nth-child(14) { left: 55%; bottom: 55%; animation-delay: 1.1s; animation-duration: 15s; }
          .particle:nth-child(15) { left: 75%; bottom: 85%; animation-delay: 0.6s; animation-duration: 20s; }
          .particle:nth-child(16) { left: 35%; bottom: 45%; animation-delay: 1.9s; animation-duration: 13s; }
          .particle:nth-child(17) { left: 65%; bottom: 35%; animation-delay: 0.4s; animation-duration: 17s; }
          .particle:nth-child(18) { left: 45%; bottom: 65%; animation-delay: 2.1s; animation-duration: 19s; }
          .particle:nth-child(19) { left: 95%; bottom: 60%; animation-delay: 1.4s; animation-duration: 14s; }
          .particle:nth-child(20) { left: 12%; bottom: 35%; animation-delay: 0.9s; animation-duration: 16s; }

          @keyframes particleFloatUp {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 0.3;
            }
            25% {
              transform: translate(30px, -100px) scale(1.3) rotate(90deg);
              opacity: 0.7;
            }
            50% {
              transform: translate(-20px, -200px) scale(1.5) rotate(180deg);
              opacity: 0.8;
            }
            75% {
              transform: translate(40px, -300px) scale(1.2) rotate(270deg);
              opacity: 0.6;
            }
            100% {
              transform: translate(0, -400px) scale(1) rotate(360deg);
              opacity: 0.3;
            }
          }
        `}</style>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!struggle.trim()) {
      setError("Please enter what you're struggling with");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/ai/encourage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ input: struggle }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get encouragement");
      }

      setEncouragement(data);
    } catch (err: unknown) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving the struggle and encouragement
  const handleSave = async () => {
    if (!encouragement) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/encourage/log-struggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          struggle: struggle,
          verse: encouragement.verse,
          message: encouragement.message,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save encouragement");
      }
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error("Error in handleSave:", err);
      setError(err instanceof Error ? err.message : "Failed to save your encouragement. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Animated Background Effects - Landing Page Style Moving Upward */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="orange-card rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-6">Daily Encouragement</h1>
          
          {!encouragement ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="struggle" className="block text-xl font-medium gray-text orbitron-font mb-3">
                  What are you struggling with?
                </label>
                <textarea
                  id="struggle"
                  value={struggle}
                  onChange={(e) => setStruggle(e.target.value)}
                  className="w-full p-4 orange-input rounded-lg focus:outline-none text-lg"
                  rows={4}
                  placeholder="Share your struggles here..."
                />
              </div>
              
              {error && (
                <p className="text-red-400">{error}</p>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 orange-button rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] transition-all flex justify-center items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting encouragement...
                    </>
                  ) : (
                    "Get Encouragement"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Bible Verse</h2>
                <p className="gray-text text-lg">
                  <TypewriterText text={encouragement.verse} delay={50} />
                </p>
              </div>
              
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Words of Encouragement</h2>
                <p className="gray-text text-lg">
                  <TypewriterText text={encouragement.message} delay={30} />
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  onClick={() => setEncouragement(null)}
                  className="py-2 px-6 orange-button rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] transition-all"
                >
                  Get Another Encouragement
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`py-2 px-6 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] transition-all flex items-center justify-center ${
                    saveSuccess
                      ? "bg-[#f97316] text-black"
                      : "orange-button"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    "Saved!"
                  ) : (
                    "Save This Encouragement"
                  )}
                </button>
              </div>
              
              {error && (
                <p className="text-red-400 mt-2">{error}</p>
              )}
            </div>
          )}
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Landing Page Style Animations - Moving Upward */}
      <style jsx>{`
        /* Animated Gradient Orbs */
        .animated-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: floatUp 25s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, transparent 70%);
          bottom: -200px;
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
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: -14s;
        }

        @keyframes floatUp {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -100px) scale(1.1);
          }
          66% {
            transform: translate(-30px, -200px) scale(0.9);
          }
          100% {
            transform: translate(0, -300px) scale(1);
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
          animation: gridMoveUp 20s linear infinite;
          opacity: 0.5;
        }

        @keyframes gridMoveUp {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, -50px);
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
          animation: particleFloatUp 15s ease-in-out infinite;
        }

        .particle:nth-child(1) { left: 10%; bottom: 20%; animation-delay: 0s; animation-duration: 12s; }
        .particle:nth-child(2) { left: 30%; bottom: 10%; animation-delay: 1s; animation-duration: 18s; }
        .particle:nth-child(3) { left: 50%; bottom: 30%; animation-delay: 2s; animation-duration: 15s; }
        .particle:nth-child(4) { left: 70%; bottom: 15%; animation-delay: 0.5s; animation-duration: 20s; }
        .particle:nth-child(5) { left: 20%; bottom: 60%; animation-delay: 1.5s; animation-duration: 14s; }
        .particle:nth-child(6) { left: 80%; bottom: 50%; animation-delay: 2.5s; animation-duration: 16s; }
        .particle:nth-child(7) { left: 15%; bottom: 80%; animation-delay: 0.8s; animation-duration: 19s; }
        .particle:nth-child(8) { left: 60%; bottom: 70%; animation-delay: 1.2s; animation-duration: 13s; }
        .particle:nth-child(9) { left: 40%; bottom: 90%; animation-delay: 2.2s; animation-duration: 17s; }
        .particle:nth-child(10) { left: 90%; bottom: 25%; animation-delay: 0.3s; animation-duration: 21s; }
        .particle:nth-child(11) { left: 5%; bottom: 40%; animation-delay: 1.8s; animation-duration: 14s; }
        .particle:nth-child(12) { left: 85%; bottom: 75%; animation-delay: 0.7s; animation-duration: 18s; }
        .particle:nth-child(13) { left: 25%; bottom: 5%; animation-delay: 2.3s; animation-duration: 16s; }
        .particle:nth-child(14) { left: 55%; bottom: 55%; animation-delay: 1.1s; animation-duration: 15s; }
        .particle:nth-child(15) { left: 75%; bottom: 85%; animation-delay: 0.6s; animation-duration: 20s; }
        .particle:nth-child(16) { left: 35%; bottom: 45%; animation-delay: 1.9s; animation-duration: 13s; }
        .particle:nth-child(17) { left: 65%; bottom: 35%; animation-delay: 0.4s; animation-duration: 17s; }
        .particle:nth-child(18) { left: 45%; bottom: 65%; animation-delay: 2.1s; animation-duration: 19s; }
        .particle:nth-child(19) { left: 95%; bottom: 60%; animation-delay: 1.4s; animation-duration: 14s; }
        .particle:nth-child(20) { left: 12%; bottom: 35%; animation-delay: 0.9s; animation-duration: 16s; }

        @keyframes particleFloatUp {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translate(30px, -100px) scale(1.3) rotate(90deg);
            opacity: 0.7;
          }
          50% {
            transform: translate(-20px, -200px) scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          75% {
            transform: translate(40px, -300px) scale(1.2) rotate(270deg);
            opacity: 0.6;
          }
          100% {
            transform: translate(0, -400px) scale(1) rotate(360deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
} 