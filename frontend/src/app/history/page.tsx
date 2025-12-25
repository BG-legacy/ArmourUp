"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// Interface for encouragement entries
interface EncouragementEntry {
  id: number;
  user_id: number;
  message: string;
  verse: string;
  type: string;
  category?: string;
  created_at: string;
  struggle?: string; // This might be available from the backend or stored in the message field
}

export default function History() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [encouragements, setEncouragements] = useState<EncouragementEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    // If user is not authenticated and loading is finished, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
    
    // Fetch encouragements when authenticated
    if (isAuthenticated) {
      fetchEncouragements();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchEncouragements = async () => {
    setIsLoadingEntries(true);
    setError("");
    
    try {
      const token = localStorage.getItem('accessToken');
      console.log("Fetching encouragements with token:", token ? "Token exists" : "No token");
      
      const response = await fetch('/api/encourage', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch encouragements');
      }
      
      const data = await response.json();
      console.log("Received encouragements data:", data);
      
      // Check if we have any data
      if (!data || data.length === 0) {
        console.log("No encouragements found");
        setEncouragements([]);
        return;
      }
      
      // Add the raw message to the struggle property for debugging
      const enhancedData = data.map((entry: EncouragementEntry) => ({
        ...entry,
        struggle: entry.message
      }));
      
      // Filter to show only entries with type "struggle"
      // But if none found, show all entries
      const struggles = enhancedData.filter((entry: EncouragementEntry) => entry.type === "struggle");
      console.log(`Found ${struggles.length} struggle entries out of ${data.length} total entries`);
      
      if (struggles.length === 0) {
        console.log("No struggle type entries found, showing all entries instead");
        setEncouragements(enhancedData);
      } else {
        setEncouragements(struggles);
      }
    } catch (err) {
      console.error('Error fetching encouragements:', err);
      setError('Failed to load your encouragements. Please try again later.');
    } finally {
      setIsLoadingEntries(false);
    }
  };
  
  // Extract struggle text from message
  const extractStruggle = (message: string): string => {
    console.log("Extracting struggle from message:", message);
    
    // Try to extract from "Struggle: [text]" format
    if (message && message.includes('Struggle:')) {
      const afterStrugglePrefix = message.split('Struggle:')[1];
      // If there's an Encouragement section, split on that
      if (afterStrugglePrefix.includes('Encouragement:')) {
        return afterStrugglePrefix.split('Encouragement:')[0].trim();
      }
      // Otherwise return everything after Struggle:
      return afterStrugglePrefix.trim();
    }
    
    // For older entries or different formats, check if we have an explicit struggle field
    if (message && message.includes('struggle')) {
      return message.split('struggle:')[1].trim();
    }
    
    // For older entries (pre-format change), just return "Sexual temptation" or other generic struggle
    if (message && message.includes('sexual') && message.includes('immorality')) {
      return "Sexual temptation";
    } else if (message && message.includes('patience')) {
      return "Lack of patience";
    } else if (message && message.includes('anxiety') || message.includes('worry')) {
      return "Anxiety and worry";
    } else if (message && message.includes('anger')) {
      return "Anger issues";
    }
    
    // Default case - the entire message is the encouragement for older entries
    // so we don't have an explicit struggle text
    return "Personal struggle";
  };
  
  // Extract encouragement text from message
  const extractEncouragement = (message: string): string => {
    console.log("Extracting encouragement from message:", message);
    
    // New format with "Encouragement:" label
    if (message && message.includes('Encouragement:')) {
      return message.split('Encouragement:')[1].trim();
    }
    
    // For older entries (pre-format change), the whole message is the encouragement
    // if it doesn't contain our special formatting
    if (message && !message.includes('Struggle:')) {
      return message;
    }
    
    return message || "Words of encouragement";
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading || isLoadingEntries) {
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
          <p className="mt-2 gray-text">Please wait while we load your history.</p>
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
  
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
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
          <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-6">Your Journey</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 orange-text orbitron-font">Growth History</h2>
            <p className="gray-text mb-4">Review your past struggles, Bible verses, and words of encouragement that have helped you grow.</p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {encouragements.length === 0 && !isLoadingEntries && !error ? (
            <div className="text-center py-12 border border-[#f97316]/30 rounded-lg">
              <p className="gray-text mb-4">You haven't saved any struggles or encouragements yet.</p>
              <button
                onClick={() => router.push('/encourage')}
                className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
              >
                Get Started with Daily Encouragement
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {encouragements.map((entry) => (
                <div key={entry.id} className="orange-card rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <div className="border-b border-[#f97316]/30 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium orange-text orbitron-font">
                          {entry.message && entry.message.includes('Struggle:') 
                            ? 'Saved Encouragement' 
                            : entry.type === 'struggle' 
                              ? 'Spiritual Encouragement' 
                              : 'Encouragement'}
                        </h3>
                        {entry.category && (
                          <span className="text-xs gray-text/70 mt-1">{entry.category}</span>
                        )}
                      </div>
                      <span className="text-sm gray-text/70">{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">Your Struggle</h4>
                      <p className="orange-card p-3 rounded-lg gray-text">
                        {extractStruggle(entry.message) || "What you were struggling with"}
                      </p>
                    </div>
                    
                    {entry.verse && (
                      <div>
                        <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">Bible Verse</h4>
                        <p className="orange-card p-3 rounded-lg gray-text">{entry.verse}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">Encouragement</h4>
                      <p className="orange-card p-3 rounded-lg gray-text">
                        {extractEncouragement(entry.message) || "Words of encouragement"}
                      </p>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4 border-t border-[#f97316]/30 pt-4">
                        <details>
                          <summary className="text-xs gray-text/70 cursor-pointer">Debug Info</summary>
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                            <pre>{JSON.stringify(entry, null, 2)}</pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/encourage')}
              className="px-4 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Daily Encouragement
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