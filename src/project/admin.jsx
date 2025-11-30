

import React, { useState, useEffect } from "react";
import "./style.css";

export default function AdminDashboard() {
  const [myProjects, setMyProjects] = useState([]);
  const [adminName, setAdminName] = useState("Admin"); // 👉 default

  const getDisplayName = (user) => {
    if (!user) return "Admin";
    if (user.username && user.username.trim() !== "") return user.username;
    if (user.email) {
      const beforeAt = user.email.split("@")[0];
      return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
    }
    return "Admin";
  };

  // ✅ Load projects for this admin + check session timeout + set name
  useEffect(() => {
    const checkSessionAndLoad = () => {
      const currentUserRaw = localStorage.getItem("currentUser");
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
      const sessionExpiry = localStorage.getItem("sessionExpiry");

      if (
        !currentUser ||
        currentUser.role !== "admin" ||
        !sessionExpiry ||
        Date.now() > Number(sessionExpiry)
      ) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("sessionExpiry");
        alert("Session expired. Please login again.");
        window.location.href = "/";
        return;
      }

      
      setAdminName(getDisplayName(currentUser));

      
      const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const assignedToMe = allProjects.filter(
        (p) => p.assignedAdmin === currentUser.email
      );
      setMyProjects(assignedToMe);
    };

    
    checkSessionAndLoad();

    const intervalId = setInterval(checkSessionAndLoad, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleUpdate = (index, status) => {
    const updatedProjects = [...myProjects];
    const project = updatedProjects[index];

    const marks = document.getElementById(`marks_${index}`).value;
    const feedback = document.getElementById(`feedback_${index}`).value;

    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const projectIndex = allProjects.findIndex(
      (p) =>
        p.title === project.title && p.studentEmail === project.studentEmail
    );

    if (projectIndex !== -1) {
      allProjects[projectIndex].status = status;
      allProjects[projectIndex].marks = marks;
      allProjects[projectIndex].feedback = feedback;
    }

    localStorage.setItem("projects", JSON.stringify(allProjects));
    alert("✅ Project updated successfully!");

    const currentUserRaw = localStorage.getItem("currentUser");
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    const assignedToMe = allProjects.filter(
      (p) => p.assignedAdmin === currentUser?.email
    );
    setMyProjects(assignedToMe);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionExpiry");
    window.location.href = "/";
  };

  return (
    <div
      className="student-layout"
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "#0e1421",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ====================== */}
      {/* Main Content */}
      {/* ====================== */}
      <div
        className="content"
        style={{
          flex: 1, 
          padding: "24px 40px",
          overflowY: "auto", 
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* 👇 Dynamic name from username/email */}
        <h2>Welcome {adminName} 👋</h2>
        <p>Review and provide feedback for your assigned student projects.</p>

        <div
          className="card"
          style={{
            backgroundColor: "#161d2f",
            borderRadius: "15px",
            padding: "24px 28px",
            width: "100%",
            maxWidth: "900px", 
            margin: "16px auto",
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
            textAlign: "left",
          }}
        >
          <h3>📁 Assigned Projects</h3>

          {myProjects.length === 0 ? (
            <p>No projects assigned yet.</p>
          ) : (
            myProjects.map((p, i) => (
              <div key={i} className="submission">
                <h4>
                  {p.title}{" "}
                  <span className={`badge ${p.status}`}>{p.status}</span>
                </h4>

                <p>
                  <b>Student:</b> {p.studentName} ({p.studentEmail})
                </p>
                <p>{p.description}</p>

                <a
                  href={p.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  Open Project
                </a>

                <label>Marks (0–100)</label>
                <input
                  id={`marks_${i}`}
                  type="number"
                  placeholder="Enter marks"
                  defaultValue={p.marks || ""}
                  min="0"
                  max="100"
                />

                <label>Feedback</label>
                <textarea
                  id={`feedback_${i}`}
                  placeholder="Write feedback..."
                  defaultValue={p.feedback || ""}
                ></textarea>

                <div className="button-row">
                  <button
                    className="approve"
                    onClick={() => handleUpdate(i, "approved")}
                  >
                    Approve ✅
                  </button>
                  <button
                    className="reject"
                    onClick={() => handleUpdate(i, "rejected")}
                  >
                    Reject ❌
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ====================== */}
      {/* Sidebar (At the End) */}
      {/* ====================== */}
      <div
        className="sidebar"
        style={{
          width: "260px",
          minWidth: "260px",
          backgroundColor: "#0b101b",
          padding: "24px 16px",
          boxSizing: "border-box",
          borderLeft: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <h2 className="sidebar-title">📘 Menu</h2>
        <nav>
          <button onClick={() => (window.location.href = "/admin")}>
            🏠 Home
          </button>
          <button className="logout" onClick={handleLogout}>
            📤 Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
