"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const email = user.email || "";
  const photoURL = user.photoURL;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setMenuOpen(false);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F59B]/40 transition-all text-xs text-white"
        title="Open account menu"
      >
        {photoURL ? (
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#00F59B]/50 flex-shrink-0">
            <Image
              src={photoURL}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#00F59B]/20 text-[#00F59B] border border-[#00F59B]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initial}
          </div>
        )}
        <span className="font-medium max-w-[120px] truncate hidden sm:inline">
          {displayName}
        </span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl saas-card bg-[#0b0e14]/95 backdrop-blur-xl border border-white/10 p-3 shadow-2xl z-50 animate-fade-in text-xs">
          {/* User info preview */}
          <div className="p-2 border-b border-white/5 mb-2">
            <div className="font-bold text-white text-sm truncate">{displayName}</div>
            <div className="text-slate-400 truncate text-[11px] mt-0.5">{email}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00F59B]/10 text-[#00F59B] text-[10px] font-semibold border border-[#00F59B]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B]" />
              {photoURL ? "Google Account" : "Email Account"}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setProfileModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2.5"
            >
              <span>👤</span>
              <span>User Profile</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 disabled:opacity-50"
            >
              <span>🚪</span>
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Simple User Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="saas-card max-w-sm w-full p-6 rounded-2xl border border-white/10 bg-[#0b0e14] relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center gap-3 mb-6">
              {photoURL ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00F59B] green-glow-subtle">
                  <Image
                    src={photoURL}
                    alt={displayName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#00F59B]/10 text-[#00F59B] border-2 border-[#00F59B] flex items-center justify-center text-2xl font-bold green-glow-subtle">
                  {initial}
                </div>
              )}

              <div>
                <h3 className="text-white font-bold text-lg">{displayName}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{email}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-500">Sign-in Method</span>
                <span className="text-slate-200 font-medium">
                  {photoURL ? "Google" : "Email & Password"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-500">Account Status</span>
                <span className="text-[#00F59B] font-semibold flex items-center gap-1">
                  <span>✓</span> Active
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Email Verified</span>
                <span className="text-slate-300">
                  {user.emailVerified ? "Yes (Verified)" : "Not required"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="btn-secondary w-full text-xs py-2.5"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  handleLogout();
                }}
                className="w-full text-xs py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
