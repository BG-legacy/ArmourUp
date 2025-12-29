'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProgressInsight {
  id: number;
  user_id: number;
  period: string;
  summary: string;
  highlights: string;
  areas: string;
  verse: string;
  mood_stats: string;
  created_at: string;
  updated_at: string;
}

export default function ProgressInsightsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [insights, setInsights] = useState<ProgressInsight[]>([]); // Initialize insights state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [currentInsight, setCurrentInsight] = useState<ProgressInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureUnavailable, setFeatureUnavailable] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInsights();
    }
  }, [isAuthenticated]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights');
      
      if (!response.ok) {
        if (response.status === 503) {
          const data = await response.json();
          if (data.feature_unavailable) {
            setFeatureUnavailable(true);
            return;
          }
        }
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data || []);
      
      // Set current month as default
      const currentMonth = new Date().toISOString().slice(0, 7);
      setSelectedPeriod(currentMonth);
      
      // Try to load current month's insight
      if (data && data.length > 0) {
        const currentMonthInsight = data.find((i: ProgressInsight) => i.period === currentMonth);
        if (currentMonthInsight) {
          setCurrentInsight(currentMonthInsight);
        }
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async (period: string) => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insight');
      }

      const newInsight = await response.json();
      setCurrentInsight(newInsight);
      
      // Refresh insights list
      await fetchInsights();
    } catch (err: any) {
      console.error('Error generating insight:', err);
      setError(err.message || 'Failed to generate insight. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const loadInsightForPeriod = async (period: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/insights/period?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to load insight');
      }

      const insight = await response.json();
      setCurrentInsight(insight);
      setSelectedPeriod(period);
    } catch (err) {
      console.error('Error loading insight:', err);
      setCurrentInsight(null);
      setSelectedPeriod(period);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    
    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = date.toISOString().slice(0, 7);
      months.push({
        period,
        label: formatPeriod(period),
        hasInsight: insights.some(i => i.period === period)
      });
    }
    
    return months;
  };

  if (authLoading || loading) {
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
          <p className="mt-2 gray-text">Please wait while we load your insights.</p>
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

  if (featureUnavailable) {
    return (
      <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="animated-orb orb-1"></div>
          <div className="animated-orb orb-2"></div>
          <div className="animated-orb orb-3"></div>
          <div className="animated-grid"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="orange-card rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-orange-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold orange-text orbitron-font mb-4">
              Progress Insights Coming Soon
            </h2>
            <p className="text-lg gray-text mb-4">
              The AI-powered Progress Insights feature is currently being configured and will be available soon.
            </p>
            <p className="text-sm gray-text mb-6">
              This feature uses advanced AI to analyze your spiritual journey and provide personalized monthly insights, including mood trends, prayer patterns, and growth recommendations.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
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
        {/* Header */}
        <div className="orange-card rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-2">
                Progress Insights
              </h1>
              <p className="text-lg gray-text">
                AI-Generated Monthly Summaries of Your Spiritual Growth
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="orange-card rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Select a Month</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getAvailableMonths().map((month) => (
              <button
                key={month.period}
                onClick={() => loadInsightForPeriod(month.period)}
                className={`p-4 rounded-lg transition-all font-medium ${
                  selectedPeriod === month.period
                    ? 'bg-[#f97316] text-white'
                    : month.hasInsight
                    ? 'orange-card gray-text hover:bg-[#f97316]/20'
                    : 'orange-card gray-text/60 hover:bg-[#f97316]/10'
                }`}
              >
                <div className="font-semibold">{month.label}</div>
                {month.hasInsight && (
                  <div className="text-xs mt-1 opacity-75">Generated</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        {selectedPeriod && !currentInsight && !generating && (
          <div className="orange-card rounded-lg p-8 mb-8 text-center">
            <h3 className="text-2xl font-semibold orange-text orbitron-font mb-4">
              No insight available for {formatPeriod(selectedPeriod)}
            </h3>
            <p className="gray-text mb-6">
              Generate an AI-powered summary of your spiritual journey this month
            </p>
            <button
              onClick={() => generateInsight(selectedPeriod)}
              disabled={generating}
              className="px-8 py-4 orange-button rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating Insight...' : 'Generate Insight'}
            </button>
          </div>
        )}

        {/* Generating State */}
        {generating && (
          <div className="orange-card rounded-lg p-8 mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-[#f97316]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold orange-text orbitron-font mb-2">
              Generating Your Insight
            </h3>
            <p className="gray-text">
              Analyzing your spiritual journey for {formatPeriod(selectedPeriod)}...
            </p>
          </div>
        )}

        {/* Insight Display */}
        {currentInsight && !generating && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="orange-card rounded-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold orange-text orbitron-font">
                  {formatPeriod(currentInsight.period)} Summary
                </h2>
                <span className="text-sm gray-text mt-2 sm:mt-0">
                  Generated: {new Date(currentInsight.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="gray-text text-lg leading-relaxed whitespace-pre-line">
                {currentInsight.summary}
              </div>
            </div>

            {/* Highlights Card */}
            <div className="orange-card rounded-lg p-6 sm:p-8 border-l-4 border-green-500">
              <h3 className="text-xl sm:text-2xl font-semibold orange-text orbitron-font mb-4">
                Highlights
              </h3>
              <div className="gray-text leading-relaxed whitespace-pre-line">
                {currentInsight.highlights}
              </div>
            </div>

            {/* Areas for Growth Card */}
            <div className="orange-card rounded-lg p-6 sm:p-8 border-l-4 border-blue-500">
              <h3 className="text-xl sm:text-2xl font-semibold orange-text orbitron-font mb-4">
                Areas for Growth
              </h3>
              <div className="gray-text leading-relaxed whitespace-pre-line">
                {currentInsight.areas}
              </div>
            </div>

            {/* Bible Verse Card */}
            <div className="orange-card rounded-lg p-6 sm:p-8 border-l-4 border-yellow-500">
              <h3 className="text-xl sm:text-2xl font-semibold orange-text orbitron-font mb-4">
                Scripture for Your Journey
              </h3>
              <blockquote className="text-lg gray-text italic leading-relaxed pl-4 border-l-2 border-[#f97316]">
                {currentInsight.verse}
              </blockquote>
            </div>

            {/* Stats Card */}
            {currentInsight.mood_stats && (
              <div className="orange-card rounded-lg p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold orange-text orbitron-font mb-4">
                  Your Stats
                </h3>
                <p className="gray-text text-lg">{currentInsight.mood_stats}</p>
              </div>
            )}

            {/* Regenerate Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => generateInsight(selectedPeriod)}
                disabled={generating}
                className="px-6 py-3 orange-card rounded-lg font-semibold gray-text hover:bg-[#f97316]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Regenerating...' : 'Regenerate Insight'}
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 orange-button rounded-lg font-medium transition-all"
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
