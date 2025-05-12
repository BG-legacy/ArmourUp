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
  const { user, isLoading, isAuthenticated } = useAuth();
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
  const extractStruggle = (message: string, entry: EncouragementEntry): string => {
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
    if (entry.struggle && entry.struggle !== entry.message) {
      return entry.struggle;
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
  const extractEncouragement = (message: string, entry: EncouragementEntry): string => {
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
      <div className="flex items-center justify-center min-h-screen leather-background">
        <div className="text-center gold-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold gold-text">Loading...</h2>
          <p className="mt-2 gold-text">Please wait while we load your history.</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen leather-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="gold-card rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold gold-text mb-6">Your Journey</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 gold-text">Growth History</h2>
            <p className="gold-text mb-4">Review your past struggles, Bible verses, and words of encouragement that have helped you grow.</p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {encouragements.length === 0 && !isLoadingEntries && !error ? (
            <div className="text-center py-12 border border-gold-500/30 rounded-lg">
              <p className="gold-text mb-4">You haven't saved any struggles or encouragements yet.</p>
              <button
                onClick={() => router.push('/encourage')}
                className="px-6 py-3 gold-button rounded-lg text-black font-medium hover:bg-[#FFC000] transition-all"
              >
                Get Started with Daily Encouragement
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {encouragements.map((entry) => (
                <div key={entry.id} className="gold-card rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <div className="border-b border-gold-500/30 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium gold-text">
                          {entry.message && entry.message.includes('Struggle:') 
                            ? 'Saved Encouragement' 
                            : entry.type === 'struggle' 
                              ? 'Spiritual Encouragement' 
                              : 'Encouragement'}
                        </h3>
                        {entry.category && (
                          <span className="text-xs gold-text/70 mt-1">{entry.category}</span>
                        )}
                      </div>
                      <span className="text-sm gold-text/70">{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium gold-text uppercase tracking-wider mb-2">Your Struggle</h4>
                      <p className="gold-card p-3 rounded-lg gold-text">
                        {extractStruggle(entry.message, entry) || "What you were struggling with"}
                      </p>
                    </div>
                    
                    {entry.verse && (
                      <div>
                        <h4 className="text-sm font-medium gold-text uppercase tracking-wider mb-2">Bible Verse</h4>
                        <p className="gold-card p-3 rounded-lg gold-text">{entry.verse}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium gold-text uppercase tracking-wider mb-2">Encouragement</h4>
                      <p className="gold-card p-3 rounded-lg gold-text">
                        {extractEncouragement(entry.message, entry) || "Words of encouragement"}
                      </p>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4 border-t border-gold-500/30 pt-4">
                        <details>
                          <summary className="text-xs gold-text/70 cursor-pointer">Debug Info</summary>
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
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/encourage')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Daily Encouragement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 