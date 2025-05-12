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
      <div className="flex items-center justify-center min-h-screen leather-background">
        <div className="text-center gold-card p-8 rounded-lg">
          <h2 className="text-xl font-semibold gold-text">Loading...</h2>
          <p className="mt-2 gold-text">Please wait while we load your account information.</p>
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
        {/* Header Section */}
        <div className="gold-card rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold gold-text mb-2">
                Welcome, {user?.username}!
              </h1>
              <p className="text-lg gold-text opacity-80">
                "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."
                <br />— Joshua 1:9
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="mt-4 sm:mt-0 px-6 py-2 gold-button rounded-lg text-black font-medium hover:bg-[#FFC000] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Encouragement Card */}
          <div 
            className="gold-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all"
            onClick={() => router.push('/encourage')}
          >
            <h2 className="text-2xl font-semibold gold-text mb-4">Daily Encouragement</h2>
            <p className="gold-text mb-4 text-lg">
              "The Lord is my strength and my shield; my heart trusts in him, and he helps me."
              <br />— Psalm 28:7
            </p>
            <div className="flex items-center gold-text hover:opacity-80 transition-opacity">
              <span className="font-medium text-lg">Read Today's Encouragement</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Prayer Journal Card */}
          <div 
            className="gold-card rounded-lg p-6 cursor-pointer transform hover:scale-[1.02] transition-all"
            onClick={() => router.push('/history')}
          >
            <h2 className="text-2xl font-semibold gold-text mb-4">Prayer Journal</h2>
            <p className="gold-text mb-4 text-lg">
              Reflect on your spiritual journey and see how God has been working in your life through your prayers.
            </p>
            <div className="flex items-center gold-text hover:opacity-80 transition-opacity">
              <span className="font-medium text-lg">View Prayer History</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 