"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AccountControl } from "@/components/account-control";
import { NotificationBell } from "@/components/notification-bell";
import { api } from "@/lib/api";

type Connection = {
  id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  is_requester: boolean;
  other_account_id: string;
  other_name: string;
  other_role: string;
  other_department: string;
  verified_badges: string[];
  concept_tag?: string | null;
  note?: string | null;
  conversation_id?: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  sender_account_id: string;
  is_mine: boolean;
  body: string;
  read_at?: string | null;
  created_at: string;
};

export default function MyConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConnection, setActiveConnection] = useState<Connection | null>(
    null,
  );

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadConnections() {
    try {
      setLoading(true);
      const res = await api.get<{ items: Connection[] }>(
        "/api/network/connections",
      );
      const list = res.items || [];
      setConnections(list);
      // Auto-select first accepted connection if none selected
      if (!activeConnection && list.length > 0) {
        const firstAccepted = list.find((c) => c.status === "accepted");
        if (firstAccepted) {
          setActiveConnection(firstAccepted);
        }
      }
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConnections();
  }, []);

  // Load chat messages when active connection changes
  async function loadMessages(connId: string) {
    try {
      setChatLoading(true);
      const res = await api.get<{ messages: Message[] }>(
        `/api/network/conversations/${connId}/messages` as `/api/${string}`,
      );
      setMessages(res.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (!activeConnection || activeConnection.status !== "accepted") return;
    void loadMessages(activeConnection.id);

    // Live polling every 4 seconds for real-time messages
    const interval = setInterval(() => {
      void api
        .get<{ messages: Message[] }>(
          `/api/network/conversations/${activeConnection.id}/messages` as `/api/${string}`,
        )
        .then((res) => {
          setMessages(res.messages || []);
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConnection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAccept(id: string) {
    try {
      await api.patch(`/api/network/connections/${id}`, { status: "accepted" });
      void loadConnections();
    } catch (err: any) {
      alert(err?.message || "Failed to accept connection.");
    }
  }

  async function handleDecline(id: string) {
    try {
      await api.patch(`/api/network/connections/${id}`, { status: "declined" });
      void loadConnections();
    } catch (err: any) {
      alert(err?.message || "Failed to decline connection.");
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConnection || !newMessage.trim() || sendingMessage) return;
    const text = newMessage.trim();
    setSendingMessage(true);
    try {
      const sent = await api.post<Message>(
        `/api/network/conversations/${activeConnection.id}/messages` as `/api/${string}`,
        { body: text },
      );
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch (err: any) {
      alert(err?.message || "Could not send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  const incomingPending = connections.filter(
    (c) => c.status === "pending" && !c.is_requester,
  );
  const outgoingPending = connections.filter(
    (c) => c.status === "pending" && c.is_requester,
  );
  const acceptedConnections = connections.filter(
    (c) => c.status === "accepted",
  );

  return (
    <main className="min-h-screen bg-[#fcfdfb] text-[#14201c]">
      {/* Sticky Top Header */}
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
              Campus Connect · Mentorships
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
              className="text-[#697770] hover:text-[#17634e] transition-colors"
            >
              Skill Q&A
            </Link>
            <Link
              href="/student/connections"
              className="font-semibold text-[#17634e] border-b-2 border-[#17634e] pb-0.5"
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#17634e] bg-[#dcebe4] px-2 py-0.5 rounded-full">
                1-on-1 Practical Guidance
              </span>
            </div>
            <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-[#14201c]">
              Skill Mentorships & Project Collaboration
            </h1>
            <p className="mt-1 text-sm text-[#697770] max-w-2xl leading-relaxed">
              Collaborate 1-on-1 with verified mentors and peers to review code,
              discuss system architecture, prepare for hackathons, and master
              hands-on skills.
            </p>
          </div>
          <Link
            href="/student/network"
            className="py-2.5 px-4 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>+ Find Skill Mentor</span>
          </Link>
        </div>

        {/* Incoming Connection Requests Notice */}
        {incomingPending.length > 0 && (
          <section className="mb-8 rounded-2xl bg-[#fff8f3] border border-[#fbdcc8] p-5 shadow-xs">
            <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#9d552d] flex items-center gap-2 mb-3">
              <span>🔔</span>
              <span>
                Incoming Skill Mentorship Requests ({incomingPending.length})
              </span>
            </h3>
            <div className="space-y-3">
              {incomingPending.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-white border border-[#f0ded2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-sm text-[#14201c]">
                      {req.other_name}
                    </span>
                    <span className="text-xs text-[#697770] ml-2">
                      · {req.other_role}
                    </span>
                    {req.concept_tag && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-[#dcebe4] text-[#17634e] text-[11px] font-semibold rounded-md">
                        Concept: {req.concept_tag}
                      </span>
                    )}
                    {req.note && (
                      <p className="mt-1 text-xs text-[#697770]">
                        "{req.note}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAccept(req.id)}
                      className="py-1.5 px-3.5 rounded-lg bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecline(req.id)}
                      className="py-1.5 px-3 rounded-lg bg-[#f2f3ef] hover:bg-[#dfe3de] text-[#697770] text-xs font-semibold cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Master-Detail Layout: Connection List (Left) & Real-time Chat Thread (Right) */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          {/* Left Column: Connections List */}
          <section className="space-y-6">
            <div className="rounded-2xl bg-white border border-[#dfe3de] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#f2f3ef] border-b border-[#dfe3de] flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#14201c]">
                  Active Connections
                </h3>
                <span className="text-xs font-semibold text-[#697770] bg-[#ecefeb] px-2 py-0.5 rounded-full">
                  {acceptedConnections.length}
                </span>
              </div>

              {loading && (
                <div className="p-8 text-center text-sm text-[#697770]">
                  Loading your connections...
                </div>
              )}

              {/* STRICT RULE: Empty state when no connections. NO FAKE DATA! */}
              {!loading && connections.length === 0 && (
                <div className="p-8 text-center">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm text-[#14201c]">
                    You haven't connected with anyone yet.
                  </h4>
                  <p className="mt-1 text-xs text-[#697770] max-w-xs mx-auto leading-relaxed">
                    Explore verified mentors in the Campus Network to request
                    guidance or answer questions.
                  </p>
                  <Link
                    href="/student/network"
                    className="mt-3.5 inline-block py-1.5 px-3.5 rounded-xl bg-[#17634e] text-white text-xs font-semibold shadow-xs hover:bg-[#0d3d31]"
                  >
                    Find a Mentor →
                  </Link>
                </div>
              )}

              {/* Accepted Connections List */}
              <div className="divide-y divide-[#dfe3de]">
                {acceptedConnections.map((conn) => {
                  const isSelected = activeConnection?.id === conn.id;
                  return (
                    <button
                      type="button"
                      key={conn.id}
                      onClick={() => setActiveConnection(conn)}
                      className={`w-full p-4 text-left transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#dcebe4]/70 border-l-4 border-l-[#17634e]"
                          : "hover:bg-[#f2f3ef]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[#14201c] leading-tight">
                            {conn.other_name}
                          </h4>
                          <span className="text-xs text-[#697770] block mt-0.5">
                            {conn.other_role}{" "}
                            {conn.other_department &&
                              `· ${conn.other_department}`}
                          </span>
                          {conn.verified_badges?.length > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-[#17634e] bg-[#dcebe4] px-1.5 py-0.5 rounded">
                              {conn.verified_badges[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8ea29a] shrink-0">
                          {new Date(conn.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Outgoing Pending Requests */}
            {outgoingPending.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#dfe3de] p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8ea29a] mb-2.5">
                  Pending Sent Requests ({outgoingPending.length})
                </h4>
                <div className="space-y-2">
                  {outgoingPending.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-[#f2f3ef] border border-[#dfe3de] text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-[#14201c]">
                          {p.other_name}
                        </span>
                        <span className="text-[#8ea29a] block text-[11px]">
                          {p.other_role}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff2e7] text-[#9d552d]">
                        Awaiting Response
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Real-Time Chat Thread */}
          <section className="rounded-2xl bg-white border border-[#dfe3de] shadow-xs flex flex-col h-[600px] overflow-hidden">
            {activeConnection && activeConnection.status === "accepted" ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-[#f2f3ef] border-b border-[#dfe3de] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#17634e] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {activeConnection.other_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#14201c] leading-tight">
                        {activeConnection.other_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#697770]">
                        <span>{activeConnection.other_role}</span>
                        {activeConnection.concept_tag && (
                          <span>· Concept: {activeConnection.concept_tag}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#17634e] font-semibold bg-[#dcebe4] px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#17634e] animate-pulse" />
                    Active Chat
                  </span>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfdfb]">
                  {chatLoading && messages.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#697770]">
                      Loading messages...
                    </div>
                  )}

                  {!chatLoading && messages.length === 0 && (
                    <div className="p-12 text-center text-xs text-[#8ea29a]">
                      <p className="font-semibold text-sm text-[#14201c] mb-1">
                        Start your academic conversation
                      </p>
                      Send a message to discuss your questions, study materials,
                      or schedule guidance.
                    </div>
                  )}

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.is_mine ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                          m.is_mine
                            ? "bg-[#17634e] text-white rounded-br-xs shadow-xs"
                            : "bg-white text-[#14201c] border border-[#dfe3de] rounded-bl-xs shadow-2xs"
                        }`}
                      >
                        {m.body}
                      </div>
                      <span className="text-[10px] text-[#8ea29a] mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-[#dfe3de] bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${activeConnection.other_name}...`}
                    className="flex-1 px-4 py-2.5 bg-[#f2f3ef] border border-[#dfe3de] rounded-xl text-sm focus:bg-white focus:border-[#17634e] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="py-2.5 px-5 rounded-xl bg-[#17634e] hover:bg-[#0d3d31] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {sendingMessage ? "..." : "Send →"}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#697770]">
                <div className="w-12 h-12 rounded-full bg-[#f2f3ef] flex items-center justify-center text-[#17634e] mb-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-base text-[#14201c]">
                  Select a connection to chat
                </h3>
                <p className="mt-1 text-xs text-[#8ea29a] max-w-xs">
                  Select any accepted mentor from your active connections list
                  on the left to start exchanging messages.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
