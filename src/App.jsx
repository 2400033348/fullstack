import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./project/Authpage";
import AdminDashboard from "./project/AdminDashboard";
import StudentDashboard from "./project/student";
import FeedbackPage from "./project/FeedbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
