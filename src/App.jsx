import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./project/Authpage";
import StudentDashboard from "./project/student";
import AdminDashboard from "./project/admin";
import FeedbackPage from "./project/FeedbackPage"; // 👈 fixed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
