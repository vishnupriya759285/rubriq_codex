"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useSession();

  // Mode: "signin" | "signup" | "reset"
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sign up state
  const [signupRole, setSignupRole] = useState<"teacher" | "student">("teacher");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupIdentifier, setSignupIdentifier] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSaving, setSignupSaving] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/auth/login", { email, password });
      const account = await refresh();
      if (!account) throw new Error("Your session could not be verified.");
      router.replace(account.role === "student" ? "/student" : "/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not sign you in. Please check your credentials.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupSaving(true);
    setSignupError("");
    try {
      await api.post("/api/auth/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        identifier: signupRole === "student" ? signupIdentifier : undefined,
      });
      const account = await refresh();
      if (!account) throw new Error("Account created but session could not be established.");
      router.replace(account.role === "student" ? "/student" : "/");
      router.refresh();
    } catch (err) {
      setSignupError(
        err instanceof Error
          ? err.message
          : "Could not create account. Please try again.",
      );
    } finally {
      setSignupSaving(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetting(true);
    setResetError("");
    setResetSuccess("");
    try {
      const res = await api.post<{ success: boolean; message: string }>("/api/auth/reset-password", {
        email: resetEmail,
        new_password: newPassword,
      });
      setResetSuccess(res.message || "Password updated successfully. You can now sign in.");
      setEmail(resetEmail);
      setPassword(newPassword);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 bg-cover bg-center bg-no-repeat selection:bg-[#0f4a3c]/15"
      style={{ backgroundImage: "url('/campus-bg.jpg')" }}
    >
      {/* Subtle daylight wash overlay to enhance readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-black/5 to-black/25 backdrop-blur-[2px] pointer-events-none" />

      {/* Main card */}
      <section className="relative z-10 w-full max-w-[480px] rounded-[28px] bg-white/95 backdrop-blur-md p-7 sm:p-9 shadow-[0_24px_60px_rgba(15,74,60,0.14),0_10px_25px_rgba(0,0,0,0.08)] border border-white/80 transition-all duration-300">
        <Link
          href="/"
          className="inline-block text-3xl font-bold tracking-[-0.03em] text-[#0f4a3c] hover:opacity-95 transition-opacity"
        >
          Rubriq
        </Link>

        {/* ------------------- SIGN IN MODE ------------------- */}
        {mode === "signin" && (
          <>
            <h1 className="mt-4 text-[32px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#141f1c] leading-tight">
              Welcome back.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#51625d]">
              Sign in to access your examination workspace, review submissions, and evaluate evidence.
            </p>

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e2925] mb-1.5">
                  Email
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@institution.ac.in"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:ring-2 focus:ring-[#0f4a3c]/15 focus:outline-none transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e2925] mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    required
                    minLength={1}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:ring-2 focus:ring-[#0f4a3c]/15 focus:outline-none transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 text-[#5e706b] hover:text-[#141f1c] transition-colors p-1 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setMode("reset");
                  }}
                  className="text-xs font-semibold text-[#0f4a3c] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-[#fbeeed] border border-[#f5c6cb] p-3.5 text-sm text-[#a43838] flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-[#a43838]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{String(error)}</span>
                </div>
              )}

              <button
                disabled={saving}
                type="submit"
                className="mt-2 w-full py-3.5 px-5 bg-[#0f4a3c] hover:bg-[#0b382d] active:scale-[0.99] text-white font-semibold text-[15px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  "Signing in..."
                ) : (
                  <>
                    <span>Sign in</span>
                    <span aria-hidden="true" className="text-lg leading-none">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign Up */}
            <div className="mt-5 text-center text-xs text-[#51625d]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSignupError("");
                  setMode("signup");
                }}
                className="font-semibold text-[#0f4a3c] hover:underline cursor-pointer ml-1"
              >
                Create an account
              </button>
            </div>
          </>
        )}

        {/* ------------------- SIGN UP MODE ------------------- */}
        {mode === "signup" && (
          <>
            <h1 className="mt-4 text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-[#141f1c] leading-tight">
              Create an account.
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#51625d]">
              Select your role and set up your Rubriq examination credentials.
            </p>

            <form onSubmit={handleSignUp} className="mt-5 space-y-3.5">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#51625d] mb-2">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Teacher Card */}
                  <button
                    type="button"
                    onClick={() => setSignupRole("teacher")}
                    className={`p-3.5 rounded-2xl text-left transition-all border-2 cursor-pointer ${
                      signupRole === "teacher"
                        ? "border-[#0f4a3c] bg-[#e5f0ec]/70 text-[#0f4a3c] shadow-xs"
                        : "border-[#d8e2de] bg-[#f8faf9] text-[#51625d] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span className="font-bold text-sm">Teacher</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug opacity-80">
                      Upload papers, formulate rubrics & evaluate
                    </p>
                  </button>

                  {/* Student Card */}
                  <button
                    type="button"
                    onClick={() => setSignupRole("student")}
                    className={`p-3.5 rounded-2xl text-left transition-all border-2 cursor-pointer ${
                      signupRole === "student"
                        ? "border-[#0f4a3c] bg-[#e5f0ec]/70 text-[#0f4a3c] shadow-xs"
                        : "border-[#d8e2de] bg-[#f8faf9] text-[#51625d] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-bold text-sm">Student</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug opacity-80">
                      Access released results & mastery feedback
                    </p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    required
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={signupRole === "teacher" ? "Prof. Vishnu Priya" : "Student Name"}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    required
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@institution.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Student Identifier / Roll Number (only for student) */}
              {signupRole === "student" && (
                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Student ID / Roll Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={signupIdentifier}
                      onChange={(e) => setSignupIdentifier(e.target.value)}
                      placeholder="e.g. 224770 or STU-001"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5e706b] pointer-events-none flex items-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    required
                    minLength={1}
                    type={signupShowPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm placeholder-[#94a39f] focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setSignupShowPassword(!signupShowPassword)}
                    aria-label={signupShowPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 text-[#5e706b] hover:text-[#141f1c] transition-colors p-1 cursor-pointer focus:outline-none"
                  >
                    {signupShowPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {signupError && (
                <div className="rounded-xl bg-[#fbeeed] border border-[#f5c6cb] p-3 text-xs text-[#a43838]">
                  {signupError}
                </div>
              )}

              <button
                disabled={signupSaving}
                type="submit"
                className="mt-2 w-full py-3.5 px-5 bg-[#0f4a3c] hover:bg-[#0b382d] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {signupSaving ? (
                  "Creating account..."
                ) : (
                  <>
                    <span>Create {signupRole === "teacher" ? "Teacher" : "Student"} Account</span>
                    <span aria-hidden="true" className="text-base leading-none">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign In */}
            <div className="mt-4 text-center text-xs text-[#51625d]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSignupError("");
                  setMode("signin");
                }}
                className="font-semibold text-[#0f4a3c] hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </div>
          </>
        )}

        {/* ------------------- RESET PASSWORD MODE ------------------- */}
        {mode === "reset" && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#141f1c]">
                Reset password
              </h2>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-xs font-semibold text-[#51625d] hover:text-[#141f1c] cursor-pointer"
              >
                ← Back
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#51625d]">
              Enter your account email and choose a new password.
            </p>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e2925] mb-1.5">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@institution.ac.in"
                  className="w-full px-4 py-3 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e2925] mb-1.5">
                  New Password
                </label>
                <input
                  required
                  minLength={1}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-[#141f1c] text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none transition-all"
                />
              </div>

              {resetSuccess && (
                <div className="rounded-xl bg-[#eaf3f0] border border-[#b2dfdb] p-3 text-sm text-[#0f4a3c]">
                  {resetSuccess}
                </div>
              )}

              {resetError && (
                <div className="rounded-xl bg-[#fbeeed] border border-[#f5c6cb] p-3 text-sm text-[#a43838]">
                  {resetError}
                </div>
              )}

              <button
                disabled={resetting}
                type="submit"
                className="w-full py-3.5 px-5 bg-[#0f4a3c] hover:bg-[#0b382d] text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {resetting ? "Updating..." : "Update password"}
              </button>

              {resetSuccess && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#0f4a3c] hover:underline cursor-pointer"
                >
                  Return to Sign in →
                </button>
              )}
            </form>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#51625d] font-medium">
          <svg className="w-3.5 h-3.5 text-[#0f4a3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure examination workspace</span>
        </div>
      </section>
    </main>
  );
}
