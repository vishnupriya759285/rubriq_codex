"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";

type VerificationItem = {
  id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_role: string;
  department: string;
  year_or_batch: string;
  bio: string;
  projects: { title: string; description: string; link?: string }[];
  category_id: string;
  category_name: string;
  concept_tag: string;
  status: "pending" | "verified" | "rejected";
  review_notes?: string | null;
  verified_at?: string | null;
  created_at: string;
};

export default function AdminCampusNetworkPage() {
  const { account } = useSession();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNotesMap, setReviewNotesMap] = useState<Record<string, string>>({});

  async function loadVerifications(filter?: string) {
    try {
      setLoading(true);
      const url = filter
        ? `/api/network/admin/verifications?status_filter=${filter}`
        : "/api/network/admin/verifications";
      const res = await api.get<{ items: VerificationItem[] }>(url as `/api/${string}`);
      setItems(res.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVerifications(statusFilter);
  }, [statusFilter]);

  async function handleVerify(id: string, status: "verified" | "rejected") {
    setActionLoading(id);
    try {
      const note = reviewNotesMap[id] || "";
      await api.patch(`/api/network/admin/verifications/${id}`, {
        status,
        review_notes: note || undefined,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, review_notes: note, verified_at: new Date().toISOString() }
            : item
        )
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update verification status.");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const verifiedCount = items.filter((i) => i.status === "verified").length;
  const rejectedCount = items.filter((i) => i.status === "rejected").length;

  return (
    <main className="min-h-screen bg-[#fcfdfd] text-[#141f1c]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#d8e2de] bg-white/95 backdrop-blur-md px-5 py-3.5 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/network"
              className="text-2xl font-bold tracking-[-0.03em] text-[#0f4a3c] hover:opacity-95 transition-opacity"
            >
              Rubriq
            </Link>
            <span className="hidden sm:inline-block rounded-full bg-[#141f1c] px-2.5 py-0.5 text-xs font-semibold text-white">
              Institutional Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <AccountControl />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e2e8e5] pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-[#e5f0ec] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0f4a3c]">
                Campus Knowledge Network
              </span>
              <span className="text-xs text-[#51625d]">· Administrative Governance</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-[#141f1c]">
              Mentor Expertise Verification
            </h1>
            <p className="mt-1 text-sm text-[#51625d]">
              Review applicant background, projects, and requested topics before granting authentic institutional verified badges.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/student/network"
              className="py-2 px-3.5 rounded-xl bg-[#f4f7f6] hover:bg-[#e5f0ec] text-[#0f4a3c] text-xs font-semibold border border-[#d8e2de] transition-all"
            >
              View Public Network →
            </Link>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-[#d8e2de] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#51625d] block">
              Total Applications
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#141f1c] mt-1 block">
              {items.length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#fbdcc8] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9d552d] block">
              Pending Review
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#9d552d] mt-1 block">
              {pendingCount}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#bcd7cd] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f4a3c] block">
              Verified Badges
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#0f4a3c] mt-1 block">
              {verifiedCount}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#f5c6cb] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a43838] block">
              Rejected / Revoked
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#a43838] mt-1 block">
              {rejectedCount}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === ""
                ? "bg-[#0f4a3c] text-white shadow-xs"
                : "bg-[#f4f7f6] text-[#51625d] hover:bg-[#e5f0ec]"
            }`}
          >
            All Applications ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-[#9d552d] text-white shadow-xs"
                : "bg-[#fff2e7] text-[#9d552d] hover:bg-[#ffe3ce]"
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("verified")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "verified"
                ? "bg-[#0f4a3c] text-white shadow-xs"
                : "bg-[#e5f0ec] text-[#0f4a3c] hover:bg-[#d5e7e1]"
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "rejected"
                ? "bg-[#a43838] text-white shadow-xs"
                : "bg-[#fbeeed] text-[#a43838] hover:bg-[#f8d7da]"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Applications List */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#d8e2de] text-sm text-[#51625d]">
            Loading mentor applications...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#d8e2de] shadow-xs">
            <div className="mx-auto w-10 h-10 rounded-full bg-[#e5f0ec] flex items-center justify-center text-[#0f4a3c] mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#141f1c]">
              No expertise applications found.
            </h3>
            <p className="mt-1 text-xs text-[#51625d] max-w-sm mx-auto">
              When students, faculty, or alumni submit topics for verification, they will appear here for review.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-[#d8e2de] p-6 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#f0f4f2] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#141f1c]">
                      {item.mentor_name}
                    </h3>
                    <span className="text-xs font-semibold text-[#0f4a3c] bg-[#e5f0ec] px-2 py-0.5 rounded-md">
                      {item.mentor_role}
                    </span>
                    {item.department && (
                      <span className="text-xs text-[#51625d]">· {item.department}</span>
                    )}
                    {item.year_or_batch && (
                      <span className="text-xs text-[#51625d]">· {item.year_or_batch}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-[#141f1c]">
                      Requested Badge:
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4a3c] bg-[#e5f0ec] px-2.5 py-0.5 rounded-full border border-[#bcd7cd]">
                      ✓ Verified {item.concept_tag} Mentor
                    </span>
                    <span className="text-xs text-[#51625d]">
                      in category <strong className="text-[#141f1c]">{item.category_name}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    item.status === "verified"
                      ? "bg-[#e5f0ec] text-[#0f4a3c]"
                      : item.status === "rejected"
                      ? "bg-[#fbeeed] text-[#a43838]"
                      : "bg-[#fff2e7] text-[#9d552d]"
                  }`}
                >
                  {item.status === "verified" ? "✓ Verified" : item.status}
                </span>
              </div>

              {/* Bio & Projects */}
              {item.bio && (
                <p className="text-xs sm:text-sm text-[#51625d] leading-relaxed">
                  <strong className="text-[#141f1c]">Bio:</strong> {item.bio}
                </p>
              )}

              {item.projects?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e8eeec] text-xs space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#51625d] block">
                    Applicant Projects ({item.projects.length})
                  </span>
                  {item.projects.map((p, idx) => (
                    <div key={idx} className="text-[#141f1c]">
                      <span className="font-semibold">{p.title}</span>
                      {p.description && <span className="text-[#51625d]"> — {p.description}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Note & Verification Actions */}
              <div className="pt-3 border-t border-[#f0f4f2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional review note (e.g. Approved based on project portfolio)..."
                  value={reviewNotesMap[item.id] !== undefined ? reviewNotesMap[item.id] : item.review_notes || ""}
                  onChange={(e) => setReviewNotesMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  className="flex-1 px-3.5 py-2 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                />

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "verified" ? (
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => handleVerify(item.id, "verified")}
                      className="py-2 px-4 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {actionLoading === item.id ? "Processing..." : "✓ Approve & Verify Badge"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => handleVerify(item.id, "rejected")}
                      className="py-2 px-3 rounded-xl bg-[#f4f7f6] hover:bg-[#fbeeed] text-[#a43838] text-xs font-semibold transition-all border border-[#d8e2de] cursor-pointer disabled:opacity-60"
                    >
                      Revoke Verification
                    </button>
                  )}

                  {item.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => handleVerify(item.id, "rejected")}
                      className="py-2 px-3 rounded-xl bg-[#fbeeed] hover:bg-[#f8d7da] text-[#a43838] text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
