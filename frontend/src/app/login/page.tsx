"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email: string;
  password: string;
  general: string;
}

export default function Login() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    general: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors: FormErrors = { email: "", password: "", general: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error when user types
    if (name in errors) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use AuthContext login
      await login(formData.email, formData.password);
      
      // If remember me is checked, we could set a longer expiry
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      // No need to redirect here as the AuthContext will handle that
    } catch (error: unknown) {
      console.error("Login error:", error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen leather-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 gold-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold gold-text">Welcome Back</h1>
          <p className="mt-2 text-sm gold-text">
            "Be strong in the Lord and in his mighty power." — Ephesians 6:10
          </p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium gold-text">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 gold-input rounded-md shadow-sm focus:outline-none gold-focus`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium gold-text">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 gold-input rounded-md shadow-sm focus:outline-none gold-focus`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 gold-border focus:ring-gold-500 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm gold-text">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full flex justify-center py-2 px-4 gold-button rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading || authLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm gold-text">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium gold-text-hover">
              Join our community
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 