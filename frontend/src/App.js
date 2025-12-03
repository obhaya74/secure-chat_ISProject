import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ChatLayout from "./pages/ChatLayout";  // ⭐ ADD THIS

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Default route → redirect to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* ⭐ NEW: Chat Page Route */}
          <Route path="/chat" element={<ChatLayout />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
