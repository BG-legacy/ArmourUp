"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface GratitudeEntry {
  id: number;
  user_id: number;
  title: string;
  blessing: string;
  category: string;
  tags: string;
  reflection: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  "Family & Friends",
  "Health & Wellness",
  "Spiritual Growth",
  "Provision & Finances",
  "Opportunities",
  "Nature & Beauty",
  "Personal Growth",
  "Answered Prayers",
  "Other"
];

export default function GratitudeJournal() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Form state
  const [title, setTitle] = useState("");
  const [blessing, setBlessing] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
    
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchEntries = async () => {
    setIsLoadingEntries(true);
    setError("");
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gratitude', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch gratitude entries');
      }
      
      const data = await response.json();
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching gratitude entries:', err);
      setError('Failed to load your gratitude entries. Please try again later.');
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gratitude', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          blessing,
          category,
          tags,
          reflection,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create gratitude entry');
      }

      // Reset form
      setTitle("");
      setBlessing("");
      setCategory("");
      setTags("");
      setReflection("");
      setShowForm(false);
      
      // Refresh entries
      fetchEntries();
    } catch (err) {
      console.error('Error creating gratitude entry:', err);
      setError('Failed to save your gratitude entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this gratitude entry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/gratitude/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete gratitude entry');
      }

      // Refresh entries
      fetchEntries();
    } catch (err) {
      console.error('Error deleting gratitude entry:', err);
      setError('Failed to delete gratitude entry. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEntries = selectedCategory === "all" 
    ? entries 
    : entries.filter(entry => entry.category === selectedCategory);

  if (isLoading || isLoadingEntries) {
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
          <p className="mt-2 gray-text">Please wait while we load your gratitude journal.</p>
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
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -100px) scale(1.1); }
            66% { transform: translate(-30px, -200px) scale(0.9); }
            100% { transform: translate(0, -300px) scale(1); }
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
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, -50px); }
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
            0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.3; }
            25% { transform: translate(30px, -100px) scale(1.3) rotate(90deg); opacity: 0.7; }
            50% { transform: translate(-20px, -200px) scale(1.5) rotate(180deg); opacity: 0.8; }
            75% { transform: translate(40px, -300px) scale(1.2) rotate(270deg); opacity: 0.6; }
            100% { transform: translate(0, -400px) scale(1) rotate(360deg); opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
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
        <div className="orange-card rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-2">Gratitude Journal</h1>
              <p className="gray-text text-lg">
                &ldquo;Give thanks in all circumstances; for this is God&apos;s will for you in Christ Jesus.&rdquo;
                <br />— 1 Thessalonians 5:18
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-4 sm:mt-0 px-6 py-3 orange-button rounded-lg font-medium transition-all"
            >
              {showForm ? 'Cancel' : '+ Add Blessing'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 space-y-4 border-t border-[#f97316]/30 pt-6">
              <div>
                <label className="block text-sm font-medium orange-text orbitron-font mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 orange-card rounded-lg gray-text focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  placeholder="e.g., A Beautiful Day, Family Time, New Opportunity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium orange-text orbitron-font mb-2">
                  Blessing *
                </label>
                <textarea
                  value={blessing}
                  onChange={(e) => setBlessing(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 orange-card rounded-lg gray-text focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  placeholder="Describe what you're grateful for today..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium orange-text orbitron-font mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 orange-card rounded-lg gray-text focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium orange-text orbitron-font mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 orange-card rounded-lg gray-text focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                    placeholder="e.g., joy, peace, provision (comma separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium orange-text orbitron-font mb-2">
                  Reflection (Optional)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 orange-card rounded-lg gray-text focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  placeholder="How has this blessing impacted your life or faith?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 orange-button rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Blessing'}
              </button>
            </form>
          )}
        </div>

        {/* Filter Section */}
        <div className="orange-card rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "all" 
                  ? 'bg-[#f97316] text-white' 
                  : 'orange-card gray-text hover:bg-[#f97316]/20'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#f97316] text-white' 
                    : 'orange-card gray-text hover:bg-[#f97316]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="orange-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-xl font-semibold orange-text orbitron-font mb-2">
              {selectedCategory === "all" ? "No Blessings Yet" : `No Blessings in ${selectedCategory}`}
            </h3>
            <p className="gray-text mb-6">
              {selectedCategory === "all" 
                ? "Start your gratitude journey by recording your first blessing." 
                : "Try selecting a different category or add a new blessing."}
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
              >
                Add Your First Blessing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="orange-card rounded-lg overflow-hidden hover:shadow-lg transition-all">
                <div className="border-b border-[#f97316]/30 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold orange-text orbitron-font mb-1">
                        {entry.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm gray-text/70">{formatDate(entry.created_at)}</span>
                        {entry.category && (
                          <span className="text-xs px-2 py-1 bg-[#f97316]/20 text-[#f97316] rounded-full">
                            {entry.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-4"
                      title="Delete entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">
                      Blessing
                    </h4>
                    <p className="gray-text leading-relaxed">{entry.blessing}</p>
                  </div>
                  
                  {entry.reflection && (
                    <div>
                      <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">
                        Reflection
                      </h4>
                      <p className="gray-text leading-relaxed italic">{entry.reflection}</p>
                    </div>
                  )}
                  
                  {entry.tags && (
                    <div>
                      <h4 className="text-sm font-medium orange-text orbitron-font uppercase tracking-wider mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-[#f97316]/10 text-[#f97316] rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
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
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -100px) scale(1.1); }
          66% { transform: translate(-30px, -200px) scale(0.9); }
          100% { transform: translate(0, -300px) scale(1); }
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
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, -50px); }
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
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.3; }
          25% { transform: translate(30px, -100px) scale(1.3) rotate(90deg); opacity: 0.7; }
          50% { transform: translate(-20px, -200px) scale(1.5) rotate(180deg); opacity: 0.8; }
          75% { transform: translate(40px, -300px) scale(1.2) rotate(270deg); opacity: 0.6; }
          100% { transform: translate(0, -400px) scale(1) rotate(360deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

