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
  const { user, isLoading, isAuthenticated } = useAuth();
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
      <div className="flex items-center justify-center min-h-screen leather-background">
        <div className="text-center gold-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold gold-text">Loading...</h2>
          <p className="mt-2 gold-text">Please wait while we load your account information.</p>
        </div>
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
    <div className="min-h-screen leather-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="gold-card rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold gold-text mb-6">Daily Encouragement</h1>
          
          {!encouragement ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="struggle" className="block text-xl font-medium gold-text mb-3">
                  What are you struggling with?
                </label>
                <textarea
                  id="struggle"
                  value={struggle}
                  onChange={(e) => setStruggle(e.target.value)}
                  className="w-full p-4 gold-input rounded-lg focus:outline-none gold-focus text-lg"
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
                  className="w-full py-3 px-4 gold-button rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all flex justify-center items-center"
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
              <div className="gold-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold gold-text mb-4">Bible Verse</h2>
                <p className="gold-text text-lg">
                  <TypewriterText text={encouragement.verse} delay={50} />
                </p>
              </div>
              
              <div className="gold-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold gold-text mb-4">Words of Encouragement</h2>
                <p className="gold-text text-lg">
                  <TypewriterText text={encouragement.message} delay={30} />
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  onClick={() => setEncouragement(null)}
                  className="py-2 px-6 gold-button rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all"
                >
                  Get Another Encouragement
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`py-2 px-6 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all flex items-center justify-center ${
                    saveSuccess
                      ? "bg-[#FFD700] text-black"
                      : "gold-button text-black"
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
              className="px-6 py-2 gold-button rounded-lg text-black font-medium hover:bg-[#FFC000] transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 