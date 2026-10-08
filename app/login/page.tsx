"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, mapFirebaseAuthError } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/app";

  const { user, signInWithGoogle, signInWithEmail, resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // If already logged in, redirect to intended service page
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectUrl);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(null);

    if (forgotMode) {
      if (!email.trim()) {
        setError("Please enter your email to receive a password reset link.");
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setForgotSuccess("Password reset email sent! Please check your inbox.");
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push(redirectUrl);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg subtle-grid flex flex-col justify-center items-center px-4 py-12 selection:bg-[#00F59B] selection:text-black">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] text-lg green-glow-subtle group-hover:scale-105 transition-transform">
          🎬
        </div>
        <span className="text-white font-extrabold text-2xl tracking-tight">
          VideoMind <span className="text-[#00F59B]">AI</span>
        </span>
      </Link>

      <div className="saas-card max-w-md w-full p-8 md:p-10 rounded-3xl border border-white/10 bg-[#090b10] shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {forgotMode ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-slate-400 text-xs mt-1.5">
            {forgotMode
              ? "Enter your email to receive password reset instructions"
              : "Log in to continue to VideoMind AI"}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2">
            <span>ℹ️</span>
            <div>
              <strong>Firebase setup:</strong> Add your credentials in <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">.env.local</code>.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {forgotSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2">
            <span>✓</span>
            <div className="flex-1 leading-relaxed">{forgotSuccess}</div>
          </div>
        )}

        {!forgotMode && (
          <>
            {/* Google Authentication */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-6 text-slate-500 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-3 uppercase tracking-wider text-[10px]">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
            />
          </div>

          {!forgotMode && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 text-xs font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setError(null);
                  }}
                  className="text-[#00F59B] text-[11px] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Please wait...</span>
              </span>
            ) : forgotMode ? (
              "Send Reset Link"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/5 pt-5">
          {forgotMode ? (
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError(null);
              }}
              className="text-[#00F59B] font-semibold hover:underline"
            >
              ← Back to Login
            </button>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                className="text-[#00F59B] font-semibold hover:underline ml-1"
              >
                Create Account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06070a] flex items-center justify-center text-slate-400 text-sm">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
