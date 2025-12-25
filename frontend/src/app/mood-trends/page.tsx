"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface MoodEntry {
  id: number;
  emotional_state: string;
  spiritual_state: string;
  energy_level: number;
  gratitude: string;
  notes: string;
  date: string;
  created_at: string;
}

interface MoodTrendStats {
  period: string;
  avg_energy_level: number;
  emotional_states: Record<string, number>;
  spiritual_states: Record<string, number>;
  total_entries: number;
}

export default function MoodTrends() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [trends, setTrends] = useState<MoodTrendStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch mood entries and trends
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      setIsLoadingData(true);
      setError("");

      try {
        // Fetch recent entries
        const entriesResponse = await fetch(`/api/mood?recent=true&limit=30`);
        if (entriesResponse.ok) {
          const entriesData = await entriesResponse.json();
          setEntries(entriesData);
        }

        // Fetch trends
        const trendsResponse = await fetch(`/api/mood?trends=true&days=${selectedDays}`);
        if (trendsResponse.ok) {
          const trendsData = await trendsResponse.json();
          setTrends(trendsData);
        }
      } catch (error) {
        console.error("Error fetching mood data:", error);
        setError("Failed to load mood data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated, selectedDays]);

  // Show loading state while auth is being checked
  if (isLoading || isLoadingData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen dark-background overflow-hidden">
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
          <p className="mt-2 gray-text">Please wait while we load your mood trends.</p>
        </div>
      </div>
    );
  }

  const getEmotionalEmoji = (state: string) => {
    const emojiMap: Record<string, string> = {
      joyful: "😊",
      peaceful: "😌",
      grateful: "🙏",
      hopeful: "🌟",
      content: "😊",
      anxious: "😰",
      sad: "😢",
      frustrated: "😤",
      overwhelmed: "😵",
      lonely: "😔",
    };
    return emojiMap[state] || "😊";
  };

  const getSpiritualEmoji = (state: string) => {
    const emojiMap: Record<string, string> = {
      connected: "🙏",
      growing: "🌱",
      inspired: "✨",
      peaceful: "☮️",
      seeking: "🔍",
      distant: "🌫️",
      doubting: "❓",
      struggling: "⚔️",
      dry: "🏜️",
      questioning: "🤔",
    };
    return emojiMap[state] || "🙏";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTopStates = (states: Record<string, number>) => {
    return Object.entries(states)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="orange-card rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font">
              Mood Trends & History
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/mood-tracker")}
                className="px-4 py-2 orange-button rounded-lg font-medium transition-all text-sm sm:text-base"
              >
                Log Mood
              </button>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="mb-8">
            <label className="block text-lg font-medium gray-text orbitron-font mb-3">
              View Trends For:
            </label>
            <div className="flex gap-3 flex-wrap">
              {[7, 14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDays === days
                      ? "bg-[#f97316] text-black"
                      : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 mb-4">{error}</p>
          )}

          {trends && trends.total_entries > 0 ? (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="orange-card p-6 rounded-lg">
                  <h3 className="text-lg font-medium gray-text mb-2">Total Entries</h3>
                  <p className="text-4xl font-bold orange-text">{trends.total_entries}</p>
                </div>
                <div className="orange-card p-6 rounded-lg">
                  <h3 className="text-lg font-medium gray-text mb-2">Average Energy</h3>
                  <p className="text-4xl font-bold orange-text">{trends.avg_energy_level.toFixed(1)}/10</p>
                </div>
                <div className="orange-card p-6 rounded-lg">
                  <h3 className="text-lg font-medium gray-text mb-2">Period</h3>
                  <p className="text-lg gray-text">{trends.period}</p>
                </div>
              </div>

              {/* Emotional States Distribution */}
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">
                  Emotional States
                </h2>
                <div className="space-y-3">
                  {getTopStates(trends.emotional_states).map(([state, count]) => (
                    <div key={state}>
                      <div className="flex justify-between mb-1">
                        <span className="text-lg gray-text">
                          {getEmotionalEmoji(state)} {state}
                        </span>
                        <span className="text-lg orange-text font-semibold">
                          {count} ({Math.round((count / trends.total_entries) * 100)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#f97316] to-yellow-500 transition-all duration-300"
                          style={{ width: `${(count / trends.total_entries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spiritual States Distribution */}
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">
                  Spiritual States
                </h2>
                <div className="space-y-3">
                  {getTopStates(trends.spiritual_states).map(([state, count]) => (
                    <div key={state}>
                      <div className="flex justify-between mb-1">
                        <span className="text-lg gray-text">
                          {getSpiritualEmoji(state)} {state}
                        </span>
                        <span className="text-lg orange-text font-semibold">
                          {count} ({Math.round((count / trends.total_entries) * 100)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#f97316] to-yellow-500 transition-all duration-300"
                          style={{ width: `${(count / trends.total_entries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Entries Timeline */}
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">
                  Recent Entries
                </h2>
                <div className="space-y-4">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-l-4 border-[#f97316] pl-4 py-2 bg-[#1a1a1a] rounded-r-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold orange-text">
                            {formatDate(entry.date)}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm gray-text">Energy:</span>
                            <span className="text-sm font-semibold orange-text">
                              {entry.energy_level}/10
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="gray-text">Emotional: </span>
                            <span className="text-gray-300">
                              {getEmotionalEmoji(entry.emotional_state)} {entry.emotional_state}
                            </span>
                          </div>
                          <div>
                            <span className="gray-text">Spiritual: </span>
                            <span className="text-gray-300">
                              {getSpiritualEmoji(entry.spiritual_state)} {entry.spiritual_state}
                            </span>
                          </div>
                        </div>
                        {entry.gratitude && (
                          <div className="mt-2">
                            <span className="text-sm gray-text">Gratitude: </span>
                            <span className="text-sm text-gray-300">{entry.gratitude}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No entries found for this period.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="orange-card p-8 rounded-lg text-center">
              <h2 className="text-2xl font-semibold orange-text mb-4">No Data Yet</h2>
              <p className="gray-text mb-6">
                Start tracking your mood to see trends and insights over time.
              </p>
              <button
                onClick={() => router.push("/mood-tracker")}
                className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
              >
                Log Your First Mood
              </button>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
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

