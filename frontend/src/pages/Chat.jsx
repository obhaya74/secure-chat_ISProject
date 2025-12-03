import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useAuthStore } from "../store/useAuthStore";

export default function Chat() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "var(--bg, #f5f5f5)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
  },
};
