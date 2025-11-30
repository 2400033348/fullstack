
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./student.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [file, setFile] = useState(null);
  const [assignedAdmin, setAssignedAdmin] = useState("");
  const [admins, setAdmins] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const [modal, setModal] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    const checkSessionAndLoad = () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const sessionExpiry = localStorage.getItem("sessionExpiry");

      if (
        !currentUser ||
        currentUser.role !== "student" ||
        !sessionExpiry ||
        Date.now() > Number(sessionExpiry)
      ) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("sessionExpiry");
        alert("Session expired. Please login again.");
        navigate("/");
        return;
      }

      axios
        .get("http://localhost:5000/api/admins")
        .then((response) => setAdmins(response.data))
        .catch((error) => console.error("❌ Failed to fetch admins:", error));

      const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const myData = allProjects.filter(
        (p) => p.studentEmail === currentUser.email
      );
      setMyProjects(myData);
    };

    checkSessionAndLoad();
    const intervalId = setInterval(checkSessionAndLoad, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleSubmit = () => {
    if (!projectTitle || !projectDesc || !file || !assignedAdmin) {
      alert("⚠ Please fill all fields and select a madam!");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const fileURL = URL.createObjectURL(file);

    const newProject = {
      title: projectTitle,
      description: projectDesc,
      studentName: currentUser.username,
      studentEmail: currentUser.email,
      assignedAdmin,
      fileName: file.name,
      fileURL,
      status: "pending",
      feedback: "",
      marks: null,
    };

    allProjects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(allProjects));

    setProjectTitle("");
    setProjectDesc("");
    setFile(null);
    setAssignedAdmin("");
    setMyProjects([...myProjects, newProject]);
  };

  const handleDelete = (index) => {
    const ok = window.confirm("Are you sure you want to delete this project? ❌");
    if (!ok) return;

    const projectToDelete = myProjects[index];

    let allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    allProjects = allProjects.filter(
      (p) =>
        !(
          p.title === projectToDelete.title &&
          p.studentEmail === projectToDelete.studentEmail
        )
    );

    localStorage.setItem("projects", JSON.stringify(allProjects));
    setMyProjects(myProjects.filter((_, i) => i !== index));

    setModal({
      show: true,
      message: "🗑️ Project deleted successfully!",
    });
  };

  const handleUpdateFile = (index) => {
    const ok = window.confirm("Do you want to update this file? 🔄");
    if (!ok) return;

    const fileInput = document.getElementById(`updateFile_${index}`);
    if (!fileInput || !fileInput.files.length) {
      alert("⚠ Please choose a file to update.");
      return;
    }

    const newFile = fileInput.files[0];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const project = myProjects[index];

    const projectIndex = allProjects.findIndex(
      (p) =>
        p.title === project.title && p.studentEmail === project.studentEmail
    );

    if (projectIndex === -1) {
      alert("❌ Could not find project to update.");
      return;
    }

    const newFileURL = URL.createObjectURL(newFile);
    allProjects[projectIndex].fileName = newFile.name;
    allProjects[projectIndex].fileURL = newFileURL;

    localStorage.setItem("projects", JSON.stringify(allProjects));

    const updatedProjects = [...myProjects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      fileName: newFile.name,
      fileURL: newFileURL,
    };
    setMyProjects(updatedProjects);

    fileInput.value = "";

    setModal({
      show: true,
      message: "✅ File updated successfully!",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionExpiry");
    navigate("/");
  };

  return (
    <div className="student-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">📘 Menu</h2>
        <nav>
          <button onClick={() => navigate("/student")}>🏠 Home</button>
          <button onClick={() => navigate("/feedback")}>🗒️ Feedback</button>
          <button className="logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="content">
        <h2>Welcome Student 👩‍🎓</h2>
        <p>Upload your project and track feedback from your madam.</p>

        <div className="card">
          <h3>📤 Upload Project</h3>

          <label>Project Title</label>
          <input
            type="text"
            value={projectTitle}
            placeholder="Enter project title"
            onChange={(e) => setProjectTitle(e.target.value)}
          />

          <label>Description</label>
          <textarea
            value={projectDesc}
            placeholder="Enter project description"
            onChange={(e) => setProjectDesc(e.target.value)}
          />

          <label>Upload File</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <label>Select Madam (Admin)</label>
          <select
            value={assignedAdmin}
            onChange={(e) => setAssignedAdmin(e.target.value)}
          >
            <option value="">Select Madam</option>
            {admins.map((a, i) => (
              <option key={i} value={a.email}>
                {a.username}
              </option>
            ))}
          </select>

          <button onClick={handleSubmit}>Submit Project</button>
        </div>

        <div className="card">
          <h3>📊 My Submissions</h3>

          {myProjects.length === 0 ? (
            <p>No projects submitted yet.</p>
          ) : (
            myProjects.map((p, i) => (
              <div key={i} className="submission">
                <h4>
                  {p.title}{" "}
                  <span className={`badge ${p.status}`}>{p.status}</span>
                </h4>
                <p>{p.description}</p>
                <p>
                  <b>Assigned Madam:</b> {p.assignedAdmin}
                </p>
                <a href={p.fileURL} target="_blank" className="btn-outline">
                  Open Project
                </a>

                <div style={{ marginTop: "10px" }}>
                  <label>Update File</label>
                  <input
                    id={`updateFile_${i}`}
                    type="file"
                    style={{ display: "block", marginBottom: "6px" }}
                  />
                  <button
                    onClick={() => handleUpdateFile(i)}
                    className="btn-outline"
                    style={{ marginRight: "8px" }}
                  >
                    🔄 Update File
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="logout"
                  >
                    🗑️ Delete Project
                  </button>
                </div>

                {p.feedback ? (
                  <>
                    <p>
                      <b>Feedback:</b> {p.feedback}
                    </p>
                    <p>
                      <b>Marks:</b> {p.marks}/100
                    </p>
                  </>
                ) : (
                  <p>
                    <i>Waiting for feedback...</i>
                  </p>
                )}
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
                <button
                  className="cancel-btn"
                  onClick={() => setModal({ ...modal, show: false })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


