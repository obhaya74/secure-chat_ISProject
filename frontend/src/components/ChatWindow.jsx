import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const auth = useAuthStore();
  const { selectedUser, fetchChatHistory, allowedUsers } = useChatStore();

  const myId = auth.user?._id;
  const otherId = selectedUser?._id;

  const isAllowedToChat = selectedUser && allowedUsers && allowedUsers[otherId] === true;

  useEffect(() => {
    if (!selectedUser || !auth.user) return;

    // Only load chat history if request was accepted
    if (isAllowedToChat) {
      fetchChatHistory(auth.user._id, selectedUser._id);
    }
  }, [selectedUser, auth.user, isAllowedToChat]);

  // theme
  const isDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const headerBg = isDark ? "#063229" : "#25D366";
  const headerText = isDark ? "#e6fff4" : "#05311B";

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: isDark ? "#071017" : "#f3f7f9" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 18px", background: headerBg, color: headerText }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: "#ffffff22",
            display: "flex", alignItems: "center", justifyContent: "center", color: headerText, fontWeight: 700
          }}>
            {selectedUser ? (selectedUser.username?.slice(0,1).toUpperCase()) : "?"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedUser ? selectedUser.username : "Select a user"}</div>
            <div style={{ fontSize: 12 }}>{selectedUser ? "Encrypted chat" : "Pick a contact to start"}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* If no user selected */}
        {!selectedUser && (
          <div style={{ padding: 28, color: isDark ? "#9aa6a8" : "#6b7280" }}>
            Select a user to start.
          </div>
        )}

        {/* If user selected but chat not allowed yet */}
        {selectedUser && !isAllowedToChat && (
          <div style={{ padding: 20, color: "#b91c1c", fontWeight: 700 }}>
            Chat disabled — accept key exchange request first.
          </div>
        )}

        {/* Allowed: show messages */}
        {selectedUser && isAllowedToChat && (
          <>
            <div style={{ flex: 1, overflowY: "auto", background: isDark ? "#041013" : "#e9f3ef" }}>
              <MessageList />
            </div>

            <div style={{ borderTop: `1px solid ${isDark ? '#07161a' : '#e6eef7'}` }}>
              <MessageInput />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
