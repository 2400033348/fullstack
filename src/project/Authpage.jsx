import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import prot from "./prot.png";

export default function AuthPage() {
  const [view, setView] = useState("home"); // home | login | signup
  const navigate = useNavigate();

  // 🕒 Session duration: 30 minutes
  const SESSION_DURATION = 30 * 60 * 1000; // 30 * 60 * 1000 ms

  // ===== Signup Fields =====
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");

  // ===== Login Fields =====
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ===== Captcha Fields (custom) =====
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  // Backend URL (use same port shown in terminal)
  const API_BASE_URL = "http://localhost:5000/api";

  // ✅ Check that email ends with @gmail.com
  const isValidGmail = (value) => {
    return value.toLowerCase().endsWith("@gmail.com");
  };

  // 📌 Generate simple captcha text
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  // When login view opens, generate captcha
  useEffect(() => {
    if (view === "login") {
      generateCaptcha();
      setCaptchaInput("");
    }
  }, [view]);

  // ==================================================
  // 🔹 REGISTER FUNCTION (Saves to MongoDB)
  // ==================================================
  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("⚠ Please fill all fields!");
      return;
    }

    // Email must be a Gmail address
    if (!isValidGmail(email)) {
      alert("❌ Invalid email. Please use an email ending with @gmail.com");
      return;
    }

    if (password !== confirmPassword) {
      alert("⚠ Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username: fullName,
        email,
        password,
        role,
      });

      console.log("✅ Registration success:", response.data);
      alert("✅ Registration successful! You can now log in.");

      // Reset fields
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("student");

      setView("login");
    } catch (error) {
      if (error.response) {
        console.error("❌ Registration error:", error.response.data);
        alert(`❌ ${error.response.data.message || "Registration failed!"}`);
      } else if (error.request) {
        console.error("❌ No response from server:", error.request);
        alert("❌ Cannot connect to backend. Check if server is running!");
      } else {
        console.error("❌ Error during registration:", error.message);
        alert("❌ Something went wrong. Try again.");
      }
    }
  };

  // ==================================================
  // 🔹 LOGIN FUNCTION (Verifies from backend)
  // ==================================================
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert("⚠ Please fill all fields!");
      return;
    }

    // Email must be a Gmail address
    if (!isValidGmail(loginEmail)) {
      alert("❌ Invalid email. Please use an email ending with @gmail.com");
      return;
    }

    // ✅ Check captcha before calling backend
    if (!captchaInput) {
      alert("⚠ Please enter the captcha!");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      alert("❌ Captcha does not match! Try again.");
      setCaptchaInput("");
      generateCaptcha();
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      const user = response.data.user;

      // Save logged in user
      localStorage.setItem("currentUser", JSON.stringify(user));

      // 🕒 Save session expiry time
      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem("sessionExpiry", expiryTime.toString());

      alert("✅ Login successful!");

      if (user.role === "admin") navigate("/admin");
      else navigate("/student");
    } catch (error) {
      if (error.response) {
        alert(`❌ ${error.response.data.message || "Invalid credentials!"}`);
      } else {
        alert("❌ Unable to connect to backend!");
      }
      console.error("❌ Login failed:", error);
    }
  };

  
  return (
    <div className="auth-page">
      {/* =============================== */}
      {/* 🏠 HOME SCREEN */}
      {/* =============================== */}
      {view === "home" && (
        <div className="splash-container">
          <h1 className="splash-title">STUDENT PORTFOLIOS</h1>
          <div className="logo-container">
            <img src={prot} alt="Student Portfolios Logo" className="logo-img" />
          </div>
          <div className="button-group">
            <button className="btn-outline" onClick={() => setView("login")}>
              Login
            </button>
            <button className="btn-outline" onClick={() => setView("signup")}>
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* =============================== */}
      {/* 🔑 LOGIN FORM */}
      {/* =============================== */}
      {view === "login" && (
        <div className="auth-box">
          <h2>Login</h2>
          <label>Email</label>
          <input
            type="text"
            placeholder="Enter your email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          {/* 🔐 Simple Captcha */}
          <label>Captcha</label>
          <div className="captcha-box">
            <span className="captcha-text">{captcha}</span>
            <button
              type="button"
              className="captcha-refresh"
              onClick={generateCaptcha}
            >
              ↻
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter the text shown above"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>

          <p className="auth-switch">
            New user?{" "}
            <a href="#" onClick={() => setView("signup")}>
              Sign Up
            </a>
          </p>
          <p>
            <a href="#" onClick={() => setView("home")}>
              ⬅ Back
            </a>
          </p>
        </div>
      )}

      {/* =============================== */}
      {/* 🧾 SIGNUP FORM */}
      {/* =============================== */}
      {view === "signup" && (
        <div className="auth-box">
          <h2>Sign Up</h2>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Create Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <label>Select Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button className="auth-btn" onClick={handleRegister}>
            Register
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <a href="#" onClick={() => setView("login")}>
              Login
            </a>
          </p>
          <p>
            <a href="#" onClick={() => setView("home")}>
              ⬅ Back
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
