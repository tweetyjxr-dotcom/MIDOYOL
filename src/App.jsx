import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // AUTH STATE
  // =========================
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =========================
  // AUTH MODAL
  // =========================
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // NAVIGATION
  // =========================
  const goTo = (id) => {
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // =========================
  // OPEN LOGIN
  // =========================
  const openLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
    setAuthError("");
    setAuthSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  // =========================
  // OPEN REGISTER
  // =========================
  const openRegister = () => {
    setAuthMode("register");
    setAuthModalOpen(true);
    setAuthError("");
    setAuthSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  // =========================
  // CLOSE AUTH
  // =========================
  const closeAuth = () => {
    setAuthModalOpen(false);
    setAuthError("");
    setAuthSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  // =========================
  // LOGIN / REGISTER
  // =========================
  const handleAuth = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (!email.trim() || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "register") {
      if (!name.trim()) {
        setAuthError("Please enter your full name.");
        return;
      }

      if (password.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
    }

    try {
      setAuthSubmitting(true);

      if (authMode === "register") {
        // Create Firebase account
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        // Save student's name in Firebase Auth
        await updateProfile(result.user, {
          displayName: name.trim(),
        });

        // Save student information in Firestore
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: name.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
          role: "student",
        });

        setAuthSuccess(
          "Account created successfully. Welcome to MIDOYOL!"
        );

        setTimeout(() => {
          closeAuth();
        }, 1200);
      } else {
        // Login
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        setAuthSuccess("Login successful. Welcome back!");

        setTimeout(() => {
          closeAuth();
        }, 900);
      }
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setAuthError(
            "This email is already registered. Please login instead."
          );
          break;

        case "auth/invalid-email":
          setAuthError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setAuthError(
            "Password is too weak. Please use at least 6 characters."
          );
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setAuthError("Incorrect email or password.");
          break;

        case "auth/too-many-requests":
          setAuthError(
            "Too many attempts. Please wait a little and try again."
          );
          break;

        default:
          setAuthError(
            error.message || "Something went wrong. Please try again."
          );
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async () => {
    setAuthError("");
    setAuthSuccess("");

    if (!email.trim()) {
      setAuthError("Enter your email first, then click Forgot password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setAuthSuccess(
        "Password reset email sent. Please check your inbox."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        setAuthError("No account was found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.");
      } else {
        setAuthError("Unable to send reset email. Please try again.");
      }
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // APPLICATION
  // =========================
  const startApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    alert(
      "Welcome to MIDOYOL! The student application demo will be connected here."
    );
  };

  // =========================
  // LOADING
  // =========================
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <div
            style={{
              width: "75px",
              height: "75px",
              borderRadius: "18px",
              background: "#65b9f5",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "30px",
              margin: "0 auto 22px",
              boxShadow: "0 18px 50px rgba(28, 83, 125, 0.10)",
            }}
          >
            M
          </div>

          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="navbar">
        <div className="navbar-inner">
          <button
            className="nav-logo"
            onClick={() => goTo("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#65b9f5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "18px",
              }}
            >
              M
            </div>

            <span>MIDOYOL</span>
          </button>

          <div className="nav-links">
            <button onClick={() => goTo("home")}>Home</button>

            <button onClick={() => goTo("universities")}>
              Universities
            </button>

            <button onClick={() => goTo("how-it-works")}>
              How It Works
            </button>

            <button onClick={() => goTo("about")}>
              About Us
            </button>
          </div>

          <div className="nav-start">
            {!user ? (
              <>
                <button className="outline-btn" onClick={openLogin}>
                  Login
                </button>

                <button className="primary-btn" onClick={openRegister}>
                  Register
                </button>
              </>
            ) : (
              <>
                <span className="nav-user">
                  Hi, {user.displayName || user.email}
                </span>

                <button
                  className="outline-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* =========================
            MOBILE MENU
        ========================= */}
        {menuOpen && (
          <>
            <div
              className="mobile-overlay"
              onClick={() => setMenuOpen(false)}
            ></div>

            <div className="mobile-menu">
              <div className="mobile-menu-header">
                <div className="mobile-menu-title">
                  MIDOYOL
                </div>

                <button
                  className="mobile-close"
                  onClick={() => setMenuOpen(false)}
                >
                  ×
                </button>
              </div>

              {user && (
                <div className="mobile-user">
                  <div className="mobile-user-label">
                    Logged in as
                  </div>

                  <div className="mobile-user-email">
                    {user.displayName || user.email}
                  </div>
                </div>
              )}

              <div className="mobile-menu-items">
                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("home")}
                >
                  🏠 Home
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("universities")}
                >
                  🎓 Universities
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("how-it-works")}
                >
                  📋 How It Works
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("about")}
                >
                  ℹ️ About Us
                </button>
              </div>

              <div className="mobile-menu-bottom">
                {!user ? (
                  <>
                    <button
                      className="outline-btn full-btn"
                      onClick={() => {
                        setMenuOpen(false);
                        openLogin();
                      }}
                    >
                      Login
                    </button>

                    <div style={{ height: "10px" }}></div>

                    <button
                      className="primary-btn full-btn"
                      onClick={() => {
                        setMenuOpen(false);
                        openRegister();
                      }}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <button
                    className="danger-btn full-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                🎓 Student Admissions Platform
              </div>

              <h1>
                Your journey to
                <br />
                <span>university</span> starts here.
              </h1>

              <p className="hero-description">
                MIDOYOL helps students discover universities, apply easily,
                find scholarships, and start their academic journey with
                confidence.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-btn"
                  onClick={startApplication}
                >
                  Start Application →
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => goTo("universities")}
                >
                  Explore Universities
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="globe">
                <div className="globe-grid"></div>
              </div>

              <div className="flag flag-1">🇹🇷</div>
              <div className="flag flag-2">🇸🇩</div>
              <div className="flag flag-3">🇨🇾</div>
              <div className="flag flag-4">🎓</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>

            <p>
              A simple and easy process designed to help students reach
              their university goals.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>
                Create your MIDOYOL account and start your application
                journey.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose University</h3>
              <p>
                Explore universities and select the program that fits you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Submit Documents</h3>
              <p>
                Upload your documents and complete your application online.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Track Application</h3>
              <p>
                Follow every stage of your application directly from your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          UNIVERSITIES
      ========================= */}
      <section className="section" id="universities">
        <div className="container">
          <div className="section-title">
            <h2>Find Your University</h2>

            <p>
              Discover leading universities and find the right academic path
              for your future.
            </p>
          </div>

          <div className="university-grid">
            <div className="university-card">
              <div className="university-image">İG</div>

              <div className="university-body">
                <h3>Istanbul Gelisim University</h3>

                <p>
                  Explore programs, admission requirements, and available
                  opportunities.
                </p>

                <button
                  className="outline-btn"
                  onClick={() =>
                    alert(
                      "Istanbul Gelisim University demo will open here."
                    )
                  }
                >
                  View University
                </button>
              </div>
            </div>

            <div className="university-card">
              <div className="university-image">İA</div>

              <div className="university-body">
                <h3>Istanbul Aydin University</h3>

                <p>
                  Discover undergraduate programs and start your
                  application.
                </p>

                <button
                  className="outline-btn"
                  onClick={() =>
                    alert(
                      "Istanbul Aydin University demo will open here."
                    )
                  }
                >
                  View University
                </button>
              </div>
            </div>

            <div className="university-card">
              <div className="university-image">İÜ</div>

              <div className="university-body">
                <h3>Explore More Universities</h3>

                <p>
                  Browse more universities and find the program that
                  matches your goals.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    alert(
                      "More universities will be added to the MIDOYOL demo."
                    )
                  }
                >
                  Explore All
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>About MIDOYOL</h2>

            <p>
              MIDOYOL is designed to make the university admission journey
              simpler, clearer, and easier for students.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to start your journey?</h2>

            <p>
              Take the first step toward your university future with
              MIDOYOL.
            </p>

            <button
              className="primary-btn"
              onClick={startApplication}
            >
              Start Your Application →
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "9px",
                    background: "#65b9f5",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                  }}
                >
                  M
                </div>

                <span>MIDOYOL</span>
              </div>

              <p>
                Your journey to university starts here. We make student
                admissions simpler, clearer, and easier.
              </p>
            </div>

            <div>
              <h4>Platform</h4>

              <div className="footer-links">
                <button onClick={() => goTo("universities")}>
                  Universities
                </button>

                <button onClick={() => goTo("how-it-works")}>
                  How It Works
                </button>

                <button onClick={startApplication}>
                  Start Application
                </button>
              </div>
            </div>

            <div>
              <h4>Support</h4>

              <div className="footer-links">
                <button
                  onClick={() =>
                    alert("MIDOYOL Support will be available here.")
                  }
                >
                  Contact Us
                </button>

                <button
                  onClick={() =>
                    alert("MIDOYOL Help Center will be available here.")
                  }
                >
                  Help Center
                </button>

                <button
                  onClick={() =>
                    alert("MIDOYOL Student Support will be available here.")
                  }
                >
                  Student Support
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 MIDOYOL. All rights reserved.
          </div>
        </div>
      </footer>

      {/* =========================
          AUTH MODAL
      ========================= */}
      {authModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAuth();
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="modal-close"
              onClick={closeAuth}
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="modal-title">
              {authMode === "login"
                ? "Welcome Back"
                : "Create Your Account"}
            </h2>

            <p className="modal-subtitle">
              {authMode === "login"
                ? "Login to continue your MIDOYOL journey."
                : "Create your student account and start your journey."}
            </p>

            {/* TABS */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${
                  authMode === "login" ? "active" : ""
                }`}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Login
              </button>

              <button
                className={`auth-tab ${
                  authMode === "register" ? "active" : ""
                }`}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="form-error">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="form-success">
                {authSuccess}
              </div>
            )}

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <div className="form-group">
                  <label className="form-label">
                    Full Name
                  </label>

                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  className="form-input"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                </label>

                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                />
              </div>

              {authMode === "register" && (
                <div className="form-group">
                  <label className="form-label">
                    Confirm Password
                  </label>

                  <input
                    className="form-input"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                  />
                </div>
              )}

              <button
                className="primary-btn full-btn"
                type="submit"
                disabled={authSubmitting}
                style={{
                  opacity: authSubmitting ? 0.7 : 1,
                }}
              >
                {authSubmitting
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            {authMode === "login" && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                <button
                  className="text-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: "22px",
                color: "var(--muted)",
                fontSize: "13px",
              }}
            >
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    className="text-btn"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-btn"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
