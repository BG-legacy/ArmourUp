"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface PrayerRequest {
  id: number;
  request: string;
  is_anonymous: boolean;
  prayer_count: number;
  status: string;
  answered_at?: string;
  answer_testimony?: string;
  created_at: string;
}

export default function PrayerWall() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [myPrayerRequests, setMyPrayerRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [prayingFor, setPrayingFor] = useState<Set<number>>(new Set());

  // Define fetch functions before useEffect hooks
  const fetchPrayerRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prayer requests");
      }

      const data = await response.json();
      setPrayerRequests(data);
    } catch (err) {
      console.error("Error fetching prayer requests:", err);
      setError("Failed to load prayer requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchMyPrayerRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer/my-requests", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyPrayerRequests(data);
      }
    } catch (err) {
      console.error("Error fetching my prayer requests:", err);
    }
  };

  // Fetch prayer requests - moved before conditional returns to follow Rules of Hooks
  useEffect(() => {
    // Only fetch if authenticated
    if (isAuthenticated && !isLoading) {
      fetchPrayerRequests();
      fetchMyPrayerRequests();
    }
  }, [isAuthenticated, isLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while auth is being checked
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
          <p className="mt-2 gray-text">Please wait while we load your account information.</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newRequest.trim()) {
      setError("Please enter a prayer request");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          request: newRequest,
          is_anonymous: isAnonymous,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create prayer request");
      }

      setNewRequest("");
      setIsAnonymous(true);
      await fetchPrayerRequests();
      await fetchMyPrayerRequests();
    } catch (err: unknown) {
      console.error("Error creating prayer request:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePray = async (id: number) => {
    if (prayingFor.has(id)) return;

    try {
      setPrayingFor(prev => new Set(prev).add(id));
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer/${id}/pray`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle duplicate prayer gracefully
        if (response.status === 409) {
          alert("You've already prayed for this request! ✓");
        } else {
          throw new Error(data.error || "Failed to pray for request");
        }
        return;
      }

      // Update the prayer count locally
      setPrayerRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, prayer_count: req.prayer_count + 1 }
            : req
        )
      );
      
      // Show success feedback
      alert("Prayer logged! 🙏");
    } catch (err) {
      console.error("Error praying for request:", err);
      setError("Failed to log prayer");
    } finally {
      setPrayingFor(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete prayer request");
      }

      await fetchPrayerRequests();
      await fetchMyPrayerRequests();
    } catch (err) {
      console.error("Error deleting prayer request:", err);
      setError("Failed to delete prayer request");
    }
  };

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

  const displayedRequests = showMyRequests ? myPrayerRequests : prayerRequests;

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
        <div className="orange-card rounded-lg p-6 sm:p-8 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-6">
            Prayer Wall
          </h1>
          <p className="gray-text text-lg mb-6">
            Share your prayer requests anonymously and pray for others in the community.
          </p>

          {/* Toggle between all requests and my requests */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowMyRequests(false)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !showMyRequests
                  ? "orange-button"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setShowMyRequests(true)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                showMyRequests
                  ? "orange-button"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => router.push('/answered-prayers')}
              className="px-6 py-2 rounded-lg font-medium transition-all bg-green-700 text-white hover:bg-green-600"
            >
              ✓ Answered Prayers
            </button>
            <button
              onClick={() => router.push('/my-prayers')}
              className="px-6 py-2 rounded-lg font-medium transition-all bg-blue-700 text-white hover:bg-blue-600"
            >
              My Prayer History
            </button>
          </div>

          {/* Create new prayer request form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label htmlFor="request" className="block text-lg font-medium gray-text orbitron-font mb-2">
                Share Your Prayer Request
              </label>
              <textarea
                id="request"
                value={newRequest}
                onChange={(e) => setNewRequest(e.target.value)}
                className="w-full p-4 orange-input rounded-lg focus:outline-none text-lg"
                rows={4}
                placeholder="Share your prayer request here..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="anonymous" className="ml-2 gray-text">
                Post anonymously
              </label>
            </div>
            
            {error && (
              <p className="text-red-400">{error}</p>
            )}
            
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
                  Submitting...
                </>
              ) : (
                "Submit Prayer Request"
              )}
            </button>
          </form>
        </div>

        {/* Prayer Requests List */}
        <div className="space-y-4">
          {isLoadingRequests ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text">Loading prayer requests...</p>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="orange-card rounded-lg p-8 text-center">
              <p className="gray-text text-lg">
                {showMyRequests 
                  ? "You haven't submitted any prayer requests yet." 
                  : "No prayer requests yet. Be the first to share!"}
              </p>
            </div>
          ) : (
            displayedRequests.map((request) => (
              <div key={request.id} className="orange-card rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {request.status === 'answered' && (
                      <div className="inline-block px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium mb-2">
                        ✓ Answered
                      </div>
                    )}
                    <p className="gray-text text-lg mb-2">{request.request}</p>
                    {request.answer_testimony && (
                      <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                        <p className="text-sm font-semibold text-green-300 mb-1">Testimony:</p>
                        <p className="text-sm text-green-200">{request.answer_testimony}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm gray-text mt-2">
                      <span>{formatDate(request.created_at)}</span>
                      {request.is_anonymous && (
                        <span className="text-orange-400">Anonymous</span>
                      )}
                      {request.answered_at && (
                        <span className="text-green-400">Answered: {formatDate(request.answered_at)}</span>
                      )}
                    </div>
                  </div>
                  {showMyRequests && (
                    <div className="ml-4 flex gap-2">
                      {request.status !== 'answered' && (
                        <button
                          onClick={() => router.push(`/prayer-wall/${request.id}/answer`)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Mark as Answered"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {request.status !== 'answered' && (
                    <button
                      onClick={() => handlePray(request.id)}
                      disabled={prayingFor.has(request.id)}
                      className="flex items-center gap-2 px-4 py-2 orange-button rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Pray</span>
                    </button>
                  )}
                  <span className="gray-text">
                    {request.prayer_count} {request.prayer_count === 1 ? 'prayer' : 'prayers'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Landing Page Style Animations */}
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

