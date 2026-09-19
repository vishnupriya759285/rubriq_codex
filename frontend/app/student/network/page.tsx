"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type VerifiedBadge = {
  id: string;
  concept_tag: string;
  category_id: string;
  category_name: string;
  badge_title: string;
};

type Mentor = {
  id: string;
  account_id: string;
  name: string;
  role: string;
  department: string;
  year_or_batch: string;
  bio: string;
  projects: { title: string; description: string; link?: string }[];
  skills: string[];
  research_interests: string[];
  mentoring_topics: string[];
  availability: string;
  links: {
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };
  verified_badges: VerifiedBadge[];
  is_active: boolean;
  connection_state?: "pending" | "accepted" | "declined" | null;
  connection_id?: string | null;
  match_reason?: string;
};

type MyExpertise = {
  id: string;
  category_id: string;
  category_name: string;
  concept_tag: string;
  status: "pending" | "verified" | "rejected";
  review_notes?: string | null;
  verified_at?: string | null;
  created_at: string;
};

export default function CampusNetworkPage() {
  const { account } = useSession();
  const searchParams = useSearchParams();
  const initialConcept = searchParams.get("concept") || "";
  const practiceWithAi = searchParams.get("practice") === "ai";

  const [activeTab, setActiveTab] = useState<"directory" | "my-profile">("directory");

  // Directory & Search state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [naturalQuery, setNaturalQuery] = useState(initialConcept);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});
  const toggleProjects = (id: number) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Connection Request Modal
  const [targetMentorForConnection, setTargetMentorForConnection] = useState<Mentor | null>(null);
  const [connectionNote, setConnectionNote] = useState("");
  const [connectionConcept, setConnectionConcept] = useState(initialConcept);
  const [sendingConnection, setSendingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Question Modal
  const [targetMentorForQuestion, setTargetMentorForQuestion] = useState<Mentor | null>(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionMode, setQuestionMode] = useState<"anonymous" | "public" | "private">("anonymous");
  const [questionConcept, setQuestionConcept] = useState(initialConcept);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // My Mentor Profile state
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [myExpertises, setMyExpertises] = useState<MyExpertise[]>([]);
  const [displayName, setDisplayName] = useState(account?.name || "");
  const [displayRole, setDisplayRole] = useState("Senior Student");
  const [department, setDepartment] = useState("");
  const [yearOrBatch, setYearOrBatch] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("Weekdays 4-6 PM");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [topicsText, setTopicsText] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [projectsList, setProjectsList] = useState<{ title: string; description: string; link?: string }[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Apply for expertise
  const [applyCategory, setApplyCategory] = useState("");
  const [applyConcept, setApplyConcept] = useState("");
  const [applyingExpertise, setApplyingExpertise] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Load initial categories and mentors
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cats = await api.get<Category[]>("/api/network/categories");
        setCategories(cats || []);
        if (initialConcept) {
          await runNaturalMatch(initialConcept);
        } else {
          await loadMentors();
        }
      } catch (err) {
        console.error("Failed to load campus network data", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [initialConcept]);

  async function loadMentors(catId?: string) {
    try {
      setLoading(true);
      setSearchMessage(null);
      const url = catId ? `/api/network/mentors?category=${catId}` : "/api/network/mentors";
      const res = await api.get<{ items: Mentor[] }>(url as `/api/${string}`);
      setMentors(res.items || []);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }

  async function runNaturalMatch(queryOverride?: string) {
    const q = (queryOverride !== undefined ? queryOverride : naturalQuery).trim();
    if (!q) {
      void loadMentors(selectedCategory);
      return;
    }
    try {
      setMatching(true);
      setSearchMessage(null);
      const res = await api.post<{
        query: string;
        detected_concept: string | null;
        matched_mentors: Mentor[];
        message: string;
      }>("/api/network/match", {
        query: q,
        concept_tag: initialConcept || undefined
      });
      setMentors(res.matched_mentors || []);
      setSearchMessage(res.message);
    } catch {
      setMentors([]);
      setSearchMessage("No verified person matching this topic was found.");
    } finally {
      setMatching(false);
    }
  }

  // Load My Mentor Profile
  async function loadMyProfile() {
    try {
      setProfileLoading(true);
      const res = await api.get<{
        exists: boolean;
        profile: Mentor | null;
        expertises: MyExpertise[];
      }>("/api/network/profile/me");
      if (res.exists && res.profile) {
        setHasProfile(true);
        setDisplayName(res.profile.name);
        setDisplayRole(res.profile.role);
        setDepartment(res.profile.department);
        setYearOrBatch(res.profile.year_or_batch);
        setBio(res.profile.bio);
        setAvailability(res.profile.availability);
        setLinkedinUrl(res.profile.links.linkedin || "");
        setGithubUrl(res.profile.links.github || "");
        setPortfolioUrl(res.profile.links.portfolio || "");
        setSkillsText((res.profile.skills || []).join(", "));
        setTopicsText((res.profile.mentoring_topics || []).join(", "));
        setProjectsList(res.profile.projects || []);
      }
      setMyExpertises(res.expertises || []);
    } catch {
      // ignore
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "my-profile") {
      void loadMyProfile();
    }
  }, [activeTab]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaveSuccess(false);
    try {
      const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const topics = topicsText.split(",").map((t) => t.trim()).filter(Boolean);
      await api.post("/api/network/profile/me", {
        display_name: displayName,
        display_role: displayRole,
        department,
        year_or_batch: yearOrBatch,
        bio,
        availability,
        skills,
        mentoring_topics: topics,
        projects: projectsList,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        portfolio_url: portfolioUrl || null,
      });
      setHasProfile(true);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
      void loadMyProfile();
    } catch (err: any) {
      alert(err?.message || "Could not save profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  function addProject() {
    if (!projectTitle.trim()) return;
    setProjectsList((prev) => [
      ...prev,
      {
        title: projectTitle.trim(),
        description: projectDesc.trim(),
        link: projectLink.trim() || undefined,
      },
    ]);
    setProjectTitle("");
    setProjectDesc("");
    setProjectLink("");
  }

  async function handleApplyExpertise(e: React.FormEvent) {
    e.preventDefault();
    if (!applyCategory || !applyConcept.trim()) return;
    setApplyingExpertise(true);
    setApplyError(null);
    setApplySuccess(null);
    try {
      await api.post("/api/network/profile/me/expertise", {
        category_id: applyCategory,
        concept_tag: applyConcept.trim(),
      });
      setApplySuccess(`Expertise application for '${applyConcept.trim()}' submitted! Institutional Admin will review and verify your badge.`);
      setApplyConcept("");
      void loadMyProfile();
    } catch (err: any) {
      setApplyError(err?.message || "Failed to submit expertise application.");
    } finally {
      setApplyingExpertise(false);
    }
  }

  async function handleSendConnection() {
    if (!targetMentorForConnection) return;
    setSendingConnection(true);
    setConnectionError(null);
    setConnectionSuccess(null);
    try {
      await api.post("/api/network/connections", {
        mentor_account_id: targetMentorForConnection.account_id,
        concept_tag: connectionConcept || undefined,
        note: connectionNote.trim() || undefined,
      });
      setConnectionSuccess("Connection request sent! You will be notified once accepted.");
      setMentors((prev) =>
        prev.map((m) =>
          m.id === targetMentorForConnection.id
            ? { ...m, connection_state: "pending" }
            : m
        )
      );
      setTimeout(() => {
        setTargetMentorForConnection(null);
        setConnectionSuccess(null);
      }, 2000);
    } catch (err: any) {
      setConnectionError(err?.message || "Failed to send connection request.");
    } finally {
      setSendingConnection(false);
    }
  }

  async function handlePostQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!questionTitle.trim() || !questionBody.trim()) return;
    setSubmittingQuestion(true);
    setQuestionError(null);
    setQuestionSuccess(null);
    try {
      await api.post("/api/network/questions", {
        title: questionTitle.trim(),
        body: questionBody.trim(),
        mode: questionMode,
        target_mentor_id: targetMentorForQuestion?.id || undefined,
        concept_tag: questionConcept.trim() || undefined,
      });
      setQuestionSuccess("Your question has been posted to the Campus Network!");
      setTimeout(() => {
        setTargetMentorForQuestion(null);
        setQuestionTitle("");
        setQuestionBody("");
        setQuestionSuccess(null);
      }, 2000);
    } catch (err: any) {
      setQuestionError(err?.message || "Failed to post question.");
    } finally {
      setSubmittingQuestion(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fcfdfd] text-[#141f1c]">
      {/* Sticky Top Header */}
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
              Campus Connect · Skill Network
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link href="/student" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
              Dashboard
            </Link>
            <Link href="/student/network" className="font-semibold text-[#0f4a3c] border-b-2 border-[#0f4a3c] pb-0.5">
              Campus Connect
            </Link>
            <Link href="/student/questions" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
              Skill Q&A
            </Link>
            <Link href="/student/connections" className="text-[#51625d] hover:text-[#0f4a3c] transition-colors">
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
        {/* Banner with contextual concept alert if referred from low mastery */}
        {initialConcept && (
          <div className="mb-6 p-4 rounded-2xl bg-[#e5f0ec] border border-[#bcd7cd] text-[#0f4a3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-bold text-sm block">Focusing on practical mastery of: {initialConcept}</span>
                <span className="text-xs opacity-90">
                  {practiceWithAi
                    ? "Interactive AI guidance is preparing practical exercises, or connect with a hands-on mentor below."
                    : "Connecting you with verified seniors, faculty, and alumni who build real projects and have practical expertise in this domain."}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setNaturalQuery("");
                void loadMentors();
              }}
              className="text-xs font-semibold underline hover:opacity-80 shrink-0 cursor-pointer"
            >
              Clear concept focus
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-[#e2e8e5] pb-3 mb-7">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`pb-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeTab === "directory"
                ? "text-[#0f4a3c] border-b-2 border-[#0f4a3c]"
                : "text-[#71827d] hover:text-[#141f1c]"
            }`}
          >
            Find Skill Mentors & Tech Expertise
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my-profile")}
            className={`pb-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeTab === "my-profile"
                ? "text-[#0f4a3c] border-b-2 border-[#0f4a3c]"
                : "text-[#71827d] hover:text-[#141f1c]"
            }`}
          >
            Become a Skill Mentor / My Profile
          </button>
        </div>

        {/* ------------------- TAB 1: DISCOVER MENTORS ------------------- */}
        {activeTab === "directory" && (
          <div className="space-y-8">
            {/* "Who Can Help Me?" Natural Query Section */}
            <section className="rounded-3xl bg-gradient-to-br from-[#0f4a3c] via-[#125344] to-[#0a382d] text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wide uppercase text-white border border-white/25">
                  Skill Development & Project Guidance
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-tight text-white">
                  Who Can Guide My Practical Skills?
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Looking to master a framework, prepare for a hackathon, build a portfolio project, or debug complex architecture? Rubriq connects you with verified campus mentors based on genuine hands-on expertise.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runNaturalMatch();
                  }}
                  className="mt-5 flex flex-col sm:flex-row items-stretch gap-2.5"
                >
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-[#5e706b] pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={naturalQuery}
                      onChange={(e) => setNaturalQuery(e.target.value)}
                      placeholder='e.g. "Build a fullstack Next.js app", "How to prepare for hackathons", "Computer vision with PyTorch", "React & TypeScript"...'
                      className="w-full pl-11 pr-4 py-3 bg-white text-[#141f1c] rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e5f0ec]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={matching}
                    className="py-3 px-6 rounded-xl bg-[#e5f0ec] hover:bg-white text-[#0f4a3c] font-bold text-sm transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {matching ? "Searching..." : "Find Skill Mentors →"}
                  </button>
                </form>

                {/* Example query prompts */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/70">
                  <span>Try asking for skills:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNaturalQuery("I want to build fullstack web apps with React and APIs");
                      void runNaturalMatch("I want to build fullstack web apps with React and APIs");
                    }}
                    className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors cursor-pointer"
                  >
                    "Full-stack Web & APIs"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNaturalQuery("Who can guide me for computer vision and PyTorch models?");
                      void runNaturalMatch("Who can guide me for computer vision and PyTorch models?");
                    }}
                    className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors cursor-pointer"
                  >
                    "Computer Vision & PyTorch"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNaturalQuery("How do I prepare and build a project for a competitive hackathon?");
                      void runNaturalMatch("How do I prepare and build a project for a competitive hackathon?");
                    }}
                    className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors cursor-pointer"
                  >
                    "Hackathon rapid prototyping"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNaturalQuery("Who can guide me for machine learning and data science?");
                      void runNaturalMatch("Who can guide me for machine learning and data science?");
                    }}
                    className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors cursor-pointer"
                  >
                    "ML & Data Science"
                  </button>
                </div>
              </div>
            </section>

            {/* Category Pills Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#51625d]">
                  Browse Skill Domains
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      void loadMentors();
                    }}
                    className="text-xs text-[#0f4a3c] font-semibold hover:underline cursor-pointer"
                  >
                    Show all categories
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    void loadMentors();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    !selectedCategory
                      ? "bg-[#0f4a3c] text-white shadow-xs"
                      : "bg-[#f4f7f6] text-[#51625d] hover:bg-[#e5f0ec]"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        void loadMentors(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0f4a3c] text-white shadow-xs"
                          : "bg-[#f4f7f6] text-[#51625d] hover:bg-[#e5f0ec]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Match Status Message */}
            {searchMessage && (
              <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#d8e2de] text-xs font-medium text-[#141f1c] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0f4a3c] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{searchMessage}</span>
              </div>
            )}

            {/* Verified Mentors Directory */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                    Verified Campus Skill Mentors
                  </h2>
                  <p className="text-xs text-[#51625d] mt-0.5">
                    Faculty, seniors, and alumni verified for real-world technologies, project building, and practical guidance.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#51625d] bg-[#eef3f1] px-2.5 py-1 rounded-full">
                  {mentors.length} available
                </span>
              </div>

              {loading && (
                <div className="rounded-2xl bg-white border border-[#d8e2de] p-12 text-center text-sm text-[#51625d]">
                  Loading verified skill mentors...
                </div>
              )}

              {/* STRICT RULE: Genuine Empty State when DB has no records. NO FAKE DATA! */}
              {!loading && mentors.length === 0 && (
                <div className="rounded-3xl bg-white border border-[#d8e2de] p-12 text-center shadow-xs">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#e5f0ec] flex items-center justify-center text-[#0f4a3c] mb-3.5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#0d1a16] tracking-[-0.015em]">
                    No verified mentors are available yet for this skill area.
                  </h3>
                  <p className="mt-1.5 text-sm text-[#51625d] max-w-md mx-auto leading-relaxed">
                    Skill mentorship in Rubriq is strictly tied to verified institutional records. Students, faculty, and alumni can apply in the "Become a Skill Mentor" tab above to offer guidance.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("my-profile")}
                    className="mt-4 inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#0f4a3c] text-white text-xs font-semibold shadow-xs hover:bg-[#0b382d] transition-all cursor-pointer"
                  >
                    <span>Become a Skill Mentor</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* Mentor Cards Grid - Clean, Modern & Cool Bento-style */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor) => {
                  const isProjectsOpen = expandedProjects[mentor.id];
                  const initials = mentor.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={mentor.id}
                      className="group relative rounded-2xl bg-white border border-[#e2eae6] hover:border-[#0f4a3c]/35 p-5 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top subtle hover accent */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0f4a3c] via-[#156d58] to-[#1bb58d] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Match rationale callout if returned by AI matching */}
                        {mentor.match_reason && (
                          <div className="mb-3 p-2 rounded-xl bg-[#e8f3ef] border border-[#c4ded4] text-[11px] font-semibold text-[#0a382d] flex items-center gap-1.5">
                            <span>💡</span>
                            <span className="truncate">{mentor.match_reason}</span>
                          </div>
                        )}

                        {/* Profile Header with Avatar & Details */}
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f4a3c] via-[#165a4a] to-[#0a382d] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs border border-white/20">
                              {initials}
                            </div>
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
                              title="Active Verified Mentor"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-[15px] font-bold text-[#0d1a16] tracking-[-0.02em] truncate group-hover:text-[#0f4a3c] transition-colors">
                                {mentor.name}
                              </h3>
                              <span className="font-semibold text-[#0f4a3c] bg-[#e5f0ec] px-2 py-0.5 rounded-md text-[10.5px]">
                                {mentor.role}
                              </span>
                            </div>
                            <div className="text-[11.5px] text-[#51625d] truncate mt-0.5">
                              {mentor.department} {mentor.year_or_batch ? `· ${mentor.year_or_batch}` : ""}
                            </div>
                          </div>

                          {/* Status pill if connected or pending */}
                          {mentor.connection_state === "accepted" ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f0ec] text-[#0f4a3c]">
                              ✓ Mentor
                            </span>
                          ) : mentor.connection_state === "pending" ? (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fff2e7] text-[#9d552d]">
                              Pending
                            </span>
                          ) : null}
                        </div>

                        {/* Verified Badges Section - Cleaned up to avoid repetitive walls of text */}
                        {mentor.verified_badges?.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {mentor.verified_badges.slice(0, 3).map((b) => {
                              const cleanName = b.badge_title
                                .replace(/^Verified\s+/i, "")
                                .replace(/\s+Mentor$/i, "");
                              return (
                                <span
                                  key={b.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f3ef] text-[#0a382d] border border-[#c4ded4]"
                                >
                                  <svg className="w-3 h-3 text-[#0f4a3c]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {cleanName}
                                </span>
                              );
                            })}
                            {mentor.verified_badges.length > 3 && (
                              <span className="text-[10px] font-semibold text-[#51625d] bg-[#f0f4f2] px-2 py-0.5 rounded-full border border-[#dce6e2]">
                                +{mentor.verified_badges.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {mentor.bio && (
                          <p className="mt-2.5 text-xs text-[#51625d] line-clamp-2 leading-relaxed">
                            {mentor.bio}
                          </p>
                        )}

                        {/* Skills & Tech Stack */}
                        {mentor.skills?.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {mentor.skills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-[#f4f7f6] text-[11px] font-medium text-[#1e2e2a] border border-[#e2e8e5]"
                              >
                                {s}
                              </span>
                            ))}
                            {mentor.skills.length > 4 && (
                              <span className="text-[10px] text-[#51625d] font-semibold px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200">
                                +{mentor.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Real Projects Built - Interactive Portfolio Drawer */}
                        {mentor.projects?.length > 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => toggleProjects(mentor.id)}
                              className="w-full py-1.5 px-3 rounded-xl bg-[#f8faf9] hover:bg-[#ebf3ef] border border-[#dfe8e4] text-xs font-semibold text-[#0f4a3c] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <span>⚡</span>
                                <span>
                                  {mentor.projects.length} Verified {mentor.projects.length === 1 ? "Project" : "Projects"}
                                </span>
                              </span>
                              <span className="text-[11px] text-[#51625d] font-normal flex items-center gap-0.5">
                                {isProjectsOpen ? "Collapse ▲" : "View portfolio ▼"}
                              </span>
                            </button>

                            {isProjectsOpen && (
                              <div className="mt-2 space-y-2 pt-1 animate-fadeIn">
                                {mentor.projects.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-xl bg-[#fdfefe] border border-[#e2eae6] text-xs"
                                  >
                                    <div className="font-semibold text-[#0d1a16]">{p.title}</div>
                                    {p.description && (
                                      <div className="mt-0.5 text-[11px] text-[#51625d] leading-relaxed">
                                        {p.description}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Availability & Social Links */}
                        <div className="mt-3.5 pt-2.5 border-t border-[#f0f4f2] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#51625d]">
                          {mentor.availability && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-[#0f4a3c] font-semibold">🕒</span>
                              <span className="truncate max-w-[170px]">{mentor.availability}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 font-medium ml-auto">
                            {mentor.links?.linkedin && (
                              <a
                                href={mentor.links.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0f4a3c] hover:underline"
                              >
                                LinkedIn ↗
                              </a>
                            )}
                            {mentor.links?.github && (
                              <a
                                href={mentor.links.github}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0f4a3c] hover:underline"
                              >
                                GitHub ↗
                              </a>
                            )}
                            {mentor.links?.portfolio && (
                              <a
                                href={mentor.links.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0f4a3c] hover:underline"
                              >
                                Portfolio ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-[#e8eeec] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetMentorForQuestion(mentor);
                            setQuestionConcept(initialConcept || "");
                            setQuestionSuccess(null);
                            setQuestionError(null);
                          }}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-[#e5f0ec] hover:bg-[#d5e7e1] text-[#0f4a3c] text-xs font-semibold transition-all text-center cursor-pointer"
                        >
                          Ask Question
                        </button>

                        {mentor.connection_state === "accepted" ? (
                          <Link
                            href="/student/connections"
                            className="flex-1 py-2 px-2.5 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-semibold transition-all text-center cursor-pointer"
                          >
                            Chat on Skills →
                          </Link>
                        ) : mentor.connection_state === "pending" ? (
                          <button
                            disabled
                            className="flex-1 py-2 px-2.5 rounded-xl bg-[#f4f7f6] text-[#71827d] text-xs font-semibold cursor-not-allowed"
                          >
                            Pending
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetMentorForConnection(mentor);
                              setConnectionConcept(initialConcept || "");
                              setConnectionSuccess(null);
                              setConnectionError(null);
                            }}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-semibold transition-all text-center shadow-xs cursor-pointer"
                          >
                            Request Mentorship
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------- TAB 2: BECOME A MENTOR / MY PROFILE ------------------- */}
        {activeTab === "my-profile" && (
          <div className="space-y-8 max-w-3xl">
            <section className="rounded-3xl bg-white border border-[#d8e2de] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#e8eeec] pb-4 mb-6">
                <span className="inline-block rounded-full bg-[#e5f0ec] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0f4a3c]">
                  Mentor Profile Extension
                </span>
                <h2 className="mt-2 text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                  Share Your Expertise on Campus
                </h2>
                <p className="mt-1 text-sm text-[#51625d] leading-relaxed">
                  Help fellow students navigate courses, research, hackathons, and learning gaps. Create your mentor profile and submit topics for administrative verification.
                </p>
              </div>

              {profileSaveSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#e5f0ec] text-[#0f4a3c] text-sm font-semibold">
                  ✓ Mentor profile saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Display Name
                    </label>
                    <input
                      required
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Role / Position
                    </label>
                    <select
                      value={displayRole}
                      onChange={(e) => setDisplayRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none cursor-pointer"
                    >
                      <option value="Senior Student">Senior Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Alumnus">Alumnus</option>
                      <option value="Peer Mentor">Peer Mentor</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Year / Batch
                    </label>
                    <input
                      type="text"
                      value={yearOrBatch}
                      onChange={(e) => setYearOrBatch(e.target.value)}
                      placeholder="e.g. 4th Year (2022 - 2026)"
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Bio / Mentoring Philosophy
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe how you can help students and what you're passionate about..."
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="e.g. Python, PyTorch, React, Linear Algebra"
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Mentoring Topics (comma separated)
                  </label>
                  <input
                    type="text"
                    value={topicsText}
                    onChange={(e) => setTopicsText(e.target.value)}
                    placeholder="e.g. Hackathons, Probability & Bayes Theorem, Research Papers"
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g. Weekdays 4-6 PM, Weekends on request"
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                {/* Professional Links */}
                <div className="pt-2 border-t border-[#f0f4f2]">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#51625d] mb-2">
                    Professional Links (Optional)
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="LinkedIn URL"
                      className="px-3.5 py-2 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub URL"
                      className="px-3.5 py-2 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="Portfolio / Website"
                      className="px-3.5 py-2 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Projects Section */}
                <div className="pt-3 border-t border-[#f0f4f2]">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#51625d] mb-2">
                    Featured Projects
                  </span>
                  {projectsList.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {projectsList.map((p, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#f8faf9] border border-[#e2e8e5] text-xs flex justify-between items-start">
                          <div>
                            <span className="font-bold text-[#141f1c]">{p.title}</span>
                            <p className="text-[#51625d] mt-0.5">{p.description}</p>
                            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-[#0f4a3c] font-semibold hover:underline mt-1 inline-block">View Link ↗</a>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setProjectsList((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-red-600 hover:text-red-800 text-xs font-bold ml-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-[#e2e8e5] space-y-2">
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Project title (e.g. Autonomous Drone Perception)"
                      className="w-full px-3 py-2 bg-white border border-[#d8e2de] rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="Short description..."
                      className="w-full px-3 py-2 bg-white border border-[#d8e2de] rounded-lg text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="Link URL (optional)"
                        className="flex-1 px-3 py-2 bg-white border border-[#d8e2de] rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={addProject}
                        className="py-2 px-3 rounded-lg bg-[#0f4a3c] text-white text-xs font-semibold hover:bg-[#0b382d] cursor-pointer"
                      >
                        + Add Project
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3 px-6 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {profileSaving ? "Saving Profile..." : "Save Mentor Profile"}
                  </button>
                </div>
              </form>
            </section>

            {/* Apply for Verified Expertise Badges */}
            <section className="rounded-3xl bg-white border border-[#d8e2de] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#e8eeec] pb-4 mb-6">
                <span className="inline-block rounded-full bg-[#e5f0ec] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0f4a3c]">
                  Admin Verified Badges
                </span>
                <h2 className="mt-2 text-xl font-bold text-[#0d1a16] tracking-[-0.025em]">
                  Apply for Verified Expertise
                </h2>
                <p className="mt-1 text-sm text-[#51625d] leading-relaxed">
                  Badges are reviewed and approved by Institutional Administrators. Once verified, you will appear in grounded search results for students struggling with these topics.
                </p>
              </div>

              {/* Current Expertises Status */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#51625d] mb-3">
                  Your Submitted Expertise Topics
                </h4>
                {myExpertises.length === 0 ? (
                  <p className="text-xs text-[#71827d]">
                    You have not applied for any verified expertise topics yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myExpertises.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e2e8e5] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-sm text-[#141f1c]">{exp.concept_tag}</span>
                          <span className="text-[#51625d] block text-[11px]">{exp.category_name}</span>
                          {exp.review_notes && (
                            <span className="text-[#9d552d] block text-[11px] mt-0.5">Note: {exp.review_notes}</span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            exp.status === "verified"
                              ? "bg-[#e5f0ec] text-[#0f4a3c]"
                              : exp.status === "rejected"
                              ? "bg-[#fbeeed] text-[#a43838]"
                              : "bg-[#fff2e7] text-[#9d552d]"
                          }`}
                        >
                          {exp.status === "verified" ? "✓ Verified" : exp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {applySuccess && (
                <div className="mb-4 p-3 rounded-xl bg-[#e5f0ec] text-[#0f4a3c] text-xs font-semibold">
                  ✓ {applySuccess}
                </div>
              )}
              {applyError && (
                <div className="mb-4 p-3 rounded-xl bg-[#fbeeed] text-[#a43838] text-xs font-semibold">
                  ✕ {applyError}
                </div>
              )}

              <form onSubmit={handleApplyExpertise} className="space-y-3.5 pt-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Expertise Category
                    </label>
                    <select
                      required
                      value={applyCategory}
                      onChange={(e) => setApplyCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                      Specific Concept / Topic Tag
                    </label>
                    <input
                      required
                      type="text"
                      value={applyConcept}
                      onChange={(e) => setApplyConcept(e.target.value)}
                      placeholder="e.g. Probability, Computer Vision, React"
                      className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={applyingExpertise}
                  className="py-2.5 px-5 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {applyingExpertise ? "Submitting..." : "Submit for Admin Verification →"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>

      {/* ------------------- MODAL: REQUEST CONNECTION ------------------- */}
      {targetMentorForConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#d8e2de] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8eeec]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f4a3c]">
                  Practical Skill Mentorship
                </span>
                <h3 className="text-lg font-bold text-[#0d1a16] tracking-[-0.02em]">
                  Connect with {targetMentorForConnection.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetMentorForConnection(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {connectionSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-[#e5f0ec] text-[#0f4a3c] text-xs font-semibold">
                ✓ {connectionSuccess}
              </div>
            )}
            {connectionError && (
              <div className="mt-4 p-3 rounded-xl bg-[#fbeeed] text-[#a43838] text-xs font-semibold">
                ✕ {connectionError}
              </div>
            )}

            {!connectionSuccess && (
              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Related Skill or Project Focus (optional)
                  </label>
                  <input
                    type="text"
                    value={connectionConcept}
                    onChange={(e) => setConnectionConcept(e.target.value)}
                    placeholder="e.g. Next.js Architecture, PyTorch Computer Vision, Hackathon Project"
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Introduction & Project Goal
                  </label>
                  <textarea
                    rows={3}
                    value={connectionNote}
                    onChange={(e) => setConnectionNote(e.target.value)}
                    placeholder="Describe what skill or project you want to build, or what technical challenge you'd like mentorship on..."
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-xs focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetMentorForConnection(null)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#51625d] hover:bg-[#f4f7f6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={sendingConnection}
                    onClick={handleSendConnection}
                    className="py-2.5 px-5 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {sendingConnection ? "Sending..." : "Send Mentorship Request"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ASK QUESTION (3 MODES) ------------------- */}
      {targetMentorForQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#d8e2de] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8eeec]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f4a3c]">
                  Direct Practical Skill Guidance
                </span>
                <h3 className="text-lg font-bold text-[#0d1a16] tracking-[-0.02em]">
                  Ask {targetMentorForQuestion.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetMentorForQuestion(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {questionSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-[#e5f0ec] text-[#0f4a3c] text-xs font-semibold">
                ✓ {questionSuccess}
              </div>
            )}
            {questionError && (
              <div className="mt-4 p-3 rounded-xl bg-[#fbeeed] text-[#a43838] text-xs font-semibold">
                ✕ {questionError}
              </div>
            )}

            {!questionSuccess && (
              <form onSubmit={handlePostQuestion} className="mt-4 space-y-4">
                {/* 3 Question Modes Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#51625d] mb-2">
                    Privacy Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuestionMode("anonymous")}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                        questionMode === "anonymous"
                          ? "border-[#0f4a3c] bg-[#e5f0ec] text-[#0f4a3c] font-bold"
                          : "border-[#d8e2de] bg-[#f8faf9] text-[#51625d]"
                      }`}
                    >
                      <div className="text-xs font-bold">Anonymous</div>
                      <div className="text-[10px] opacity-75">Identity hidden</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionMode("public")}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                        questionMode === "public"
                          ? "border-[#0f4a3c] bg-[#e5f0ec] text-[#0f4a3c] font-bold"
                          : "border-[#d8e2de] bg-[#f8faf9] text-[#51625d]"
                      }`}
                    >
                      <div className="text-xs font-bold">Show My Name</div>
                      <div className="text-[10px] opacity-75">Public profile</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionMode("private")}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                        questionMode === "private"
                          ? "border-[#0f4a3c] bg-[#e5f0ec] text-[#0f4a3c] font-bold"
                          : "border-[#d8e2de] bg-[#f8faf9] text-[#51625d]"
                      }`}
                    >
                      <div className="text-xs font-bold">Private Request</div>
                      <div className="text-[10px] opacity-75">Only mentor & you</div>
                    </button>
                  </div>
                  {questionMode === "anonymous" && (
                    <p className="mt-1.5 text-[11px] text-[#71827d]">
                      Your identity will be displayed as "Anonymous Student" to peers and mentors. Backend retains authentic audit identity for security.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Skill Question Title
                  </label>
                  <input
                    required
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="e.g. How do I optimize inference latency for PyTorch models?"
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e2925] mb-1">
                    Technical Details & Context
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={questionBody}
                    onChange={(e) => setQuestionBody(e.target.value)}
                    placeholder="Provide details on your tech stack, architecture, code snippets, or what you've tried so far..."
                    className="w-full px-3.5 py-2.5 bg-[#f8faf9] border border-[#d8e2de] rounded-xl text-sm focus:bg-white focus:border-[#0f4a3c] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetMentorForQuestion(null)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#51625d] hover:bg-[#f4f7f6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuestion}
                    className="py-2.5 px-5 rounded-xl bg-[#0f4a3c] hover:bg-[#0b382d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {submittingQuestion ? "Posting..." : "Post Skill Question"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
