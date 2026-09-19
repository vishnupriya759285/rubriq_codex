"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";

type Evaluation = {
  id: string;
  question_number: string;
  criterion_title: string;
  max_marks: number;
  marks: number;
  reason: string;
  confidence?: number;
  needs_review: boolean;
  evidence?: { page?: number | null; quote?: string }[];
};

type Submission = {
  id: string;
  exam_id?: string;
  exam_title: string;
  subject: string;
  status: string;
  total_score: number;
  total_marks: number;
  percentage?: number;
  created_at: string;
  released_at?: string;
  evaluations: Evaluation[];
};

type Profile = {
  student: {
    id: string;
    name: string;
    identifier: string;
    class_id?: string;
    classes?: { id: string; name: string }[];
  };
  concepts: { concept: string; mastery: number }[];
  strengths: string[];
  developing: string[];
  submissions?: Submission[];
};

export default function StudentPortal() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { account, refresh } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!account || account.must_change_password) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError("");
    setLoading(true);

    Promise.all([
      api.get<Profile>("/api/student/profile").catch(() => null),
      api.get<Submission[]>("/api/student/submissions").catch(() => []),
    ])
      .then(([nextProfile, nextSubmissions]) => {
        if (cancelled) return;
        const subList = nextSubmissions?.length
          ? nextSubmissions
          : nextProfile?.submissions ?? [];

        setProfile(nextProfile);
        setSubmissions(subList);
        if (subList.length > 0) {
          setSelected(subList[0]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Your assessment results could not be loaded. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [account?.id, account?.must_change_password]);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);
    setError("");
    try {
      await api.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your password could not be updated.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // Derived metrics
  const avgPercentage = submissions.length
    ? Math.round(
        submissions.reduce(
          (acc, sub) =>
            acc +
            (sub.total_marks ? (sub.total_score / sub.total_marks) * 100 : 0),
          0,
        ) / submissions.length,
      )
    : 0;

  const totalEvaluations = submissions.reduce(
    (acc, sub) => acc + (sub.evaluations?.length || 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#141f1c]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#d8e2de] bg-white/95 backdrop-blur-md px-5 py-3.5 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="text-xl font-bold tracking-[-0.03em] text-[#0f4a3c] hover:opacity-95 transition-opacity"
            >
              Rubriq
            </Link>
            <span className="hidden sm:inline-block rounded-full bg-[#e5f0ec] px-2.5 py-0.5 text-xs font-semibold text-[#0f4a3c]">
              Student Workspace
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link href="/student" className="font-semibold text-[#0f4a3c] border-b-2 border-[#0f4a3c] pb-0.5">
              Dashboard
            </Link>
            <Link href="/student/network" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
              Campus Network
            </Link>
            <Link href="/student/questions" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
              Campus Q&A
            </Link>
            <Link href="/student/connections" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
              My Connections
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#141f1c]">
                {profile?.student.name ?? account?.name ?? "Student"}
              </span>
              <span className="text-xs text-[#51625d]">
                ID: {profile?.student.identifier ?? account?.email}
              </span>
            </div>
            <AccountControl />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Force Password Change Prompt if required */}
        {account?.must_change_password && (
          <section className="mb-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#d8e2de] max-w-2xl">
            <div className="flex items-center gap-3 text-[#0f4a3c] mb-2">
              <svg
                className="w-6 h-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h2 className="text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                Set your personal password
              </h2>
            </div>
            <p className="text-sm text-[#51625d] leading-relaxed">
              Your teacher created your account with a temporary password. Choose a new, secure password to access your examination records.
            </p>

            {passwordSuccess && (
              <div className="mt-4 rounded-xl bg-[#e5f0ec] p-3.5 text-sm text-[#0f4a3c] font-medium">
                Password updated successfully! Redirecting...
              </div>
            )}

            <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                  Temporary password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  type="password"
                  minLength={1}
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Temporary password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                  New password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  type="password"
                  minLength={1}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                />
              </div>
              <button
                disabled={changingPassword}
                className="sm:col-span-2 py-3 px-6 bg-[#0f4a3c] hover:bg-[#0b382d] text-white font-medium text-sm rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                type="submit"
              >
                {changingPassword ? "Updating password..." : "Save password & Continue"}
              </button>
            </form>
          </section>
        )}

        {/* Welcome Banner & KPI Stats */}
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-[#0f4a3c] via-[#115243] to-[#0a382d] text-white p-7 sm:p-9 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-white border border-white/25">
                Student Assessment Evidence
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
                {profile?.student.name ?? account?.name ?? "Welcome to Rubriq"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
                Review your graded examination papers, teacher marks breakdown, and AI rubric feedback.
              </p>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 shrink-0">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <span className="block text-xs font-medium text-emerald-100 uppercase tracking-wider">
                  Average
                </span>
                <span className="mt-1 block text-2xl sm:text-3xl font-bold text-white">
                  {avgPercentage}%
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <span className="block text-xs font-medium text-emerald-100 uppercase tracking-wider">
                  Evaluated
                </span>
                <span className="mt-1 block text-2xl sm:text-3xl font-bold text-white">
                  {submissions.length}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <span className="block text-xs font-medium text-emerald-100 uppercase tracking-wider">
                  Criteria
                </span>
                <span className="mt-1 block text-2xl sm:text-3xl font-bold text-white">
                  {totalEvaluations}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Connect · Practical Skill & Project Network Gateway */}
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-white via-[#fafcfb] to-[#f0f6f3] border border-[#d2e0db] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#0f4a3c]/5 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f0ec] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0f4a3c]">
                  <span>⚡</span>
                  <span>Campus Connect · Skill Network</span>
                </span>
                <span className="text-xs text-[#0f4a3c] font-medium bg-[#e5f0ec]/70 px-2.5 py-0.5 rounded-full border border-[#c6dfd6]">
                  Practical Mentorship
                </span>
              </div>
              <h2 className="mt-2.5 text-xl sm:text-2xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                Level up practical skills beyond exams
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#51625d] max-w-xl leading-relaxed">
                Connect with verified faculty, seniors, and alumni to master real-world tech stacks, build portfolio projects, and turn theoretical learning into hands-on competency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/student/network"
                className="py-2.5 px-4 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Find Skill Mentor</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/student/questions"
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f0f5f3] text-[#0f4a3c] text-xs sm:text-sm font-semibold border border-[#d4e1dc] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>Skill Q&A</span>
              </Link>
              <Link
                href="/student/connections"
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f0f5f3] text-[#141f1c] text-xs sm:text-sm font-semibold border border-[#d4e1dc] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🤝</span>
                <span>My Mentors</span>
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl bg-[#fbeeed] border border-[#f5c6cb] p-4 text-sm text-[#a43838] flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="font-semibold underline hover:opacity-80 ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Master-Detail: Submissions List & Detailed Breakdown */}
        <div className="grid gap-7 lg:grid-cols-[1fr_1.35fr]">
          {/* Left Column: Submissions List */}
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                Released Examinations
              </h2>
              <span className="text-xs font-semibold text-[#51625d] bg-[#eef3f1] px-2.5 py-1 rounded-full">
                {submissions.length} available
              </span>
            </div>

            <div className="rounded-2xl bg-white border border-[#d8e2de] shadow-xs overflow-hidden divide-y divide-[#e8eeec]">
              {loading && (
                <div className="p-8 text-center text-sm text-[#51625d]">
                  Loading your assessment submissions...
                </div>
              )}

              {!loading && !submissions.length && (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#e5f0ec] flex items-center justify-center text-[#0f4a3c] mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-base text-[#141f1c]">No released exams yet</h3>
                  <p className="mt-1 text-sm text-[#51625d] max-w-xs mx-auto">
                    Once your teacher completes reviewing and releases an exam, your score and evidence will appear here.
                  </p>
                </div>
              )}

              {submissions.map((submission) => {
                const isSelected = selected?.id === submission.id;
                const percentage = submission.total_marks
                  ? Math.round((submission.total_score / submission.total_marks) * 100)
                  : 0;

                return (
                  <button
                    type="button"
                    key={submission.id}
                    onClick={() => setSelected(submission)}
                    className={`block w-full p-4 sm:p-5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e5f0ec]/70 border-l-4 border-l-[#0f4a3c]"
                        : "hover:bg-[#f8faf9]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#141f1c] text-base leading-snug">
                          {submission.exam_title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#51625d]">
                          <span className="font-medium text-[#0f4a3c] bg-[#e5f0ec] px-2 py-0.5 rounded-md">
                            {submission.subject}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(submission.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[15px] font-semibold text-[#0d1a16] tracking-[-0.015em]">
                          {submission.total_score}
                          <span className="text-xs text-[#51625d] font-sans font-normal">
                            /{submission.total_marks}
                          </span>
                        </span>
                        <span
                          className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            percentage >= 80
                              ? "bg-[#e5f0ec] text-[#0f4a3c]"
                              : percentage >= 60
                              ? "bg-[#fff2e7] text-[#9d552d]"
                              : "bg-[#fbeeed] text-[#a43838]"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right Column: Selected Examination Evidence */}
          <section>
            <SubmissionEvidence selected={selected} />
          </section>
        </div>

        {/* Subject Mastery & Learning Profile */}
        <section className="mt-10 rounded-3xl bg-white border border-[#d8e2de] p-7 sm:p-8 shadow-xs">
          <div className="border-b border-[#e8eeec] pb-5 mb-6">
            <h2 className="text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
              Learning Profile & Subject Mastery
            </h2>
            <p className="mt-1 text-sm text-[#51625d]">
              Tracks concept mastery extracted directly from your handwritten assessment answers.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl bg-[#f8faf9] p-5 border border-[#e2e8e5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f4a3c] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0f4a3c]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Demonstrated Strengths
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile?.strengths?.length ? (
                  profile.strengths.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-[#e5f0ec] px-3 py-1 text-xs font-semibold text-[#0f4a3c]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#51625d]">
                    No strengths recorded yet. Take an assessment to unlock insights.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8faf9] p-5 border border-[#e2e8e5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9d552d] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#9d552d]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Concepts to Practice
              </h3>
              <div className="mt-3 space-y-2.5">
                {profile?.developing?.length ? (
                  profile.developing.map((item) => (
                    <div
                      key={item}
                      className="p-3 rounded-xl bg-white border border-[#e8eeec] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <span className="font-semibold text-sm text-[#141f1c] block">
                          {item}
                        </span>
                        <span className="text-[11px] text-[#9d552d] font-medium">
                          Identified gap from assessment · Build hands-on mastery
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(item)}`}
                          className="py-1.5 px-2.5 rounded-lg bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Build Practical Skill</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(item)}&practice=ai`}
                          className="py-1.5 px-2.5 rounded-lg bg-[#e5f0ec] hover:bg-[#d5e7e1] text-[#0f4a3c] text-xs font-semibold transition-all cursor-pointer"
                        >
                          Practice with AI
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#51625d]">
                    Great work! No concepts currently flagged for extra practice.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bars for Concept Mastery */}
          {profile?.concepts?.length ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#141f1c]">
                Concept Breakdown
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.concepts.map((concept) => (
                  <div
                    key={concept.concept}
                    className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e8eeec]"
                  >
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="font-medium text-[#141f1c]">
                        {concept.concept}
                      </span>
                      <span className="font-bold text-[#0f4a3c] font-mono text-xs">
                        {concept.mastery}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8e5]">
                      <div
                        className="h-full rounded-full bg-[#0f4a3c] transition-all duration-500"
                        style={{ width: `${Math.min(concept.mastery, 100)}%` }}
                      />
                    </div>
                    {concept.mastery < 75 && (
                      <div className="mt-2.5 pt-2 border-t border-[#eef3f1] flex items-center justify-between">
                        <span className="text-[11px] text-[#9d552d] font-medium">Foundational gap · Level up</span>
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(concept.concept)}`}
                          className="text-xs font-semibold text-[#0f4a3c] hover:underline flex items-center gap-1"
                        >
                          <span>Build Skill →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function SubmissionEvidence({ selected }: { selected: Submission | null }) {
  if (!selected) {
    return (
      <div className="rounded-2xl bg-white border border-[#d8e2de] p-8 text-center text-[#51625d]">
        <p className="text-sm">Select an exam on the left to see criterion feedback.</p>
      </div>
    );
  }

  const percentage = selected.total_marks
    ? Math.round((selected.total_score / selected.total_marks) * 100)
    : 0;

  return (
    <div className="rounded-3xl bg-white border border-[#d8e2de] shadow-xs overflow-hidden">
      {/* Evidence Card Header */}
      <div className="border-b border-[#e8eeec] p-6 bg-gradient-to-r from-[#f9fbfa] to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#0f4a3c] uppercase tracking-wider">
              {selected.subject}
            </span>
            <h2 className="text-xl font-bold text-[#0d1a16] mt-1 tracking-[-0.025em]">
              {selected.exam_title}
            </h2>
            <p className="text-xs text-[#51625d] mt-1">
              Released on{" "}
              {selected.released_at
                ? new Date(selected.released_at).toLocaleDateString()
                : new Date(selected.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-2xl bg-[#e5f0ec] px-4 py-2.5 text-center shrink-0 border border-[#cbe2da]">
            <span className="block text-xl font-bold text-[#0f4a3c] tracking-[-0.025em]">
              {selected.total_score}/{selected.total_marks}
            </span>
            <span className="block text-[11px] font-semibold text-[#0f4a3c] uppercase tracking-wide">
              {percentage}% Final Score
            </span>
          </div>
        </div>
      </div>

      {/* Criterion-by-criterion List */}
      <div className="divide-y divide-[#e8eeec] max-h-[680px] overflow-y-auto">
        {selected.evaluations?.map((evaluation, idx) => {
          const fullMarks = evaluation.marks === evaluation.max_marks;
          const zeroMarks = evaluation.marks === 0;

          return (
            <article key={evaluation.id || idx} className="p-5 sm:p-6 hover:bg-[#fbfcfb] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#eef3f1] font-mono font-bold text-xs text-[#141f1c]">
                    {evaluation.question_number || `Q${idx + 1}`}
                  </span>
                  <h3 className="font-semibold text-sm sm:text-base text-[#141f1c]">
                    {evaluation.criterion_title}
                  </h3>
                </div>

                <span
                  className={`font-mono text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    fullMarks
                      ? "bg-[#e5f0ec] text-[#0f4a3c]"
                      : zeroMarks
                      ? "bg-[#fbeeed] text-[#a43838]"
                      : "bg-[#fff2e7] text-[#9d552d]"
                  }`}
                >
                  {evaluation.marks} / {evaluation.max_marks} marks
                </span>
              </div>

              {evaluation.reason && (
                <div className="mt-3 rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2e8e5] text-xs sm:text-sm text-[#384643] leading-relaxed">
                  <span className="font-semibold text-[#0f4a3c] block mb-0.5">
                    Rubriq AI Evaluation Rationale:
                  </span>
                  {evaluation.reason}
                </div>
              )}

              {evaluation.evidence?.length ? (
                <div className="mt-3 space-y-1.5">
                  {evaluation.evidence.map((ev, evIdx) => (
                    <div
                      key={evIdx}
                      className="text-xs text-[#51625d] flex items-center gap-1.5 bg-[#f3f7f5] px-3 py-1.5 rounded-lg"
                    >
                      <svg className="w-3.5 h-3.5 text-[#0f4a3c] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      {ev.page ? <span className="font-semibold">Page {ev.page}:</span> : null}
                      <span className="italic truncate">"{ev.quote}"</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
