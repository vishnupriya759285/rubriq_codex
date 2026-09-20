"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { api } from "@/lib/api";

type IconName = "workspace" | "classes" | "exams" | "papers" | "assistant";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Overview", icon: "workspace" },
  { href: "/classes", label: "Classes", icon: "classes" },
  { href: "/exams", label: "Assessments", icon: "exams" },
  { href: "/submissions", label: "Papers", icon: "papers" },
  { href: "/assistant", label: "Ask Rubriq", icon: "assistant" },
];

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    workspace: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    classes: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    exams: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    papers: (
      <>
        <path d="M16 3H5a2 2 0 0 0-2 2v11" />
        <path d="M8 7h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <path d="M10 12h7M10 16h5" />
      </>
    ),
    assistant: (
      <>
        <path d="m12 3-1.3 3.7L7 8l3.7 1.3L12 13l1.3-3.7L17 8l-3.7-1.3L12 3Z" />
        <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  actions,
  workbench = false,
}: {
  children: ReactNode;
  actions?: ReactNode;
  workbench?: boolean;
}) {
  const pathname = usePathname();
  const currentItem = items.find((item) => isCurrent(pathname, item.href));
  const [taskCount, setTaskCount] = useState(0);
  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get<{ items: unknown[] }>("/api/processing-jobs")
        .then((data) => {
          if (active) setTaskCount(data.items.length);
        })
        .catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="app-sidebar" aria-label="Teacher navigation">
        <Link
          href="/"
          className="brand-lockup sidebar-brand"
          aria-label="Rubriq home"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg aria-hidden="true" viewBox="0 0 28 28" fill="none">
              <path
                d="M7 5.5h8.5a5 5 0 0 1 0 10H7v-10Z"
                stroke="currentColor"
                strokeWidth="2.4"
              />
              <path
                d="m14 15.5 6.5 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M7 10.5h8"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            <strong>Rubriq</strong>
            <small>Assessment intelligence</small>
          </span>
        </Link>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="app-nav-link"
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            >
              <span className="nav-icon">
                <NavIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
              {item.href === "/assistant" && (
                <span className="nav-ai-badge">AI</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <Link href="/exams/new" className="sidebar-create">
          <span>+</span>
          <span>
            <strong>New assessment</strong>
            <small>Build a rubric and exam</small>
          </span>
        </Link>
        <div className="sidebar-note">
          <div className="sidebar-note-icon">✓</div>
          <div>
            <strong>Evidence-first grading</strong>
            <p>Every decision stays traceable to the source.</p>
          </div>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-header">
          <div className="app-header-inner">
            <Link
              href="/"
              className="brand-lockup mobile-brand"
              aria-label="Rubriq home"
            >
              <span className="brand-mark" aria-hidden="true">
                <svg aria-hidden="true" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M7 5.5h8.5a5 5 0 0 1 0 10H7v-10Z"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  />
                  <path
                    d="m14 15.5 6.5 7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 10.5h8"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <strong>Rubriq</strong>
                <small>Assessment intelligence</small>
              </span>
            </Link>
            <div className="topbar-context">
              <span>Rubriq workspace</span>
              <strong>{currentItem?.label ?? "Workspace"}</strong>
            </div>
            <div className="header-tools">
              <span className="system-status">
                <i /> Systems ready
              </span>
              {taskCount > 0 && (
                <Link href="/submissions" className="processing-chip">
                  <span /> {taskCount} processing
                </Link>
              )}
              <div className="hidden sm:block">{actions}</div>
              <NotificationBell />
              <AccountControl />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className={`app-main page-enter ${workbench ? "xl:h-[calc(100dvh-4.5rem)] xl:overflow-hidden" : ""}`}
        >
          {children}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Teacher navigation">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-nav-link"
            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          >
            <span className="nav-icon">
              <NavIcon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
