"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface AnsweredPrayer {
  id: number;
  request: string;
  is_anonymous: boolean;
  prayer_count: number;
  status: string;
  answered_at: string;
  answer_testimony: string;
  created_at: string;
}

export default function AnsweredPrayers() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [answeredPrayers, setAnsweredPrayers] = useState<AnsweredPrayer[]>([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchAnsweredPrayers();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchAnsweredPrayers = async () => {
    try {
      setIsLoadingPrayers(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer/answered", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answered prayers");
      }

      const data = await response.json();
      setAnsweredPrayers(data);
    } catch (err) {
      console.error("Error fetching answered prayers:", err);
      setError("Failed to load answered prayers");
    } finally {
      setIsLoadingPrayers(false);
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
              ✓ Answered Prayers
            </h1>
          </div>
          <p className="gray-text text-lg mb-4">
            See how God has answered prayers and build your faith through testimonies.
          </p>
        </div>

        {/* Answered Prayers List */}
        <div className="space-y-4">
          {isLoadingPrayers ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text">Loading answered prayers...</p>
            </div>
          ) : error ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : answeredPrayers.length === 0 ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text text-lg">
                No answered prayers yet. When prayers are answered, they'll appear here to encourage others!
              </p>
            </div>
          ) : (
            answeredPrayers.map((prayer) => (
              <div key={prayer.id} className="orange-card rounded-lg p-6 border-2 border-green-700/30">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium mb-2">
                      Answered Prayer
                    </div>
                    <p className="text-xl gray-text font-medium mb-3">{prayer.request}</p>
                    
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Testimony:
                      </p>
                      <p className="text-green-200">{prayer.answer_testimony}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm gray-text">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Requested: {formatDate(prayer.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Answered: {formatDate(prayer.answered_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {prayer.prayer_count} {prayer.prayer_count === 1 ? 'person prayed' : 'people prayed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/prayer-wall')}
            className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
          >
            Back to Prayer Wall
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
          background: radial-gradient(circle, rgba(22, 163, 74, 0.6) 0%, transparent 70%);
          bottom: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(134, 239, 172, 0.4) 0%, transparent 70%);
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




