"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
}

interface PrayerCommitment {
  id: number;
  chain_id: number;
  member_id: number;
  pray_for_user_id: number;
  created_at: string;
  pray_for_user?: User;
}

interface ChainMember {
  id: number;
  chain_id: number;
  user_id: number;
  created_at: string;
  user?: User;
  prayer_commitments?: PrayerCommitment[];
}

interface PrayerChain {
  id: number;
  name: string;
  description: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  members?: ChainMember[];
  created_by?: User;
}

export default function PrayerChains() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [chains, setChains] = useState<PrayerChain[]>([]);
  const [myChains, setMyChains] = useState<PrayerChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<PrayerChain | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMyChains, setShowMyChains] = useState(false);
  const [isLoadingChains, setIsLoadingChains] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [chainName, setChainName] = useState("");
  const [chainDescription, setChainDescription] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchChains();
      fetchMyChains();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchChains = async () => {
    try {
      setIsLoadingChains(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer-chains", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prayer chains");
      }

      const data = await response.json();
      setChains(data);
    } catch (err) {
      console.error("Error fetching prayer chains:", err);
      setError("Failed to load prayer chains");
    } finally {
      setIsLoadingChains(false);
    }
  };

  const fetchMyChains = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer-chains/my-chains", {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyChains(data);
      }
    } catch (err) {
      console.error("Error fetching my prayer chains:", err);
    }
  };

  const fetchChainDetails = async (chainId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer-chains/${chainId}`, {
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChain(data);
      }
    } catch (err) {
      console.error("Error fetching chain details:", err);
    }
  };

  const handleCreateChain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!chainName.trim()) {
      setError("Please enter a chain name");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer-chains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          name: chainName,
          description: chainDescription,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create prayer chain");
      }

      setChainName("");
      setChainDescription("");
      setShowCreateForm(false);
      await fetchChains();
      await fetchMyChains();
    } catch (err: unknown) {
      console.error("Error creating prayer chain:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinChain = async (chainId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer-chains/${chainId}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join chain");
      }

      await fetchChains();
      await fetchMyChains();
      if (selectedChain?.id === chainId) {
        await fetchChainDetails(chainId);
      }
    } catch (err) {
      console.error("Error joining chain:", err);
      setError(err instanceof Error ? err.message : "Failed to join chain");
    }
  };

  const handleLeaveChain = async (chainId: number) => {
    if (!confirm("Are you sure you want to leave this prayer chain?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer-chains/${chainId}/leave`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to leave chain");
      }

      await fetchChains();
      await fetchMyChains();
      if (selectedChain?.id === chainId) {
        setSelectedChain(null);
      }
    } catch (err) {
      console.error("Error leaving chain:", err);
      setError(err instanceof Error ? err.message : "Failed to leave chain");
    }
  };

  const handleCommitToPray = async (chainId: number, prayForUserId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch("/api/prayer-chains/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          chain_id: chainId,
          pray_for_user_id: prayForUserId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to commit to pray");
      }

      if (selectedChain?.id === chainId) {
        await fetchChainDetails(chainId);
      }
    } catch (err) {
      console.error("Error committing to pray:", err);
      setError(err instanceof Error ? err.message : "Failed to commit to pray");
    }
  };

  const handleRemoveCommitment = async (chainId: number, userId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/prayer-chains/${chainId}/commit/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token || ''}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove commitment");
      }

      if (selectedChain?.id === chainId) {
        await fetchChainDetails(chainId);
      }
    } catch (err) {
      console.error("Error removing commitment:", err);
      setError(err instanceof Error ? err.message : "Failed to remove commitment");
    }
  };

  const isMember = (chain: PrayerChain): boolean => {
    if (!user) return false;
    return chain.members?.some(m => m.user_id === user.id) || false;
  };

  const hasCommitment = (chain: PrayerChain, prayForUserId: number): boolean => {
    if (!user) return false;
    const currentUserMember = chain.members?.find(m => m.user_id === user.id);
    if (!currentUserMember) return false;
    return currentUserMember.prayer_commitments?.some(c => c.pray_for_user_id === prayForUserId) || false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
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
          <p className="mt-2 gray-text">Please wait while we load your prayer chains.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const displayedChains = showMyChains ? myChains : chains;

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font">
              Prayer Chains
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="gray-text text-lg mb-6">
            Create groups where members commit to pray for each other.
          </p>

          {/* Toggle between all chains and my chains */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setShowMyChains(false);
                setSelectedChain(null);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !showMyChains
                  ? "orange-button"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => {
                setShowMyChains(true);
                setSelectedChain(null);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                showMyChains
                  ? "orange-button"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              My Chains
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-2 orange-button rounded-lg font-medium transition-all"
            >
              {showCreateForm ? "Cancel" : "Create Chain"}
            </button>
          </div>

          {/* Create chain form */}
          {showCreateForm && (
            <form onSubmit={handleCreateChain} className="space-y-4 mb-6 p-4 bg-gray-800 rounded-lg">
              <div>
                <label htmlFor="chainName" className="block text-lg font-medium gray-text orbitron-font mb-2">
                  Chain Name
                </label>
                <input
                  id="chainName"
                  type="text"
                  value={chainName}
                  onChange={(e) => setChainName(e.target.value)}
                  className="w-full p-3 orange-input rounded-lg focus:outline-none text-lg"
                  placeholder="Enter chain name..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chainDescription" className="block text-lg font-medium gray-text orbitron-font mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="chainDescription"
                  value={chainDescription}
                  onChange={(e) => setChainDescription(e.target.value)}
                  className="w-full p-3 orange-input rounded-lg focus:outline-none text-lg"
                  rows={3}
                  placeholder="Describe the purpose of this prayer chain..."
                />
              </div>
              
              {error && (
                <p className="text-red-400">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 orange-button rounded-lg font-medium focus:outline-none transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Prayer Chain"}
              </button>
            </form>
          )}

          {error && !showCreateForm && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Chains List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {isLoadingChains ? (
            <div className="col-span-2 orange-card rounded-lg p-8 text-center">
              <p className="gray-text">Loading prayer chains...</p>
            </div>
          ) : displayedChains.length === 0 ? (
            <div className="col-span-2 orange-card rounded-lg p-8 text-center">
              <p className="gray-text text-lg">
                {showMyChains 
                  ? "You haven't joined any prayer chains yet." 
                  : "No prayer chains yet. Be the first to create one!"}
              </p>
            </div>
          ) : (
            displayedChains.map((chain) => (
              <div key={chain.id} className="orange-card rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold orange-text orbitron-font mb-2">
                      {chain.name}
                    </h3>
                    {chain.description && (
                      <p className="gray-text mb-2">{chain.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm gray-text">
                      <span>{formatDate(chain.created_at)}</span>
                      <span>{chain.members?.length || 0} members</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => fetchChainDetails(chain.id)}
                    className="flex-1 px-4 py-2 orange-button rounded-lg font-medium transition-all"
                  >
                    View Details
                  </button>
                  {isMember(chain) ? (
                    <button
                      onClick={() => handleLeaveChain(chain.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinChain(chain.id)}
                      className="px-4 py-2 orange-button rounded-lg font-medium transition-all"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chain Details Modal */}
        {selectedChain && (
          <div className="orange-card rounded-lg p-6 sm:p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold orange-text orbitron-font mb-2">
                  {selectedChain.name}
                </h2>
                {selectedChain.description && (
                  <p className="gray-text text-lg mb-2">{selectedChain.description}</p>
                )}
                <p className="gray-text text-sm">
                  Created {formatDate(selectedChain.created_at)} • {selectedChain.members?.length || 0} members
                </p>
              </div>
              <button
                onClick={() => setSelectedChain(null)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold orange-text orbitron-font">Members</h3>
              {selectedChain.members && selectedChain.members.length > 0 ? (
                selectedChain.members.map((member) => {
                  const memberUser = member.user;
                  const isCurrentUser = memberUser?.id === user?.id;
                  const commitments = member.prayer_commitments || [];

                  return (
                    <div key={member.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-lg font-medium gray-text">
                            {memberUser?.username || "Unknown User"}
                            {isCurrentUser && (
                              <span className="ml-2 text-orange-400 text-sm">(You)</span>
                            )}
                          </p>
                          <p className="text-sm gray-text">
                            Joined {formatDate(member.created_at)}
                          </p>
                        </div>
                        {!isCurrentUser && isMember(selectedChain) && (
                          <button
                            onClick={() => {
                              if (hasCommitment(selectedChain, memberUser?.id || 0)) {
                                handleRemoveCommitment(selectedChain.id, memberUser?.id || 0);
                              } else {
                                handleCommitToPray(selectedChain.id, memberUser?.id || 0);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              hasCommitment(selectedChain, memberUser?.id || 0)
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "orange-button"
                            }`}
                          >
                            {hasCommitment(selectedChain, memberUser?.id || 0)
                              ? "✓ Committed"
                              : "Commit to Pray"}
                          </button>
                        )}
                      </div>
                      {commitments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-sm gray-text mb-2">Praying for:</p>
                          <div className="flex flex-wrap gap-2">
                            {commitments.map((commitment) => (
                              <span
                                key={commitment.id}
                                className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs"
                              >
                                {commitment.pray_for_user?.username || "Unknown"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="gray-text">No members yet.</p>
              )}
            </div>
          </div>
        )}
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

