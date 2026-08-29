import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

const universities = [
  {
    name: "Istanbul Aydin University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
  {
    name: "Istanbul Gelisim University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Special Discounts",
  },
  {
    name: "Istinye University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const openLogin = () => {
    setMessage("");
    setEmail("");
    setPassword("");
    setShowLogin(true);
  };

  const closeLogin = () => {
    if (!loading) {
      setShowLogin(false);
      setMessage("");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (isRegister) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Account created successfully.");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Login successful.");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already registered.");
      } else if (error.code === "auth/invalid-credential") {
        setMessage("Email or password is incorrect.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        setMessage("Password must be at least 6 characters.");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setMessage("No account was found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email.");
      } else {
        setMessage("Unable to send reset email.");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    alert("Application system coming next.");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-content">

          <div className="logo">
            <span className="logo-diamond">
              <span>MIDOYOL</span>
            </span>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#universities">Universities</a>
            <a href="#how-it-works">How It Works</a>

            {!user ? (
              <button
                className="nav-login"
                onClick={openLogin}
              >
                Login
              </button>
            ) : (
              <button
                className="nav-login"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>

          <button
            className="nav-button"
            onClick={handleApplication}
          >
            Start Application
          </button>

        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="container hero-content">

          <div className="hero-text">

            <span className="hero-label">
              UNIVERSITY ADMISSION PLATFORM
            </span>

            <h1>
              Your Journey to
              <span> University </span>
              Starts Here
            </h1>

            <p>
              Find your university and start your
              application with MIDOYOL.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={handleApplication}
              >
                Start Your Application
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("universities")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Explore Universities
              </button>

            </div>
          </div>

          <div className="hero-card">

            <div className="hero-card-top">
              <span>🎓</span>
              <span>Student Application</span>
            </div>

            <h3>Find your university</h3>

            <div className="select-box">
              <span>Study Level</span>
              <strong>Choose level</strong>
            </div>

            <div className="select-box">
              <span>Major</span>
              <strong>Choose your major</strong>
            </div>

            <button
              className="primary-button full"
              onClick={() =>
                document
                  .getElementById("universities")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Find Universities
            </button>

          </div>

        </div>
      </section>

      {/* UNIVERSITIES */}
      <section
        className="universities"
        id="universities"
      >
        <div className="container">

          <div className="section-heading">

            <div>
              <span className="small-title">
                OUR UNIVERSITIES
              </span>

              <h2>Choose Your University</h2>
            </div>

            <button
              className="view-all"
              onClick={() =>
                document
                  .getElementById("universities")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              View All →
            </button>

          </div>

          <div className="university-grid">

            {universities.map((university) => (

              <div
                className="university-card"
                key={university.name}
              >

                <div className="university-image">
                  🎓
                </div>

                <div className="university-info">

                  <span className="location">
                    📍 {university.location}
                  </span>

                  <h3>{university.name}</h3>

                  <p>{university.programs}</p>

                  <div className="scholarship">
                    🎁 {university.scholarship}
                  </div>

                  <button
                    className="apply-button"
                    onClick={handleApplication}
                  >
                    View University →
                  </button>

                </div>

              </div>

            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="how-it-works"
        id="how-it-works"
      >
        <div className="container">

          <div className="section-center">

            <span className="small-title">
              SIMPLE PROCESS
            </span>

            <h2>How MIDOYOL Works</h2>

            <p>
              Choose. Apply. Track.
            </p>

          </div>

          <div className="steps">

            <div className="step">
              <div className="step-number">
                01
              </div>

              <h3>Choose</h3>

              <p>
                Find the university and program
                that fits you.
              </p>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <h3>Apply</h3>

              <p>
                Submit your information and
                required documents.
              </p>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <h3>Track</h3>

              <p>
                Follow your application status.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta-content">

          <div>
            <span>READY TO START?</span>

            <h2>
              Start Your University Journey.
            </h2>
          </div>

          <button
            className="primary-button"
            onClick={handleApplication}
          >
            Start Application →
          </button>

        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-content">

          <div>

            <div className="logo">
              <span className="logo-diamond">
                <span>MIDOYOL</span>
              </span>
            </div>

            <p>
              Your journey to university starts here.
            </p>

          </div>

          <p>
            © 2026 MIDOYOL. All rights reserved.
          </p>

        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="login-overlay">

          <div className="login-modal">

            <button
              className="login-close"
              onClick={closeLogin}
              disabled={loading}
            >
              ×
            </button>

            <div className="login-logo">
              <span className="logo-diamond">
                <span>MIDOYOL</span>
              </span>
            </div>

            <h2>
              {isRegister
                ? "Create Your Account"
                : "Welcome Back"}
            </h2>

            <p className="login-subtitle">
              {isRegister
                ? "Create your student account."
                : "Login to continue your application."}
            </p>

            <form onSubmit={handleAuth}>

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete={
                  isRegister
                    ? "new-password"
                    : "current-password"
                }
              />

              <button
                type="submit"
                className="primary-button login-submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                  ? "Create Account"
                  : "Login"}
              </button>

            </form>

            {!isRegister && (
              <button
                className="forgot-password"
                onClick={handleResetPassword}
              >
                Forgot Password?
              </button>
            )}

            {message && (
              <div className="login-message">
                {message}
              </div>
            )}

            <div className="login-switch">

              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setMessage("");
                }}
              >
                {isRegister
                  ? " Login"
                  : " Create Account"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
