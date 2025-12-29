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

const emotionalStates = [
  { value: "joyful", label: "😊 Joyful", emoji: "😊" },
  { value: "peaceful", label: "😌 Peaceful", emoji: "😌" },
  { value: "grateful", label: "🙏 Grateful", emoji: "🙏" },
  { value: "hopeful", label: "🌟 Hopeful", emoji: "🌟" },
  { value: "content", label: "😊 Content", emoji: "😊" },
  { value: "anxious", label: "😰 Anxious", emoji: "😰" },
  { value: "sad", label: "😢 Sad", emoji: "😢" },
  { value: "frustrated", label: "😤 Frustrated", emoji: "😤" },
  { value: "overwhelmed", label: "😵 Overwhelmed", emoji: "😵" },
  { value: "lonely", label: "😔 Lonely", emoji: "😔" },
];

const spiritualStates = [
  { value: "connected", label: "🙏 Connected to God", emoji: "🙏" },
  { value: "growing", label: "🌱 Growing in Faith", emoji: "🌱" },
  { value: "inspired", label: "✨ Inspired", emoji: "✨" },
  { value: "peaceful", label: "☮️ Spiritually Peaceful", emoji: "☮️" },
  { value: "seeking", label: "🔍 Seeking God", emoji: "🔍" },
  { value: "distant", label: "🌫️ Distant from God", emoji: "🌫️" },
  { value: "doubting", label: "❓ Doubting", emoji: "❓" },
  { value: "struggling", label: "⚔️ Struggling", emoji: "⚔️" },
  { value: "dry", label: "🏜️ Spiritually Dry", emoji: "🏜️" },
  { value: "questioning", label: "🤔 Questioning", emoji: "🤔" },
];

export default function MoodTracker() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    emotional_state: "",
    spiritual_state: "",
    energy_level: 5,
    gratitude: "",
    notes: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch today's entry
  useEffect(() => {
    const fetchTodayEntry = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch("/api/mood?today=true", {
          headers: {
            "Authorization": `Bearer ${token || ''}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTodayEntry(data);
          setFormData({
            emotional_state: data.emotional_state,
            spiritual_state: data.spiritual_state,
            energy_level: data.energy_level,
            gratitude: data.gratitude || "",
            notes: data.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching today's entry:", error);
      }
    };

    if (isAuthenticated) {
      fetchTodayEntry();
    }
  }, [isAuthenticated]);

  // Show loading state while auth is being checked
  if (isLoading) {
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
          <p className="mt-2 gray-text">Please wait while we load your account information.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const method = todayEntry ? "PUT" : "POST";
      const url = todayEntry ? `/api/mood/${todayEntry.id}` : "/api/mood";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save mood entry");
      }

      setTodayEntry(data);
      setSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error saving mood entry:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError("");
    setSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (todayEntry) {
      setFormData({
        emotional_state: todayEntry.emotional_state,
        spiritual_state: todayEntry.spiritual_state,
        energy_level: todayEntry.energy_level,
        gratitude: todayEntry.gratitude || "",
        notes: todayEntry.notes || "",
      });
    }
  };

  const getEmotionalEmoji = (state: string) => {
    return emotionalStates.find((s) => s.value === state)?.emoji || "😊";
  };

  const getSpiritualEmoji = (state: string) => {
    return spiritualStates.find((s) => s.value === state)?.emoji || "🙏";
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

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="orange-card rounded-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font">
              Daily Mood Check-in
            </h1>
            <button
              onClick={() => router.push("/mood-trends")}
              className="px-4 py-2 orange-button rounded-lg font-medium transition-all text-sm sm:text-base"
            >
              View Trends
            </button>
          </div>

          {todayEntry && !isEditing ? (
            <div className="space-y-6">
              <div className="orange-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">
                  Today&apos;s Entry
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium gray-text mb-2">Emotional State</h3>
                    <p className="text-2xl">
                      {getEmotionalEmoji(todayEntry.emotional_state)} {todayEntry.emotional_state}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium gray-text mb-2">Spiritual State</h3>
                    <p className="text-2xl">
                      {getSpiritualEmoji(todayEntry.spiritual_state)} {todayEntry.spiritual_state}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium gray-text mb-2">Energy Level</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-4 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#f97316] to-yellow-500 transition-all duration-300"
                          style={{ width: `${todayEntry.energy_level * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-semibold orange-text">{todayEntry.energy_level}/10</span>
                    </div>
                  </div>

                  {todayEntry.gratitude && (
                    <div>
                      <h3 className="text-lg font-medium gray-text mb-2">Gratitude</h3>
                      <p className="gray-text text-lg">{todayEntry.gratitude}</p>
                    </div>
                  )}

                  {todayEntry.notes && (
                    <div>
                      <h3 className="text-lg font-medium gray-text mb-2">Notes</h3>
                      <p className="gray-text text-lg">{todayEntry.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEditClick}
                  className="mt-6 px-6 py-2 orange-button rounded-lg font-medium transition-all"
                >
                  Edit Today&apos;s Entry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xl font-medium gray-text orbitron-font mb-3">
                  How are you feeling emotionally?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {emotionalStates.map((state) => (
                    <button
                      key={state.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, emotional_state: state.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.emotional_state === state.value
                          ? "border-[#f97316] bg-[#2a2a2a] text-[#f97316]"
                          : "border-[#3a3a3a] bg-[#1a1a1a] text-gray-400 hover:border-[#f97316]"
                      }`}
                    >
                      <div className="text-3xl mb-1">{state.emoji}</div>
                      <div className="text-sm">{state.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-medium gray-text orbitron-font mb-3">
                  How are you feeling spiritually?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {spiritualStates.map((state) => (
                    <button
                      key={state.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, spiritual_state: state.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.spiritual_state === state.value
                          ? "border-[#f97316] bg-[#2a2a2a] text-[#f97316]"
                          : "border-[#3a3a3a] bg-[#1a1a1a] text-gray-400 hover:border-[#f97316]"
                      }`}
                    >
                      <div className="text-3xl mb-1">{state.emoji}</div>
                      <div className="text-sm">{state.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-medium gray-text orbitron-font mb-3">
                  Energy Level: {formData.energy_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                  className="w-full h-3 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label htmlFor="gratitude" className="block text-xl font-medium gray-text orbitron-font mb-3">
                  What are you grateful for today?
                </label>
                <textarea
                  id="gratitude"
                  value={formData.gratitude}
                  onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
                  className="w-full p-4 orange-input rounded-lg focus:outline-none text-lg"
                  rows={3}
                  placeholder="Share your gratitude..."
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-xl font-medium gray-text orbitron-font mb-3">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-4 orange-input rounded-lg focus:outline-none text-lg"
                  rows={3}
                  placeholder="Any other thoughts or reflections..."
                />
              </div>

              {error && (
                <p className="text-red-400">{error}</p>
              )}

              {success && (
                <p className="text-[#f97316] font-semibold">✓ Mood entry saved successfully!</p>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.emotional_state || !formData.spiritual_state}
                  className="flex-1 py-3 px-4 orange-button rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : todayEntry ? "Update Entry" : "Save Entry"}
                </button>
                
                {todayEntry && isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
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

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #f97316;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #f97316;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}



