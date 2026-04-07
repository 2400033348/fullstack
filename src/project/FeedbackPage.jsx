import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student.css";
import { getStudentProjects } from "../api";

const normalizeProject = (project) => ({
  ...project,
  status: (project.status || "pending").toLowerCase(),
  marks:
    project.marks === undefined || project.marks === null || project.marks === ""
      ? null
      : Number(project.marks),
});

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Student");
  const [feedbackList, setFeedbackList] = useState([]);

  const getDisplayName = (user) => {
    if (!user) return "Student";
    if (user.name && user.name.trim() !== "") return user.name;
    if (user.email) {
      const beforeAt = user.email.split("@")[0];
      return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
    }
    return "Student";
  };

  const loadFeedback = async (email) => {
    try {
      const data = await getStudentProjects(email);
      setFeedbackList(Array.isArray(data) ? data.map(normalizeProject) : []);
    } catch (error) {
      console.error("Failed to load feedback:", error);
      alert(error.message || "Could not load feedback.");
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser || currentUser.role !== "STUDENT") {
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    setStudentName(getDisplayName(currentUser));
    loadFeedback(currentUser.email);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const getProgress = (marks) => {
    if (marks === null || marks === undefined) return 20;
    if (marks >= 90) return 100;
    if (marks >= 75) return 80;
    if (marks >= 60) return 60;
    if (marks >= 40) return 40;
    return 20;
  };

  return (
    <div className="student-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Menu</h2>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/student")}>
            Home
          </button>
          <button className="nav-item active" onClick={() => navigate("/feedback")}>
            Feedback
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="content">
        <div className="content-header">
          <h2>Feedback for {studentName}</h2>
          <p>View remarks, marks, and progress for your submitted projects.</p>
        </div>

        {feedbackList.length === 0 ? (
          <div className="card">
            <p>No feedback available yet.</p>
          </div>
        ) : (
          feedbackList.map((item, index) => (
            <div key={item.id || index} className="card">
              <h3>{item.title}</h3>
              <p className="feedback-desc">{item.description}</p>

              <div className="feedback-meta">
                <p>
                  <b>Assigned Admin:</b> {item.assignedAdmin}
                </p>
                <p>
                  <b>Status:</b> <span className={`badge ${item.status}`}>{item.status}</span>
                </p>
                <p>
                  <b>Marks:</b>{" "}
                  {item.marks !== null ? `${item.marks}/100` : "Not yet given"}
                </p>
              </div>

              <div className="feedback-panel">
                <strong>Remarks</strong>
                <p>{item.feedback ? item.feedback : "Awaiting feedback..."}</p>
              </div>

              <div className="progress-block">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{getProgress(item.marks)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgress(item.marks)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
