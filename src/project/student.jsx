import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student.css";
import {
  createProject,
  deleteProject,
  getAdmins,
  getStudentProjects,
  updateProjectFile,
} from "../api";

const normalizeProject = (project) => ({
  ...project,
  fileUrl: project.fileUrl || project.fileURL || "",
  fileName: project.fileName || project.filename || "Uploaded file",
  status: (project.status || "pending").toLowerCase(),
  marks:
    project.marks === undefined || project.marks === null || project.marks === ""
      ? null
      : Number(project.marks),
});

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [file, setFile] = useState(null);
  const [assignedAdmin, setAssignedAdmin] = useState("");
  const [admins, setAdmins] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  const [modal, setModal] = useState({
    show: false,
    message: "",
  });

  const getDisplayName = (user) => {
    if (!user) return "Student";
    if (user.name && user.name.trim() !== "") return user.name;
    if (user.email) {
      const beforeAt = user.email.split("@")[0];
      return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
    }
    return "Student";
  };

  const loadStudentProjects = async (email) => {
    try {
      const data = await getStudentProjects(email);
      setMyProjects(Array.isArray(data) ? data.map(normalizeProject) : []);
    } catch (error) {
      console.error("Failed to fetch student projects:", error);
      alert(error.message || "Could not load projects.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "STUDENT") {
      alert("Please login first");
      navigate("/");
      return;
    }

    setStudentName(getDisplayName(user));

    getAdmins()
      .then((data) => {
        setAdmins(data);
      })
      .catch((error) => {
        console.error("Failed to fetch admins:", error);
      });

    loadStudentProjects(user.email);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleSubmit = async () => {
    if (!projectTitle || !projectDesc || !file || !assignedAdmin) {
      alert("Please fill all fields and select an admin.");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      await createProject({
        title: projectTitle,
        description: projectDesc,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        assignedAdmin: assignedAdmin.toLowerCase(),
        file,
      });

      setProjectTitle("");
      setProjectDesc("");
      setFile(null);
      setAssignedAdmin("");
      await loadStudentProjects(currentUser.email);
      setModal({
        show: true,
        message: "Project submitted successfully!",
      });
    } catch (error) {
      console.error("Failed to submit project:", error);
      alert(error.message || "Could not submit project.");
    }
  };

  const handleDelete = async (projectId) => {
    const ok = window.confirm("Are you sure you want to delete this project?");
    if (!ok) return;

    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      await deleteProject(projectId);
      await loadStudentProjects(currentUser.email);
      setModal({
        show: true,
        message: "Project deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert(error.message || "Could not delete project.");
    }
  };

  const handleUpdateFile = async (projectId, index) => {
    const ok = window.confirm("Do you want to update this file?");
    if (!ok) return;

    const fileInput = document.getElementById(`updateFile_${index}`);
    if (!fileInput || !fileInput.files.length) {
      alert("Please choose a file to update.");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      await updateProjectFile(projectId, fileInput.files[0]);
      fileInput.value = "";
      await loadStudentProjects(currentUser.email);
      setModal({
        show: true,
        message: "File updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update project file:", error);
      alert(error.message || "Could not update file.");
    }
  };

  return (
    <div className="student-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Menu</h2>
        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate("/student")}>
            Home
          </button>
          <button className="nav-item" onClick={() => navigate("/feedback")}>
            Feedback
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="content">
        <div className="content-header">
          <h2>Welcome {studentName}</h2>
          <p>Upload your project and track feedback from your admin.</p>
        </div>

        <div className="card">
          <h3>Upload Project</h3>

          <div className="form-group">
            <label>Project Title</label>
            <input
              type="text"
              value={projectTitle}
              placeholder="Enter project title"
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={projectDesc}
              placeholder="Enter project description"
              onChange={(e) => setProjectDesc(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Upload File</label>
            <div className="file-box upload-box">
              <input
                className="file-input"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <p className="file-name">{file ? file.name : "No file selected yet"}</p>
          </div>

          <div className="form-group">
            <label>Select Admin</label>
            <select
              value={assignedAdmin}
              onChange={(e) => setAssignedAdmin(e.target.value)}
            >
              <option value="">Select Admin</option>
              {admins.map((admin, index) => (
                <option key={index} value={admin.email}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            Submit Project
          </button>
        </div>

        <div className="card">
          <h3>My Submissions</h3>
          {myProjects.length === 0 ? (
            <p>No projects submitted yet.</p>
          ) : (
            myProjects.map((project, index) => (
              <div key={project.id || index} className="submission">
                <h4>
                  {project.title}{" "}
                  <span className={`badge ${project.status}`}>{project.status}</span>
                </h4>
                <p>{project.description}</p>
                <p>
                  <b>Assigned Admin:</b> {project.assignedAdmin}
                </p>

                {project.marks !== null && (
                  <div className="marks-box">
                    <span>
                      <b>Marks:</b> {project.marks}/100
                    </span>
                    <span
                      className={`grade ${
                        project.marks >= 90
                          ? "excellent"
                          : project.marks >= 75
                            ? "good"
                            : project.marks >= 50
                              ? "average"
                              : "poor"
                      }`}
                    >
                      {project.marks >= 90
                        ? "Excellent"
                        : project.marks >= 75
                          ? "Good"
                          : project.marks >= 50
                            ? "Average"
                            : "Needs Improvement"}
                    </span>
                  </div>
                )}

                <a
                  href={project.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  Open Project
                </a>

                <div className="file-section">
                  <p className="section-title">Update File</p>

                  <div className="file-box">
                    <input id={`updateFile_${index}`} className="file-input" type="file" />
                  </div>

                  <div className="btn-row">
                    <button
                      onClick={() => handleUpdateFile(project.id, index)}
                      className="btn-outline"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {modal.show && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p>{modal.message}</p>
              <div className="btn-row">
                <button
                  className="confirm-btn"
                  onClick={() => setModal({ ...modal, show: false })}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
