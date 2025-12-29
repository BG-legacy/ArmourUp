"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface PrayerLog {
  id: number;
  prayer_request_id: number;
  user_id: number;
  prayed_at: string;
  prayer_request?: {
    id: number;
    request: string;
    status: string;
    prayer_count: number;
    answered_at?: string;
    answer_testimony?: string;
  };
}

export default function MyPrayers() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [prayerLogs, setPrayerLogs] = useState<PrayerLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchMyPrayers();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchMyPrayers = async () => {
    try {
      setIsLoadingLogs(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer/my-prayers", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prayer history");
      }

      const data = await response.json();
      setPrayerLogs(data);
    } catch (err) {
      console.error("Error fetching prayer history:", err);
      setError("Failed to load your prayer history");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (isLoading) {
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

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="orange-card rounded-lg p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font">
              My Prayer History
            </h1>
          </div>
          <p className="gray-text text-lg mb-4">
            Track all the prayers you've prayed for and see how they're answered.
          </p>
          {prayerLogs.length > 0 && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 text-lg font-semibold">
                🙏 You've prayed for {prayerLogs.length} {prayerLogs.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
          )}
        </div>

        {/* Prayer History List */}
        <div className="space-y-4">
          {isLoadingLogs ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text">Loading your prayer history...</p>
            </div>
          ) : error ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : prayerLogs.length === 0 ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text text-lg mb-4">
                You haven't prayed for any requests yet.
              </p>
              <button
                onClick={() => router.push('/prayer-wall')}
                className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
              >
                Go to Prayer Wall
              </button>
            </div>
          ) : (
            prayerLogs.map((log) => (
              <div key={log.id} className="orange-card rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {log.prayer_request?.status === 'answered' && (
                      <div className="inline-block px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium mb-2">
                        ✓ Answered
                      </div>
                    )}
                    {log.prayer_request ? (
                      <div>
                        <p className="text-lg gray-text mb-2">
                          {log.prayer_request.request}
                        </p>
                        
                        {log.prayer_request.answer_testimony && (
                          <div className="mt-3 mb-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                            <p className="text-sm font-semibold text-green-300 mb-1">Testimony:</p>
                            <p className="text-sm text-green-200">{log.prayer_request.answer_testimony}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm gray-text mt-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            You prayed {getTimeSince(log.prayed_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {log.prayer_request.prayer_count} total prayers
                          </span>
                          {log.prayer_request.answered_at && (
                            <span className="flex items-center gap-1 text-green-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Answered {formatDate(log.prayer_request.answered_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm gray-text italic">Prayer request no longer available</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/prayer-wall')}
            className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
          >
            Back to Prayer Wall
          </button>
          <button
            onClick={() => router.push('/answered-prayers')}
            className="px-6 py-2 bg-green-700 text-white hover:bg-green-600 rounded-lg font-medium transition-all"
          >
            View Answered Prayers
          </button>
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
          background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%);
          bottom: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, transparent 70%);
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
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
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





