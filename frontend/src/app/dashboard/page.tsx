"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If user is not authenticated and loading is finished, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen dark-background overflow-hidden">
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
        <div className="relative z-10 text-center orange-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold orange-text orbitron-font">Loading...</h2>
          <p className="mt-2 gray-text">Please wait while we load your account information.</p>
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
  
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="relative min-h-screen dark-background p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Animated Background Effects - Landing Page Style Moving Upward */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated gradient orbs */}
        <div className="animated-orb orb-1"></div>
        <div className="animated-orb orb-2"></div>
        <div className="animated-orb orb-3"></div>
        
        {/* Animated grid pattern */}
        <div className="animated-grid"></div>
        
        {/* Floating particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="orange-card rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold orange-text orbitron-font mb-2">
                Welcome, {user?.username}!
              </h1>
              <p className="text-lg gray-text opacity-90">
                &ldquo;Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.&rdquo;
                <br />— Joshua 1:9
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="mt-4 sm:mt-0 px-6 py-2 orange-button rounded-lg font-medium transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Encouragement Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/encourage')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Daily Encouragement</h2>
            <p className="gray-text mb-4 text-lg">
              &ldquo;The Lord is my strength and my shield; my heart trusts in him, and he helps me.&rdquo;
              <br />— Psalm 28:7
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">Read Today's Encouragement</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Prayer Wall Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/prayer-wall')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Prayer Wall</h2>
            <p className="gray-text mb-4 text-lg">
              Share anonymous prayer requests and pray for others in the community. Together we lift each other up.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">Visit Prayer Wall</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Prayer Chains Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/prayer-chains')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Prayer Chains</h2>
            <p className="gray-text mb-4 text-lg">
              Create groups where members commit to pray for each other. Join a chain and commit to praying for fellow members.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">View Prayer Chains</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Prayer Journal Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/history')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Prayer Journal</h2>
            <p className="gray-text mb-4 text-lg">
              Reflect on your spiritual journey and see how God has been working in your life through your prayers.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">View Prayer History</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Mood Tracker Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/mood-tracker')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Mood Tracker</h2>
            <p className="gray-text mb-4 text-lg">
              Track your daily emotional and spiritual well-being. Reflect on your journey and see how you&apos;re growing over time.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">Log Today&apos;s Mood</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Gratitude Journal Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/gratitude-journal')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Gratitude Journal</h2>
            <p className="gray-text mb-4 text-lg">
              Count your blessings and record daily moments of gratitude. Give thanks in all circumstances and see God&apos;s faithfulness.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">Record Your Blessings</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Progress Insights Card */}
          <div 
            className="orange-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all border-orange-500/30"
            onClick={() => router.push('/progress-insights')}
          >
            <h2 className="text-2xl font-semibold orange-text orbitron-font mb-4">Progress Insights</h2>
            <p className="gray-text mb-4 text-lg">
              Get AI-generated monthly summaries of your spiritual growth. See how God is working in your life through your journey.
            </p>
            <div className="flex items-center gray-text hover:text-[#f97316] transition-colors">
              <span className="font-medium text-lg">View Your Insights</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Landing Page Style Animations - Moving Upward */}
      <style jsx>{`
        /* Animated Gradient Orbs */
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

        /* Animated Grid */
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

        /* Floating Particles */
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