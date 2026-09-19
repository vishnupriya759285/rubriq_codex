"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  must_change_password?: boolean;
};

type SessionContextValue = {
  account: Account | null;
  loading: boolean;
  refresh: () => Promise<Account | null>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const nextAccount = await api.get<Account>("/api/auth/me");
      setAccount(nextAccount);
      return nextAccount;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.error("Unable to verify Rubriq session", error);
      }
      setAccount(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api.post<null>("/api/auth/logout");
    setAccount(null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <SessionContext.Provider value={{ account, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session)
    throw new Error("useSession must be used within SessionProvider.");
  return session;
}

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, loading } = useSession();
  const isLogin = pathname === "/login";
  const isStudentRoute =
    pathname === "/student" || pathname.startsWith("/student/");
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (loading) return;
    if (isLogin && account) {
      if (account.role === "admin") {
        router.replace("/admin/network");
      } else if (account.role === "student") {
        router.replace("/student");
      } else {
        router.replace("/");
      }
      return;
    }
    if (!isLogin && !account) {
      router.replace("/login");
      return;
    }
    if (account?.role === "student" && !isStudentRoute)
      router.replace("/student");
    if (account?.role === "teacher" && (isStudentRoute || isAdminRoute))
      router.replace("/");
    if (account?.role === "admin" && !isAdminRoute && !isStudentRoute)
      router.replace("/admin/network");
  }, [account, isLogin, isStudentRoute, isAdminRoute, loading, router]);

  const permitted =
    (isLogin && !account) ||
    (account?.role === "student" && isStudentRoute) ||
    (account?.role === "teacher" && !isStudentRoute && !isAdminRoute) ||
    (account?.role === "admin");

  if (loading || !permitted) return null;
  return children;
}
