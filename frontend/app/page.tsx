"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";

type Submission = {
  id: string;
  student_name: string;
  exam_title: string;
  status: string;
  total_score: number;
  total_marks: number;
  reason?: string;
};
type Dashboard = {
  metrics: {
    active_exams: number;
    total_papers: number;
    completed_papers: number;
    in_progress_papers: number;
    failed_papers: number;
    average_percentage: number;
    required_reviews: number;
    recommended_reviews: number;
  };
  review_papers: Submission[];
  submissions: Submission[];
};

function statusClass(status: string) {
  if (status === "review_required" || status === "failed")
    return "status-danger";
  if (
    [
      "uploaded",
      "preprocessing",
      "transcribing",
      "structured",
      "grading",
    ].includes(status)
  )
    return "status-neutral";
  return "status-success";
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get<Dashboard>("/api/dashboard")
      .then(setData)
      .catch(() => setError("Sign in to load your workspace."));
  }, []);
  const metrics = data?.metrics;
  const completion = metrics?.total_papers
    ? Math.round((metrics.completed_papers / metrics.total_papers) * 100)
    : 0;

  return (
    <AppShell
      actions={
        <Link href="/exams/new" className="button-primary">
          <span className="button-plus">+</span> Create assessment
        </Link>
      }
    >
      <section id="workspace" className="dashboard-page">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">Assessment intelligence</span>
            <h1>Your grading command center.</h1>
            <p>
              One clear view of progress, evidence quality, and the decisions
              that need your attention.
            </p>
          </div>
          <div className="dashboard-actions">
            <Link href="/assistant" className="button-secondary">
              Ask about class evidence
            </Link>
            <Link href="/exams" className="button-quiet">
              View assessments <ArrowIcon />
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="alert-banner">
            {error} <Link href="/login">Open sign in</Link>
          </p>
        )}

        <section className="command-hero">
          <div className="command-glow" />
          <div className="command-copy">
            <span className="live-label">
              <i /> Live assessment pulse
            </span>
            <h2>
              {metrics
                ? metrics.required_reviews > 0
                  ? `${metrics.required_reviews} decisions need your expertise.`
                  : "Your review queue is under control."
                : "Building your assessment pulse..."}
            </h2>
            <p>
              Rubriq has processed {metrics?.total_papers ?? "—"} papers while
              keeping every score connected to its source evidence.
            </p>
            <div className="command-actions">
              <Link href="/submissions" className="hero-button">
                Open review queue <ArrowIcon />
              </Link>
              <Link href="/exams/new" className="hero-link">
                Create assessment <span>+</span>
              </Link>
            </div>
          </div>
          <div className="command-visual">
            <div
              className="completion-ring"
              style={
                { "--progress": `${completion * 3.6}deg` } as CSSProperties
              }
            >
              <div>
                <strong>{completion}%</strong>
                <span>complete</span>
              </div>
            </div>
            <div className="hero-stat-stack">
              <div>
                <span>In progress</span>
                <strong>{metrics?.in_progress_papers ?? "—"}</strong>
              </div>
              <div>
                <span>Class average</span>
                <strong>
                  {metrics ? `${metrics.average_percentage}%` : "—"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="metrics-grid">
          <Metric
            label="Active assessments"
            value={metrics ? String(metrics.active_exams) : "—"}
            note="Ready for marking"
            icon="document"
          />
          <Metric
            label="Papers completed"
            value={
              metrics
                ? `${metrics.completed_papers}/${metrics.total_papers}`
                : "—"
            }
            note={
              metrics
                ? `${metrics.in_progress_papers} currently processing`
                : "Loading workspace"
            }
            icon="check"
            progress={completion}
          />
          <Metric
            label="Class average"
            value={metrics ? `${metrics.average_percentage}%` : "—"}
            note="Across evaluated papers"
            icon="chart"
          />
          <Metric
            label="Needs attention"
            value={
              metrics
                ? String(metrics.required_reviews + metrics.recommended_reviews)
                : "—"
            }
            note={
              metrics
                ? `${metrics.required_reviews} required · ${metrics.recommended_reviews} suggested`
                : "Teacher review queue"
            }
            icon="flag"
            tone={metrics?.required_reviews ? "danger" : "review"}
          />
        </div>

        <div className="dashboard-columns">
          <section className="panel review-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">Priority queue</span>
                <h2>Papers to review</h2>
              </div>
              <Link href="/submissions" className="text-link">
                View all <ArrowIcon />
              </Link>
            </div>
            <div className="panel-list">
              {data?.review_papers.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/submissions/${item.id}`}
                  className="review-row"
                >
                  <span className="review-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="review-copy">
                    <strong>{item.student_name}</strong>
                    <span>{item.exam_title}</span>
                    <em>{item.reason || "Teacher check recommended"}</em>
                  </span>
                  <span className="review-score">
                    <strong>
                      {item.total_score.toFixed(1)}
                      <small>/{item.total_marks}</small>
                    </strong>
                    <span>Review paper</span>
                  </span>
                  <span className="row-arrow">
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
              {data && data.review_papers.length === 0 && (
                <EmptyState
                  title="Review queue cleared"
                  text="No papers currently need teacher attention."
                />
              )}
              {!data && <LoadingRows count={3} />}
            </div>
          </section>

          <section className="panel recent-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">Latest activity</span>
                <h2>Recent papers</h2>
              </div>
              <Link href="/submissions" className="text-link">
                View all <ArrowIcon />
              </Link>
            </div>
            <div className="panel-list compact-list">
              {data?.submissions.slice(0, 6).map((item) => {
                const initials = item.student_name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();
                return (
                  <Link
                    key={item.id}
                    href={`/submissions/${item.id}`}
                    className="paper-row"
                  >
                    <span className="student-avatar">{initials}</span>
                    <span className="paper-copy">
                      <strong>{item.student_name}</strong>
                      <span>{item.exam_title}</span>
                    </span>
                    <span className="paper-meta">
                      <strong>
                        {item.total_score.toFixed(1)}/{item.total_marks}
                      </strong>
                      <span
                        className={`status-pill ${statusClass(item.status)}`}
                      >
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </span>
                  </Link>
                );
              })}
              {!data && <LoadingRows count={4} />}
              {data?.submissions.length === 0 && (
                <EmptyState
                  title="No papers yet"
                  text="Upload a paper to begin its evidence trail."
                />
              )}
            </div>
            {metrics && metrics.failed_papers > 0 && (
              <p className="panel-warning">
                {metrics.failed_papers} paper
                {metrics.failed_papers === 1 ? "" : "s"} need processing
                attention.
              </p>
            )}
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
  tone,
  progress,
}: {
  label: string;
  value: string;
  note: string;
  icon: "document" | "check" | "chart" | "flag";
  tone?: "danger" | "review";
  progress?: number;
}) {
  const icons: Record<string, ReactNode> = {
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </>
    ),
    flag: (
      <>
        <path d="M5 21V4M5 5h11l-1 4 1 4H5" />
      </>
    ),
  };
  return (
    <article className={`metric-card ${tone ? `metric-${tone}` : ""}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icons[icon]}
          </svg>
        </span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p>{note}</p>
      {progress !== undefined && (
        <div
          className="metric-progress"
          role="progressbar"
          aria-label="Papers completed"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  );
}

function LoadingRows({ count }: { count: number }) {
  const keys = ["first", "second", "third", "fourth", "fifth", "sixth"];
  return (
    <>
      {keys.slice(0, count).map((key) => (
        <div className="loading-row" key={key}>
          <span />
          <div>
            <span />
            <span />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <span>✓</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
