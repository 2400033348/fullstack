import React, { useEffect, useState } from "react";
import "./admin.css";
import { getAdminProjects, resolveAssetUrl, updateProjectReview } from "../api";

const normalizeProject = (project) => ({
  ...project,
  fileUrl: resolveAssetUrl(project.fileUrl || project.fileURL || ""),
  fileName: project.fileName || project.filename || "Uploaded file",
  status: (project.status || "pending").toLowerCase(),
  marks:
    project.marks === undefined || project.marks === null || project.marks === ""
      ? ""
      : project.marks,
});

export default function AdminDashboard() {
  const [myProjects, setMyProjects] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getDisplayName = (user) => {
    if (!user) return "Admin";
    if (user.name && user.name.trim() !== "") return user.name;
    if (user.email) {
      const beforeAt = user.email.split("@")[0];
      return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
    }
    return "Admin";
  };

  const loadAdminProjects = async (email) => {
    try {
      const data = await getAdminProjects(email);
      setMyProjects(Array.isArray(data) ? data.map(normalizeProject) : []);
    } catch (error) {
      console.error("Failed to load admin projects:", error);
      alert(error.message || "Could not load projects.");
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser || currentUser.role !== "ADMIN") {
      localStorage.removeItem("user");
      alert("Please login again.");
      window.location.href = "/";
      return;
    }

    setAdminName(getDisplayName(currentUser));
    loadAdminProjects(currentUser.email);
  }, []);

  const handleUpdate = async (projectId, index, status) => {
    const marks = document.getElementById(`marks_${index}`).value;
    const feedback = document.getElementById(`feedback_${index}`).value;
    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      await updateProjectReview(projectId, {
        status,
        marks: marks === "" ? null : Number(marks),
        feedback,
      });

      await loadAdminProjects(currentUser.email);
    } catch (error) {
      console.error("Failed to update project review:", error);
      alert(error.message || "Could not update project.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const filteredProjects = myProjects.filter((project) => {
    const matchSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || project.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Menu</h2>
        <button
          className="admin-sidebar-link active"
          onClick={() => (window.location.href = "/admin")}
        >
          Home
        </button>
        <button className="admin-sidebar-link" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <div className="admin-header">
          <h2>Welcome {adminName}</h2>
          <p>Review student submissions, assign marks, and send feedback.</p>
        </div>

        <div className="admin-toolbar">
          <input
            placeholder="Search by title or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h3>Assigned Projects</h3>
            <span>{filteredProjects.length}</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="admin-empty-state">
              <p>No assigned projects found for this filter.</p>
            </div>
          ) : (
            <div className="admin-project-list">
              {filteredProjects.map((project, index) => (
                <article key={project.id || index} className="admin-project-card">
                  <div className="admin-project-top">
                    <div>
                      <h4>{project.title}</h4>
                      <p className="admin-student-meta">
                        <b>Student:</b> {project.studentName} ({project.studentEmail})
                      </p>
                    </div>

                    <span className={`admin-status admin-status--${project.status}`}>
                      {project.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="admin-file-box">
                    <a href={project.fileUrl} target="_blank" rel="noreferrer">
                      Open Project
                    </a>
                    <div className="admin-file-name">{project.fileName}</div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-field">
                      <label>Marks</label>
                      <input
                        id={`marks_${index}`}
                        defaultValue={project.marks}
                        placeholder="Enter marks"
                      />
                    </div>

                    <div className="admin-field admin-field--full">
                      <label>Remarks / Feedback</label>
                      <textarea
                        id={`feedback_${index}`}
                        defaultValue={project.feedback || ""}
                        placeholder="Write helpful feedback for the student"
                      ></textarea>
                    </div>
                  </div>

                  <div className="admin-action-row">
                    <button
                      className="admin-btn admin-btn--approve"
                      disabled={project.status !== "pending"}
                      onClick={() => handleUpdate(project.id, index, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className="admin-btn admin-btn--reject"
                      disabled={project.status !== "pending"}
                      onClick={() => handleUpdate(project.id, index, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
