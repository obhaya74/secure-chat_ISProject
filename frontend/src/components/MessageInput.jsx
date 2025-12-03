// src/components/MessageInput.jsx
import React, { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { sendFileMessage } from "../api/api";

export default function MessageInput() {
  const [text, setText] = useState("");
  const auth = useAuthStore();
  const { selectedUser, addMessage } = useChatStore();

  const fileInputRef = useRef(null);

  const sendMessage = async () => {
    // ensure we have sender id
    const senderId = auth.user?._id || localStorage.getItem("userId");
    if (!senderId) {
      alert("User session missing. Please log in again.");
      return;
    }

    if (!selectedUser || !selectedUser._id) {
      alert("Please select a user first.");
      return;
    }

    if (!text.trim()) return;

    // produce real salts/nonces in production; dummy for now
    const payload = {
      sender: senderId,
      receiver: selectedUser._id,
      ciphertext: text,
      iv: "dummy-iv",
      salt: "dummy-salt",
      nonce: "dummy-nonce",
      signature: "dummy-signature",
      counter: 1,
    };

    try {
      const res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Message send failed:", data);
        return;
      }

      const savedMsg = data.data;
      const otherId = selectedUser._id;
      addMessage(otherId, savedMsg);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSend = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedUser || !selectedUser._id) {
      alert("Select a user before sending a file.");
      return;
    }

    try {
      const res = await sendFileMessage(selectedUser._id, file);
      // res.data is populated message per backend
      const savedMsg = res.data;
      addMessage(selectedUser._id, savedMsg);
      // reset input
      e.target.value = null;
    } catch (err) {
      console.error("File send failed:", err);
      alert("Failed to send file.");
    }
  };

  return (
    <div style={{ display: "flex", padding: "12px", borderTop: "1px solid #ddd", background: "#fafafa" }}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSend}
      />

      <button
        onClick={handleFileClick}
        style={{
          marginRight: "8px",
          padding: "8px 10px",
          background: "#eee",
          borderRadius: "8px",
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
        title="Attach file"
      >
        📎
      </button>

      <input
        style={{ flex: 1, padding: "12px", border: "1px solid #bbb", borderRadius: "8px" }}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage} style={{
        marginLeft: "10px", padding: "10px 22px", background: "#007bff", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
      }}>
        Send
      </button>
    </div>
  );
}
