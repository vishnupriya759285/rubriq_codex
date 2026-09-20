"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

type NotificationResponse = {
  unread_count: number;
  items: NotificationItem[];
};

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const data = await api.get<NotificationResponse>(
        "/api/network/notifications",
      );
      setUnreadCount(data.unread_count || 0);
      setItems(data.items || []);
    } catch {
      // silent fallback
    }
  }

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markAsRead(id: string) {
    try {
      await api.patch(`/api/network/notifications/${id}/read`, {});
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      setLoading(true);
      await api.patch("/api/network/notifications/read-all", {});
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#f2f3ef] hover:bg-[#dcebe4] text-[#17634e] transition-colors border border-[#dfe3de] cursor-pointer"
        aria-label="Campus Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#a43838] text-white text-[10px] font-bold rounded-full border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-[#dfe3de] z-50 overflow-hidden divide-y divide-[#dfe3de] animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 px-4 bg-[#f2f3ef] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#14201c]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#dcebe4] text-[#17634e] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs font-semibold text-[#17634e] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#ecefeb]">
            {items.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#697770]">
                <div className="w-10 h-10 rounded-full bg-[#f2f3ef] flex items-center justify-center mx-auto text-[#17634e] mb-2">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                No notifications yet. Activity will appear here.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.is_read) void markAsRead(item.id);
                  }}
                  className={`p-3.5 sm:p-4 text-left transition-colors cursor-pointer ${
                    item.is_read
                      ? "bg-white hover:bg-[#f2f3ef]"
                      : "bg-[#dcebe4]/40 hover:bg-[#dcebe4]/60 border-l-3 border-l-[#17634e]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-[#14201c] leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-[#8ea29a] shrink-0">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#697770] line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                  {item.link_url && (
                    <Link
                      href={item.link_url}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#17634e] hover:underline"
                    >
                      <span>View details</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
