import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import prot from "./prot.png";
import { loginUser, signupUser } from "../api";

const initialSignupState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [signupForm, setSignupForm] = useState(initialSignupState);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidGmail = (value) => value.toLowerCase().endsWith("@gmail.com");

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let index = 0; index < 6; index += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  const resetLoginForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setCaptchaInput("");
  };

  useEffect(() => {
    if (view === "login") {
      generateCaptcha();
      setCaptchaInput("");
    }
  }, [view]);

  const switchView = (nextView) => {
    setView(nextView);
    if (nextView === "signup") {
      setSignupForm(initialSignupState);
    }
    if (nextView === "login") {
      resetLoginForm();
    }
  };

  const handleSignupChange = (field, value) => {
    setSignupForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const { fullName, email, password, confirmPassword, role } = signupForm;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      alert("Please fill all fields.");
      return;
    }

    if (!isValidGmail(email)) {
      alert("Please use a valid Gmail address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signupUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role.toUpperCase(),
      });

      alert("Registration successful. Please log in.");
      setSignupForm(initialSignupState);
      switchView("login");
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message || "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (!captchaInput || captchaInput.toUpperCase() !== captcha) {
      alert("Captcha does not match.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginUser({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      const user = res.user || (Array.isArray(res) ? res[0] : res);

      if (!user || !user.email) {
        alert("Invalid email or password.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      const normalizedRole = user.role?.toLowerCase();
      if (normalizedRole === "admin") {
        navigate("/admin");
      } else if (normalizedRole === "student") {
        navigate("/student");
      } else {
        alert(`Unknown role: ${user.role}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message || "Login failed.");
      generateCaptcha();
      setCaptchaInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`auth-shell auth-shell--${view}`}>
      {view === "home" && (
        <section className="landing-panel">
          <div className="landing-copy">
            <span className="landing-kicker">Project Review Portal</span>
            <h1>Manage projects, reviews, and student progress in one place.</h1>
            <p>
              Students can upload submissions, admins can review them, and everyone
              gets a cleaner dashboard experience from login to feedback.
            </p>

            <div className="landing-actions">
              <button className="auth-primary-btn" onClick={() => switchView("login")}>
                Login
              </button>
              <button className="auth-secondary-btn" onClick={() => switchView("signup")}>
                Create Account
              </button>
            </div>
          </div>

          <div className="landing-visual">
            <div className="landing-visual-frame">
              <img src={prot} alt="Project portal preview" className="landing-image" />
            </div>
          </div>
        </section>
      )}

      {view !== "home" && (
        <section className="auth-panel-wrap">
          <div className="auth-panel">
            <button className="auth-back-link" onClick={() => switchView("home")}>
              Back
            </button>

            <div className="auth-panel-header">
              <span className="auth-badge">{view === "login" ? "Welcome back" : "Join now"}</span>
              <h2>{view === "login" ? "Login to your account" : "Create your account"}</h2>
              <p>
                {view === "login"
                  ? "Use your registered email and password to continue."
                  : "Sign up as a student or admin to start using the portal."}
              </p>
            </div>

            {view === "login" ? (
              <div className="auth-form">
                <label>Email</label>
                <input
                  value={loginEmail}
                  placeholder="Enter your Gmail address"
                  onChange={(e) => setLoginEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  placeholder="Enter your password"
                  onChange={(e) => setLoginPassword(e.target.value)}
                />

                <div className="captcha-box">
                  <div className="captcha-display">
                    <span className="captcha-label">Captcha</span>
                    <strong>{captcha}</strong>
                  </div>
                  <button
                    type="button"
                    className="captcha-refresh"
                    onClick={generateCaptcha}
                  >
                    Refresh
                  </button>
                </div>

                <label>Enter Captcha</label>
                <input
                  value={captchaInput}
                  placeholder="Type the captcha shown above"
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />

                <button
                  className="auth-primary-btn auth-primary-btn--full"
                  onClick={handleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <p className="auth-switch-text">
                  Do not have an account?
                  <button className="auth-inline-link" onClick={() => switchView("signup")}>
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="auth-form">
                <label>Full Name</label>
                <input
                  value={signupForm.fullName}
                  placeholder="Enter your full name"
                  onChange={(e) => handleSignupChange("fullName", e.target.value)}
                />

                <label>Email</label>
                <input
                  value={signupForm.email}
                  placeholder="Enter your Gmail address"
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                />

                <label>Password</label>
                <input
                  type="password"
                  value={signupForm.password}
                  placeholder="Create a password"
                  onChange={(e) => handleSignupChange("password", e.target.value)}
                />

                <label>Confirm Password</label>
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  placeholder="Re-enter your password"
                  onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                />

                <label>Role</label>
                <select
                  value={signupForm.role}
                  onChange={(e) => handleSignupChange("role", e.target.value)}
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  className="auth-primary-btn auth-primary-btn--full"
                  onClick={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>

                <p className="auth-switch-text">
                  Already have an account?
                  <button className="auth-inline-link" onClick={() => switchView("login")}>
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
