"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

interface PrayerRequest {
  id: number;
  request: string;
  is_anonymous: boolean;
  prayer_count: number;
  status: string;
  created_at: string;
}

export default function MarkAnswered() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const prayerId = params.id as string;
  
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [testimony, setTestimony] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(true);

  const fetchPrayer = async () => {
    try {
      setIsLoadingPrayer(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer/${prayerId}`, {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prayer request");
      }

      const data = await response.json();
      
      if (data.status === 'answered') {
        setError("This prayer has already been marked as answered");
      }
      
      setPrayer(data);
    } catch (err) {
      console.error("Error fetching prayer:", err);
      setError("Failed to load prayer request");
    } finally {
      setIsLoadingPrayer(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchPrayer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, prayerId]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!testimony.trim()) {
      setError("Please share your testimony");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer/${prayerId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          testimony: testimony,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to mark prayer as answered");
      }

      // Success! Navigate to prayer wall
      alert("Prayer marked as answered! 🎉 Your testimony will encourage others.");
      router.push('/prayer-wall');
    } catch (err: unknown) {
      console.error("Error marking prayer as answered:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingPrayer) {
    return (
      <div className="relative flex items-center justify-center min-h-screen dark-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="animated-orb orb-1"></div>
          <div className="animated-orb orb-2"></div>
          <div className="animated-orb orb-3"></div>
          <div className="animated-grid"></div>
        </div>
        <div className="relative z-10 text-center orange-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold orange-text orbitron-font">Loading...</h2>
          <p className="mt-2 gray-text">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="animated-orb orb-1"></div>
        <div className="animated-orb orb-2"></div>
        <div className="animated-orb orb-3"></div>
        <div className="animated-grid"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="orange-card rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font">
              Mark Prayer as Answered
            </h1>
          </div>
          
          {prayer && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm gray-text mb-2">Your Prayer Request:</p>
              <p className="text-lg gray-text mb-3">{prayer.request}</p>
              <div className="flex items-center gap-4 text-sm gray-text">
                <span>{formatDate(prayer.created_at)}</span>
                <span>{prayer.prayer_count} {prayer.prayer_count === 1 ? 'prayer' : 'prayers'}</span>
              </div>
            </div>
          )}

          <p className="gray-text text-lg mb-6">
            Share your testimony of how God answered this prayer. Your story will encourage others and build faith in the community!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="testimony" className="block text-lg font-medium gray-text orbitron-font mb-2">
                Your Testimony
              </label>
              <textarea
                id="testimony"
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                className="w-full p-4 orange-input rounded-lg focus:outline-none text-lg"
                rows={8}
                placeholder="Share how God answered your prayer... Be specific and encourage others with your testimony!"
              />
              <p className="mt-2 text-sm gray-text">
                💡 Tip: Include details about what happened and how it impacted you.
              </p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !testimony.trim()}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Answered
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
          background: radial-gradient(circle, rgba(22, 163, 74, 0.6) 0%, transparent 70%);
          bottom: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.5) 0%, transparent 70%);
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: -14s;
        }

        @keyframes floatUp {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -100px) scale(1.1); }
          66% { transform: translate(-30px, -200px) scale(0.9); }
          100% { transform: translate(0, -300px) scale(1); }
        }

        .animated-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(22, 163, 74, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(22, 163, 74, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMoveUp 20s linear infinite;
          opacity: 0.5;
        }

        @keyframes gridMoveUp {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, -50px); }
        }
      `}</style>
    </div>
  );
}


