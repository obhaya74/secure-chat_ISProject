import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { sendKeyRequest } from "../api/api";
import { useKeyRequestStore } from "../store/useKeyRequestStore";

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const users = useChatStore((state) => state.users);
  const fetchUsers = useChatStore((state) => state.fetchUsers);
  const selectUser = useChatStore((state) => state.selectUser);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const fetchChatHistory = useChatStore((state) => state.fetchChatHistory);

  const { requests, loading, loadRequests, accept, reject } =
    useKeyRequestStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  // theme
  const isDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const bg = isDark ? "#0b141a" : "#f7f9fb";
  const panel = isDark ? "#071014" : "#ffffff";
  const accent = "#25D366";
  const text = isDark ? "#e7eef0" : "#0f1724";
  const muted = isDark ? "#7b8a8f" : "#6b7280";

  // If user isn't ready yet
  if (!user) {
    return (
      <aside style={{
        width: 300, padding: 18, borderRight: `1px solid ${isDark ? '#071f23' : '#e6eef7'}`,
        background: panel, height: "100vh", boxSizing: "border-box"
      }}>
        <div style={{ color: muted }}>Loading user...</div>
      </aside>
    );
  }

  const handleSelectUser = (u) => {
    if (!u) return;
    selectUser(u);
    fetchChatHistory(user._id, u._id);
  };

  const handleSendKeyRequest = async () => {
    if (!user || !selectedUser || selectedUser._id === user._id) return;

    const senderPubEcdhJwk = { kty: "EC", dummy: true };
    const senderPubSigningJwk = { dummy: true };

    try {
      const res = await sendKeyRequest({
        receiverId: selectedUser._id,
        senderPubEcdhJwk,
        senderPubSigningJwk,
      });

      alert(res.message || "Request sent");
    } catch (err) {
      console.error("Failed to send key request:", err);
      alert("Failed to send request");
    }
  };

  const viewingSelf =
    selectedUser && selectedUser._id && selectedUser._id === user._id;

  return (
    <aside style={{
      width: 300,
      padding: 18,
      borderRight: `1px solid ${isDark ? '#071f23' : '#e6eef7'}`,
      background: panel,
      height: "100vh",
      boxSizing: "border-box",
      overflowY: "auto"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 10, background: accent,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#05311B", fontWeight: 800
        }}>WA</div>

        <div>
          <div style={{ fontWeight: 700, color: text }}>{user.username}</div>
          <div style={{ fontSize: 12, color: muted }}>Online</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search users..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.06)",
            background: isDark ? "#07161a" : "#f3f6f8",
            color: text
          }}
          // optional: implement search later
        />
      </div>

      <div style={{ marginBottom: 12, color: muted, fontSize: 13 }}>Users</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.length === 0 ? (
          <div style={{ color: muted }}>No users</div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: selectedUser?._id === u._id ? (isDark ? "#062022" : "#e7fff3") : "transparent"
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: "#cbd5e1",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#223"
              }}>
                {u.username?.slice(0,1)?.toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: text }}>{u.username}</div>
                <div style={{ fontSize: 12, color: muted }}>tap to open</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div style={{ marginTop: 18 }}>
        {/* Don't show key request to self */}
        {selectedUser && selectedUser._id !== user._id && (
          <button
            onClick={handleSendKeyRequest}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              background: accent,
              color: "#05311B",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send Key Exchange Request
          </button>
        )}
      </div>

      {/* Incoming requests only if viewing self */}
      {viewingSelf && (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ margin: 0, color: text }}>Incoming Key Requests</h4>
          <button
            onClick={() => loadRequests()}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 8,
              marginBottom: 8,
              background: isDark ? "#0b2630" : "#eef2f6",
              borderRadius: 8,
              border: "none",
              cursor: "pointer"
            }}
          >
            Refresh
          </button>

          {loading ? <div style={{ color: muted }}>Loading…</div> : null}

          {(!loading && requests.length === 0) && <div style={{ color: muted }}>No requests</div>}

          {requests.map((req) => (
            <div key={req._id} style={{ padding: 10, borderRadius: 8, marginTop: 8, background: isDark ? "#07161a" : "#fff" }}>
              <div style={{ color: text, fontWeight: 700 }}>{req.sender.username}</div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => accept(req._id, req.sender)}
                  style={{
                    flex: 1, padding: 8, borderRadius: 8, background: "#12a454", color: "#052f1d", border: "none", fontWeight: 700
                  }}
                >
                  Accept
                </button>

                <button
                  onClick={() => reject(req._id)}
                  style={{
                    flex: 1, padding: 8, borderRadius: 8, background: "#f44336", color: "#fff", border: "none", fontWeight: 700
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
