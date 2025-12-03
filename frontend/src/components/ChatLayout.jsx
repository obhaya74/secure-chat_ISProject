// ChatLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatLayout() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={styles.container}>
      <Sidebar setSelectedUser={setSelectedUser} />
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
