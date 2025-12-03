import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ChatLayout from "./components/ChatLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default → redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Chat page */}
        <Route path="/chat" element={<ChatLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
