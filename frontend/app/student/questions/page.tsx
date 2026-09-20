"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { api } from "@/lib/api";

type Question = {
  id: string;
  author_display: string;
  is_author: boolean;
  mode: "anonymous" | "public" | "private";
  title: string;
  body: string;
  concept_tag?: string | null;
  target_mentor_id?: string | null;
  target_mentor_name?: string | null;
  responses_count: number;
  created_at: string;
};

type ResponseItem = {
  id: string;
  responder_account_id: string;
  responder_name: string;
  responder_role: string;
  is_mentor: boolean;
  verified_badges: string[];
  body: string;
  is_accepted_solution: boolean;
  created_at: string;
};

export default function CampusQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");
  const [conceptFilter, setConceptFilter] = useState("");

  // Selected Question & Responses
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Question Modal
  const [openAskModal, setOpenAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newMode, setNewMode] = useState<"anonymous" | "public" | "private">(
    "anonymous",
  );
  const [newConcept, setNewConcept] = useState("");
  const [postingQuestion, setPostingQuestion] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadQuestions() {
    try {
      setLoading(true);
      const mineParam = filterMode === "mine" ? "?mine=true" : "";
      const conceptParam = conceptFilter
        ? `${mineParam ? "&" : "?"}concept=${encodeURIComponent(conceptFilter)}`
        : "";
      const url = `/api/network/questions${mineParam}${conceptParam}`;
      const res = await api.get<{ items: Question[] }>(url as `/api/${string}`);
      const items = res.items || [];
      setQuestions(items);
      if (!selectedQuestion && items.length > 0) {
        setSelectedQuestion(items[0]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestions();
  }, [filterMode, conceptFilter]);

  async function loadResponses(qId: string) {
    try {
      setLoadingResponses(true);
      const res = await api.get<{
        question: Question;
        responses: ResponseItem[];
      }>(`/api/network/questions/${qId}` as `/api/${string}`);
      setResponses(res.responses || []);
    } catch {
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  }

  useEffect(() => {
    if (selectedQuestion) {
      void loadResponses(selectedQuestion.id);
    }
  }, [selectedQuestion]);

  async function handlePostReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuestion || !replyBody.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await api.post(
        `/api/network/questions/${selectedQuestion.id}/responses`,
        {
          body: replyBody.trim(),
        },
      );
      setReplyBody("");
      void loadResponses(selectedQuestion.id);
      // update responses_count locally
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion.id
            ? { ...q, responses_count: q.responses_count + 1 }
            : q,
        ),
      );
    } catch (err: any) {
      alert(err?.message || "Failed to submit answer.");
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim() || postingQuestion) return;
    setPostingQuestion(true);
    setModalError(null);
    try {
      const created = await api.post<Question>("/api/network/questions", {
        title: newTitle.trim(),
        body: newBody.trim(),
        mode: newMode,
        concept_tag: newConcept.trim() || undefined,
      });
      setQuestions((prev) => [created, ...prev]);
      setSelectedQuestion(created);
      setOpenAskModal(false);
      setNewTitle("");
      setNewBody("");
      setNewConcept("");
    } catch (err: any) {
      setModalError(err?.message || "Could not post question.");
    } finally {
      setPostingQuestion(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fcfdfb] text-[#14201c]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#dfe3de] bg-white/95 backdrop-blur-md px-5 py-3.5 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="text-xl font-bold tracking-[-0.03em] text-[#17634e] hover:opacity-90 transition-opacity"
            >
              Rubriq
            </Link>
            <span className="hidden sm:inline-block rounded-md bg-[#dcebe4] px-2.5 py-1 text-[11px] font-600 text-[#0d3d31] leading-none">
              Campus Connect · Skill Q&amp;A
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/student"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/student/network"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              Campus Connect
            </Link>
            <Link
              href="/student/questions"
              className="font-semibold text-[#17634e] border-b-2 border-[#17634e] pb-0.5"
            >
              Skill Q&A
            </Link>
            <Link
              href="/student/connections"
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              My Mentors
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <AccountControl />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#dfe3de] pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wide text-[#0d3d31] bg-[#dcebe4] px-2.5 py-1 rounded-md leading-none">
                Hands-on Technical Guidance
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.025em] text-[#14201c] mt-2">
              Campus Skill Q&amp;A &amp; Technical Discussions
            </h1>
            <p className="mt-1.5 text-sm text-[#3d524c] max-w-2xl leading-relaxed">
              Ask questions on technical architecture, frameworks, code
              debugging, hackathons, and research methodologies. Campus Connect
              is focused on practical skill development and engineering guidance
              beyond exams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenAskModal(true)}
            className="py-2.5 px-5 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>+ Ask Skill Question</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-[#17634e] text-white shadow-xs"
                  : "bg-[#f2f3ef] text-[#697770] hover:bg-[#dcebe4]"
              }`}
            >
              All Questions
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("mine")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === "mine"
                  ? "bg-[#17634e] text-white shadow-xs"
                  : "bg-[#f2f3ef] text-[#697770] hover:bg-[#dcebe4]"
              }`}
            >
              My Questions
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={conceptFilter}
              onChange={(e) => setConceptFilter(e.target.value)}
              placeholder="Filter by concept / tag..."
              className="px-3.5 py-1.5 rounded-xl bg-[#f2f3ef] border border-[#dfe3de] text-xs focus:bg-white focus:border-[#17634e] focus:outline-none"
            />
            {conceptFilter && (
              <button
                type="button"
                onClick={() => setConceptFilter("")}
                className="text-xs text-[#8ea29a] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Master-Detail: Questions List (Left) & Thread Detail (Right) */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Questions List */}
          <section className="rounded-2xl bg-white border border-[#dfe3de] shadow-xs overflow-hidden divide-y divide-[#dfe3de]">
            {loading && (
              <div className="p-8 text-center text-sm text-[#697770]">
                Loading campus questions...
              </div>
            )}

            {!loading && questions.length === 0 && (
              <div className="p-10 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-[#dcebe4] flex items-center justify-center text-[#17634e] mb-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-sm text-[#14201c]">
                  No campus questions posted yet.
                </h4>
                <p className="mt-1 text-xs text-[#697770] max-w-xs mx-auto">
                  Ask the first question! You can choose to post anonymously or
                  with your name.
                </p>
                <button
                  type="button"
                  onClick={() => setOpenAskModal(true)}
                  className="mt-3.5 inline-block py-1.5 px-3.5 rounded-xl bg-[#17634e] text-white text-xs font-semibold shadow-xs hover:bg-[#0d3d31] cursor-pointer"
                >
                  + Ask a Question
                </button>
              </div>
            )}

            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const isAnon = q.mode === "anonymous";
              const authorInitials = q.author_display
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`w-full p-4 text-left transition-all cursor-pointer block border-l-3 ${
                    isSelected
                      ? "bg-[#dcebe4] border-l-[#17634e] shadow-2xs"
                      : "border-l-transparent hover:bg-[#f2f3ef]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isAnon ? (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-xs">
                          🔒
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#17634e] to-[#23765f] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          {authorInitials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-[#14201c] truncate">
                            {q.author_display}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                              isAnon
                                ? "bg-gray-100 text-gray-700"
                                : q.mode === "private"
                                  ? "bg-[#fff2e7] text-[#9d552d]"
                                  : "bg-[#dcebe4] text-[#17634e]"
                            }`}
                          >
                            {isAnon
                              ? "Anon"
                              : q.mode === "private"
                                ? "Private"
                                : "Public"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8ea29a] shrink-0">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[13.5px] text-[#14201c] leading-snug line-clamp-2 tracking-[-0.01em]">
                        {q.title}
                      </h3>

                      <div className="mt-2 flex items-center justify-between text-xs text-[#697770]">
                        {q.concept_tag ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#eef6f1] text-[10.5px] font-medium text-[#17634e] border border-[#d8e6e0]">
                            {q.concept_tag}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="font-semibold text-[11px] text-[#17634e] bg-[#dcebe4] px-2 py-0.5 rounded-full">
                          {q.responses_count}{" "}
                          {q.responses_count === 1 ? "answer" : "answers"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Right Column: Question Thread & Answers */}
          <section className="rounded-2xl bg-white border border-[#dfe3de] shadow-xs p-6 flex flex-col justify-between">
            {selectedQuestion ? (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="border-b border-[#dfe3de] pb-5">
                  <div className="flex items-center gap-2 text-xs text-[#697770] mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedQuestion.mode === "anonymous"
                          ? "bg-gray-100 text-gray-700"
                          : selectedQuestion.mode === "private"
                            ? "bg-[#fff2e7] text-[#9d552d]"
                            : "bg-[#dcebe4] text-[#17634e]"
                      }`}
                    >
                      {selectedQuestion.mode === "anonymous"
                        ? "🔒 Anonymous Post"
                        : selectedQuestion.mode === "private"
                          ? "✉ Private Request"
                          : "Public Campus Post"}
                    </span>
                    <span>· Asked by {selectedQuestion.author_display}</span>
                    <span>
                      ·{" "}
                      {new Date(
                        selectedQuestion.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#14201c] leading-snug tracking-[-0.02em]">
                    {selectedQuestion.title}
                  </h2>

                  {selectedQuestion.concept_tag && (
                    <div className="mt-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#dcebe4] text-xs font-semibold text-[#17634e]">
                        Concept: {selectedQuestion.concept_tag}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-[#31423d] leading-relaxed whitespace-pre-line bg-[#f2f3ef] p-4 rounded-xl border border-[#dfe3de]">
                    {selectedQuestion.body}
                  </div>
                </div>

                {/* Answers / Responses Section */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#14201c] mb-3 tracking-[-0.01em]">
                    Answers ({responses.length})
                  </h3>

                  {loadingResponses && (
                    <div className="p-4 text-center text-xs text-[#697770]">
                      Loading answers...
                    </div>
                  )}

                  {!loadingResponses && responses.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#8ea29a] bg-[#fcfdfb] rounded-xl border border-dashed border-[#dfe3de]">
                      No answers yet. Share your knowledge or guidance below!
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-4 rounded-xl bg-white border border-[#dfe3de] shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[#14201c]">
                              {resp.responder_name}
                            </span>
                            <span className="text-[11px] text-[#697770] bg-[#f2f3ef] px-2 py-0.5 rounded-md">
                              {resp.responder_role}
                            </span>
                            {resp.verified_badges?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#17634e] bg-[#dcebe4] px-2 py-0.5 rounded-full border border-[#cfd6d0]">
                                ✓ {resp.verified_badges[0]}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8ea29a]">
                            {new Date(resp.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#24332f] leading-relaxed whitespace-pre-line">
                          {resp.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handlePostReply}
                  className="pt-4 border-t border-[#dfe3de] space-y-2.5"
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#697770]">
                    Your Answer or Guidance
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a helpful, grounded explanation or suggest study steps..."
                    className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReply || !replyBody.trim()}
                      className="py-2 px-5 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submittingReply ? "Posting..." : "Submit Answer"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center text-[#8ea29a] my-auto">
                Select a question on the left to view discussions and answers.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ------------------- MODAL: ASK A QUESTION ------------------- */}
      {openAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#dfe3de] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe3de]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#17634e]">
                  Campus Knowledge Network
                </span>
                <h3 className="text-lg font-bold text-[#14201c] tracking-[-0.02em]">
                  Ask a Question
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenAskModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-[#fbeeed] text-[#a43838] text-xs font-semibold">
                ✕ {modalError}
              </div>
            )}

            <div className="mt-3 p-3 rounded-xl bg-[#dcebe4]/70 border border-[#cbe2da] text-[11px] text-[#17634e] flex items-center gap-2">
              <span>💡</span>
              <span>
                Campus Connect Q&A is focused on practical skills, tech stacks,
                and project roadmaps. (Please do not post exam questions or exam
                answers).
              </span>
            </div>

            <form onSubmit={handleCreateQuestion} className="mt-4 space-y-4">
              {/* 3 Privacy Modes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#697770] mb-2">
                  Question Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMode("anonymous")}
                    className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                      newMode === "anonymous"
                        ? "border-[#17634e] bg-[#dcebe4] text-[#17634e] font-bold"
                        : "border-[#dfe3de] bg-[#f2f3ef] text-[#697770]"
                    }`}
                  >
                    <div className="text-xs font-bold">🔒 Anonymous</div>
                    <div className="text-[10px] opacity-75">
                      Your name hidden from peers
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMode("public")}
                    className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                      newMode === "public"
                        ? "border-[#17634e] bg-[#dcebe4] text-[#17634e] font-bold"
                        : "border-[#dfe3de] bg-[#f2f3ef] text-[#697770]"
                    }`}
                  >
                    <div className="text-xs font-bold">Show My Name</div>
                    <div className="text-[10px] opacity-75">
                      Public campus profile
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14201c] mb-1">
                  Skill Question Title
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How do I architect state management in Next.js or prepare for a hackathon?"
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14201c] mb-1">
                  Skill Domain / Topic Tag (Optional)
                </label>
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="e.g. Computer Vision, React, Hackathons, Embedded Systems"
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14201c] mb-1">
                  Technical Context & Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Provide context on your tech stack, architecture, code snippets, or what you've tried so far..."
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpenAskModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#697770] hover:bg-[#f2f3ef] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingQuestion}
                  className="py-2.5 px-5 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {postingQuestion ? "Posting..." : "Post Skill Question →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
