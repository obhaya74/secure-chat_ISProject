import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useChatStore } from "../store/useChatStore";

export default function ChatLayout() {

  const selectedUser = useChatStore((s) => s.selectedUser);

  return (
    <div style={styles.container}>
      <Sidebar />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
};
