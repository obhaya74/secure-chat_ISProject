// src/components/MessageList.jsx
import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function MessageList() {
  const { messages, selectedUser } = useChatStore();
  const { user } = useAuthStore();

  if (!selectedUser || !user) return null;

  const otherId = selectedUser._id;
  const chat = messages[otherId] || [];

  const isImage = (name) => {
    if (!name) return false;
    const n = name.toLowerCase();
    return n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".gif") || n.endsWith(".webp");
  };

  return (
    <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {chat.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        chat.map((msg) => {
          const mine = msg.sender && String(msg.sender._id || msg.sender) === String(user._id);
          const baseStyle = {
            marginBottom: "6px",
            padding: "10px",
            background: mine ? "#d1ffd6" : "#e8e8e8",
            borderRadius: "8px",
            maxWidth: "70%",
            alignSelf: mine ? "flex-end" : "flex-start",
            wordBreak: "break-word",
          };

          // If this message has a file
          if (msg.fileUrl) {
            const fullUrl = msg.fileUrl.startsWith("http") ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`;
            if (isImage(msg.fileName)) {
              return (
                <div key={msg._id} style={baseStyle}>
                  <div style={{ fontSize: "12px", marginBottom: "6px", color: "#333" }}>
                    {msg.fileName}
                  </div>
                  <a href={fullUrl} target="_blank" rel="noreferrer">
                    <img src={fullUrl} alt={msg.fileName} style={{ maxWidth: "280px", borderRadius: "6px" }} />
                  </a>
                </div>
              );
            } else {
              return (
                <div key={msg._id} style={baseStyle}>
                  <a href={fullUrl} download={msg.fileName} target="_blank" rel="noreferrer" style={{ color: "#0066cc" }}>
                    📎 {msg.fileName}
                  </a>
                </div>
              );
            }
          }

          // Otherwise regular ciphertext/text message
          return (
            <div key={msg._id} style={baseStyle}>
              {msg.ciphertext}
            </div>
          );
        })
      )}
    </div>
  );
}
