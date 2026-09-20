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
          : (nextProfile?.submissions ?? []);

        setProfile(nextProfile);
        setSubmissions(subList);
        if (subList.length > 0) {
          setSelected(subList[0]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Your assessment results could not be loaded. Please try again.",
          );
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
    <main className="min-h-screen bg-[#f2f3ef] text-[#14201c]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#dfe3de] bg-white/95 backdrop-blur-md px-5 py-3.5 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="text-xl font-bold tracking-[-0.03em] text-[#17634e] hover:opacity-95 transition-opacity"
            >
              Rubriq
            </Link>
            <span className="hidden sm:inline-block rounded-full bg-[#dcebe4] px-2.5 py-0.5 text-xs font-semibold text-[#17634e]">
              Student Workspace
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/student"
              className="font-semibold text-[#17634e] border-b-2 border-[#17634e] pb-0.5"
            >
              Dashboard
            </Link>
            <Link
              href="/student/network"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              Campus Network
            </Link>
            <Link
              href="/student/questions"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              Campus Q&A
            </Link>
            <Link
              href="/student/connections"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              My Connections
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#14201c]">
                {profile?.student.name ?? account?.name ?? "Student"}
              </span>
              <span className="text-xs text-[#697770]">
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
          <section className="mb-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#dfe3de] max-w-2xl">
            <div className="flex items-center gap-3 text-[#17634e] mb-2">
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
              <h2 className="text-xl font-bold text-[#14201c] tracking-[-0.025em]">
                Set your personal password
              </h2>
            </div>
            <p className="text-sm text-[#697770] leading-relaxed">
              Your teacher created your account with a temporary password.
              Choose a new, secure password to access your examination records.
            </p>

            {passwordSuccess && (
              <div className="mt-4 rounded-xl bg-[#dcebe4] p-3.5 text-sm text-[#17634e] font-medium">
                Password updated successfully! Redirecting...
              </div>
            )}

            <form
              onSubmit={changePassword}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="block text-xs font-semibold text-[#14201c] mb-1">
                  Temporary password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                  type="password"
                  minLength={1}
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Temporary password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#14201c] mb-1">
                  New password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
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
                className="sm:col-span-2 py-3 px-6 bg-[#17634e] hover:bg-[#0d3d31] text-white font-medium text-sm rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                type="submit"
              >
                {changingPassword
                  ? "Updating password..."
                  : "Save password & Continue"}
              </button>
            </form>
          </section>
        )}

        {/* Welcome Banner & KPI Stats */}
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-[#17634e] via-[#23765f] to-[#0d3d31] text-white p-7 sm:p-9 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-white border border-white/25">
                Student Assessment Evidence
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
                {profile?.student.name ?? account?.name ?? "Welcome to Rubriq"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
                Review your graded examination papers, teacher marks breakdown,
                and AI rubric feedback.
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
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-white via-[#fcfdfb] to-[#eef6f1] border border-[#cfd6d0] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#17634e]/5 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcebe4] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#17634e]">
                  <span>⚡</span>
                  <span>Campus Connect · Skill Network</span>
                </span>
                <span className="text-xs text-[#17634e] font-medium bg-[#dcebe4]/70 px-2.5 py-0.5 rounded-full border border-[#cfd6d0]">
                  Practical Mentorship
                </span>
              </div>
              <h2 className="mt-2.5 text-xl sm:text-2xl font-bold text-[#14201c] tracking-[-0.025em]">
                Level up practical skills beyond exams
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#697770] max-w-xl leading-relaxed">
                Connect with verified faculty, seniors, and alumni to master
                real-world tech stacks, build portfolio projects, and turn
                theoretical learning into hands-on competency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/student/network"
                className="py-2.5 px-4 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Find Skill Mentor</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/student/questions"
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#eef6f1] text-[#17634e] text-xs sm:text-sm font-semibold border border-[#cfd6d0] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>Skill Q&A</span>
              </Link>
              <Link
                href="/student/connections"
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#eef6f1] text-[#14201c] text-xs sm:text-sm font-semibold border border-[#cfd6d0] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
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
              <h2 className="text-xl font-bold text-[#14201c] tracking-[-0.025em]">
                Released Examinations
              </h2>
              <span className="text-xs font-semibold text-[#697770] bg-[#ecefeb] px-2.5 py-1 rounded-full">
                {submissions.length} available
              </span>
            </div>

            <div className="rounded-2xl bg-white border border-[#dfe3de] shadow-xs overflow-hidden divide-y divide-[#dfe3de]">
              {loading && (
                <div className="p-8 text-center text-sm text-[#697770]">
                  Loading your assessment submissions...
                </div>
              )}

              {!loading && !submissions.length && (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#dcebe4] flex items-center justify-center text-[#17634e] mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-base text-[#14201c]">
                    No released exams yet
                  </h3>
                  <p className="mt-1 text-sm text-[#697770] max-w-xs mx-auto">
                    Once your teacher completes reviewing and releases an exam,
                    your score and evidence will appear here.
                  </p>
                </div>
              )}

              {submissions.map((submission) => {
                const isSelected = selected?.id === submission.id;
                const percentage = submission.total_marks
                  ? Math.round(
                      (submission.total_score / submission.total_marks) * 100,
                    )
                  : 0;

                return (
                  <button
                    type="button"
                    key={submission.id}
                    onClick={() => setSelected(submission)}
                    className={`block w-full p-4 sm:p-5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#dcebe4]/70 border-l-4 border-l-[#17634e]"
                        : "hover:bg-[#f2f3ef]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#14201c] text-base leading-snug">
                          {submission.exam_title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#697770]">
                          <span className="font-medium text-[#17634e] bg-[#dcebe4] px-2 py-0.5 rounded-md">
                            {submission.subject}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(submission.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[15px] font-semibold text-[#14201c] tracking-[-0.015em]">
                          {submission.total_score}
                          <span className="text-xs text-[#697770] font-sans font-normal">
                            /{submission.total_marks}
                          </span>
                        </span>
                        <span
                          className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            percentage >= 80
                              ? "bg-[#dcebe4] text-[#17634e]"
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
        <section className="mt-10 rounded-3xl bg-white border border-[#dfe3de] p-7 sm:p-8 shadow-xs">
          <div className="border-b border-[#dfe3de] pb-5 mb-6">
            <h2 className="text-xl font-bold text-[#14201c] tracking-[-0.025em]">
              Learning Profile & Subject Mastery
            </h2>
            <p className="mt-1 text-sm text-[#697770]">
              Tracks concept mastery extracted directly from your handwritten
              assessment answers.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl bg-[#f2f3ef] p-5 border border-[#dfe3de]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17634e] flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-[#17634e]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Demonstrated Strengths
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile?.strengths?.length ? (
                  profile.strengths.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-[#dcebe4] px-3 py-1 text-xs font-semibold text-[#17634e]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#697770]">
                    No strengths recorded yet. Take an assessment to unlock
                    insights.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f2f3ef] p-5 border border-[#dfe3de]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9d552d] flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-[#9d552d]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Concepts to Practice
              </h3>
              <div className="mt-3 space-y-2.5">
                {profile?.developing?.length ? (
                  profile.developing.map((item) => (
                    <div
                      key={item}
                      className="p-3 rounded-xl bg-white border border-[#dfe3de] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <span className="font-semibold text-sm text-[#14201c] block">
                          {item}
                        </span>
                        <span className="text-[11px] text-[#9d552d] font-medium">
                          Identified gap from assessment · Build hands-on
                          mastery
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(item)}`}
                          className="py-1.5 px-2.5 rounded-lg bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Build Practical Skill</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(item)}&practice=ai`}
                          className="py-1.5 px-2.5 rounded-lg bg-[#dcebe4] hover:bg-[#d5e7e1] text-[#17634e] text-xs font-semibold transition-all cursor-pointer"
                        >
                          Practice with AI
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#697770]">
                    Great work! No concepts currently flagged for extra
                    practice.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bars for Concept Mastery */}
          {profile?.concepts?.length ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#14201c]">
                Concept Breakdown
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.concepts.map((concept) => (
                  <div
                    key={concept.concept}
                    className="p-3.5 rounded-xl bg-[#f2f3ef] border border-[#dfe3de]"
                  >
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="font-medium text-[#14201c]">
                        {concept.concept}
                      </span>
                      <span className="font-bold text-[#17634e] font-mono text-xs">
                        {concept.mastery}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#dfe3de]">
                      <div
                        className="h-full rounded-full bg-[#17634e] transition-all duration-500"
                        style={{ width: `${Math.min(concept.mastery, 100)}%` }}
                      />
                    </div>
                    {concept.mastery < 75 && (
                      <div className="mt-2.5 pt-2 border-t border-[#ecefeb] flex items-center justify-between">
                        <span className="text-[11px] text-[#9d552d] font-medium">
                          Foundational gap · Level up
                        </span>
                        <Link
                          href={`/student/network?concept=${encodeURIComponent(concept.concept)}`}
                          className="text-xs font-semibold text-[#17634e] hover:underline flex items-center gap-1"
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
  const [filter, setFilter] = useState<"all" | "missed" | "perfect">("all");
  const [expandedIds, setExpandedIds] = useState<
    Record<string | number, boolean>
  >({});
  const [expandAll, setExpandAll] = useState(false);

  if (!selected) {
    return (
      <div className="rounded-3xl bg-white border border-[#dfe3de] p-12 text-center text-[#697770] shadow-xs">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#dcebe4] text-[#17634e] flex items-center justify-center text-xl mb-3 shadow-xs">
          📄
        </div>
        <h3 className="text-base font-bold text-[#14201c]">
          Select an Examination
        </h3>
        <p className="text-xs text-[#697770] mt-1 max-w-xs mx-auto">
          Choose a released examination on the left to review marks breakdown,
          teacher notes, and AI feedback.
        </p>
      </div>
    );
  }

  const percentage = selected.total_marks
    ? Math.round((selected.total_score / selected.total_marks) * 100)
    : 0;

  const evaluations = selected.evaluations || [];
  const missedCount = evaluations.filter((e) => e.marks < e.max_marks).length;
  const perfectCount = evaluations.filter(
    (e) => e.marks === e.max_marks,
  ).length;

  const filteredEvaluations = evaluations.filter((e) => {
    if (filter === "missed") return e.marks < e.max_marks;
    if (filter === "perfect") return e.marks === e.max_marks;
    return true;
  });

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const newExpanded: Record<string | number, boolean> = {};
    evaluations.forEach((e, idx) => {
      newExpanded[e.id || idx] = next;
    });
    setExpandedIds(newExpanded);
  };

  return (
    <div className="rounded-3xl bg-white border border-[#dfe3de] shadow-xs overflow-hidden">
      {/* Evidence Card Header with Modern Visual Meter */}
      <div className="border-b border-[#dfe3de] p-6 bg-gradient-to-br from-[#f2f3ef] via-white to-[#eef6f1]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#17634e] uppercase tracking-wider bg-[#dcebe4] px-2.5 py-0.5 rounded-full">
                {selected.subject}
              </span>
              <span className="text-xs text-[#697770]">
                Released:{" "}
                {selected.released_at
                  ? new Date(selected.released_at).toLocaleDateString()
                  : new Date(selected.created_at).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#14201c] mt-1.5 tracking-[-0.025em]">
              {selected.exam_title}
            </h2>
            <p className="text-xs text-[#697770] mt-1">
              Verified rubric grading with page-by-page evidence quotes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white p-3 px-4 text-center border border-[#cfd6d0] shadow-xs">
              <div className="text-2xl font-bold text-[#17634e] tracking-[-0.03em] leading-none">
                {selected.total_score}
                <span className="text-xs font-normal text-[#697770] ml-0.5">
                  /{selected.total_marks}
                </span>
              </div>
              <span
                className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  percentage >= 75
                    ? "bg-[#dcebe4] text-[#17634e]"
                    : percentage >= 50
                      ? "bg-[#fff2e7] text-[#9d552d]"
                      : "bg-[#fbeeed] text-[#a43838]"
                }`}
              >
                {percentage}% Score
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filter & Expand Controls Bar */}
        <div className="mt-5 pt-4 border-t border-[#dfe3de] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#17634e] text-white shadow-xs"
                  : "bg-white text-[#697770] hover:bg-[#eef6f1] border border-[#dfe3de]"
              }`}
            >
              All Criteria ({evaluations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("missed")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === "missed"
                  ? "bg-[#9d552d] text-white shadow-xs"
                  : "bg-white text-[#9d552d] hover:bg-[#fff2e7] border border-[#dfe3de]"
              }`}
            >
              ⚠️ Missed Marks ({missedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("perfect")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === "perfect"
                  ? "bg-[#17634e] text-white shadow-xs"
                  : "bg-white text-[#17634e] hover:bg-[#dcebe4] border border-[#dfe3de]"
              }`}
            >
              ✓ Full Marks ({perfectCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleAll}
            className="text-xs text-[#17634e] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            {expandAll ? "Collapse All Details ▲" : "Expand All Details ▼"}
          </button>
        </div>
      </div>

      {/* Criterion-by-criterion List - Clean Accordion Cards */}
      <div className="divide-y divide-[#dfe3de] max-h-[720px] overflow-y-auto">
        {filteredEvaluations.map((evaluation, idx) => {
          const key = evaluation.id || idx;
          const isExpanded = expandedIds[key] ?? filter === "missed";
          const fullMarks = evaluation.marks === evaluation.max_marks;
          const zeroMarks = evaluation.marks === 0;
          const lostMarks = evaluation.max_marks - evaluation.marks;

          return (
            <article
              key={key}
              className="p-4 sm:p-5 hover:bg-[#fcfdfb] transition-all group"
            >
              <div
                onClick={() => toggleExpand(key)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded-lg bg-[#ecefeb] font-mono font-bold text-xs text-[#14201c] border border-[#dfe3de]">
                    {evaluation.question_number || `Q${idx + 1}`}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-[14.5px] text-[#14201c] leading-snug group-hover:text-[#17634e] transition-colors">
                      {evaluation.criterion_title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#697770]">
                      <span className="text-[11px] text-[#17634e] font-medium flex items-center gap-0.5">
                        {isExpanded ? "Hide rationale ▲" : "View rationale ▾"}
                      </span>
                      {evaluation.evidence?.length ? (
                        <span className="text-[11px] text-[#8ea29a]">
                          · {evaluation.evidence.length} quote evidence
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right flex items-center gap-2">
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-xl shadow-2xs ${
                      fullMarks
                        ? "bg-[#dcebe4] text-[#0d3d31] border border-[#cfd6d0]"
                        : zeroMarks
                          ? "bg-[#fbeeed] text-[#a43838] border border-[#f4cbcd]"
                          : "bg-[#fff2e7] text-[#9d552d] border border-[#f8dec8]"
                    }`}
                  >
                    {evaluation.marks} / {evaluation.max_marks}
                  </span>
                  {!fullMarks && lostMarks > 0 && (
                    <span className="hidden sm:inline-block text-[11px] font-bold text-[#a43838] bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                      -{lostMarks}
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Details: Rationale & Evidence */}
              {isExpanded && (
                <div className="mt-3.5 space-y-2.5 pt-3 border-t border-[#ecefeb] animate-fadeIn">
                  {evaluation.reason && (
                    <div className="rounded-2xl bg-[#f2f3ef] p-3.5 border border-[#dfe3de] text-xs sm:text-[13px] text-[#31423d] leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold text-[#17634e] text-xs mb-1">
                        <span>💡</span>
                        <span>Rubriq AI Evaluation Rationale</span>
                      </div>
                      <p>{evaluation.reason}</p>
                    </div>
                  )}

                  {evaluation.evidence?.length ? (
                    <div className="space-y-1.5">
                      {evaluation.evidence.map((ev, evIdx) => (
                        <div
                          key={evIdx}
                          className="text-xs text-[#425550] flex items-center gap-2 bg-[#f2f3ef] px-3 py-2 rounded-xl border border-[#dfe3de]"
                        >
                          <span className="text-[#17634e] font-bold text-xs">
                            📄
                          </span>
                          {ev.page ? (
                            <span className="font-semibold text-[#14201c]">
                              Page {ev.page}:
                            </span>
                          ) : null}
                          <span className="italic truncate text-[#697770]">
                            "{ev.quote}"
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
