"use client";

import { useState } from "react";
import { useAuth, mapFirebaseAuthError } from "@/context/AuthContext";

type AuthMode = "login" | "signup" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (!email.trim()) {
        setError("Please enter your email.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        return;
      }

      setLoading(true);
      try {
        await signUpWithEmail(email, password, name);
        onSuccess?.();
        onClose();
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === "login") {
      if (!email.trim() || !password) {
        setError("Please enter both your email and password.");
        return;
      }

      setLoading(true);
      try {
        await signInWithEmail(email, password);
        onSuccess?.();
        onClose();
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address to receive reset instructions.");
        return;
      }

      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMessage(
          "Password reset email sent! Please check your inbox and follow the instructions."
        );
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="saas-card max-w-md w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#090b10] shadow-2xl relative my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
              🎬
            </div>
            <span className="font-bold text-white text-base">VideoMind AI</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Your Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {mode === "login" && "Log in to access your video notes, chat, and summaries."}
            {mode === "signup" && "Start transforming YouTube videos into instant knowledge."}
            {mode === "forgot" && "Enter your email to receive a password reset link."}
          </p>
        </div>

        {/* Configuration Notice if env is missing */}
        {!isConfigured && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs leading-relaxed flex items-start gap-2">
            <span>ℹ️</span>
            <div>
              <strong>Firebase setup required:</strong> Add your Firebase configuration keys to <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">.env.local</code>.
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2">
            <span>✓</span>
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Google Authentication (Only for login and signup) */}
        {mode !== "forgot" && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {/* Google G Logo */}
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
            <div className="flex items-center my-5 text-slate-500 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-3 uppercase tracking-wider text-[10px]">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-xs font-medium">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-[#00F59B] text-[11px] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
              />
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Please wait...</span>
              </span>
            ) : mode === "login" ? (
              "Login"
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/5 pt-4">
          {mode === "login" && (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-[#00F59B] font-semibold hover:underline ml-1"
              >
                Create account
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-[#00F59B] font-semibold hover:underline ml-1"
              >
                Login
              </button>
            </p>
          )}

          {mode === "forgot" && (
            <p>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-[#00F59B] font-semibold hover:underline ml-1"
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
