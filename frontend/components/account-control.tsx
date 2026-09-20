"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/session-provider";

export function AccountControl() {
  const router = useRouter();
  const { account, logout } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  async function signOut() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  }

  if (!account) return null;
  const initials = account.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="account-control">
      <Link
        href={account.role === "student" ? "/student" : "/"}
        className="account-profile"
        title={account.name}
      >
        <span className="account-avatar">{initials}</span>
        <span className="account-copy">
          <strong>{account.name}</strong>
          <small>{account.role}</small>
        </span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        disabled={loggingOut}
        className="account-signout"
        aria-label="Sign out"
        title="Sign out"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </div>
  );
}
