import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
  // APPLICATION
  // =========================
  const [applicationLoading, setApplicationLoading] = useState(false);

  const [selectedField, setSelectedField] = useState("");

  // =========================
  // FIELDS
  // =========================
  const fields = [
    {
      id: "computer-it",
      name: "Computer & IT",
      description:
        "Computer science, software, artificial intelligence, cybersecurity and information technology.",
    },
    {
      id: "engineering",
      name: "Engineering",
      description:
        "Mechanical, civil, electrical, industrial, mechatronics and other engineering programs.",
    },
    {
      id: "medicine-health",
      name: "Medicine & Health Sciences",
      description:
        "Medicine, dentistry, pharmacy, nursing and other health-related programs.",
    },
    {
      id: "business-economics",
      name: "Business & Economics",
      description:
        "Business administration, economics, finance, accounting, marketing and management.",
    },
    {
      id: "law-social-sciences",
      name: "Law & Social Sciences",
      description:
        "Law, political science, international relations, psychology, sociology and public administration.",
    },
    {
      id: "architecture-design",
      name: "Architecture & Design",
      description:
        "Architecture, interior architecture, industrial design, graphic design and urban design.",
    },
    {
      id: "communication-media",
      name: "Communication & Media",
      description:
        "Communication, journalism, public relations, advertising, television and cinema.",
    },
    {
      id: "education",
      name: "Education",
      description:
        "Teaching, early childhood education, mathematics education, special education and educational sciences.",
    },
    {
      id: "aviation",
      name: "Aviation",
      description:
        "Pilotage, aviation management, air transport management, aircraft technology and cabin services.",
    },
    {
      id: "tourism-hospitality",
      name: "Tourism & Hospitality",
      description:
        "Tourism management, hotel management, gastronomy, travel management and tourism guidance.",
    },
  ];

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadApplication(currentUser.uid);
      } else {
        setSelectedField("");
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // LOAD APPLICATION
  // =========================
  const loadApplication = async (uid) => {
    try {
      setApplicationLoading(true);

      const applicationRef = doc(db, "users", uid);
      const applicationSnap = await getDoc(applicationRef);

      if (applicationSnap.exists()) {
        const data = applicationSnap.data();

        if (data.selectedField) {
          setSelectedField(data.selectedField);
        }
      }
    } catch (error) {
      console.error("Error loading application:", error);
    } finally {
      setApplicationLoading(false);
    }
  };

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
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(result.user, {
          displayName: name.trim(),
        });

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
      setAuthError(
        "Enter your email first, then click Forgot password."
      );
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
        setAuthError(
          "Unable to send reset email. Please try again."
        );
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
  // START APPLICATION
  // =========================
  const startApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SELECT FIELD
  // =========================
  const handleFieldSelect = async (field) => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      setApplicationLoading(true);

      setSelectedField(field.id);

      await setDoc(
        doc(db, "users", user.uid),
        {
          selectedField: field.id,
          selectedFieldName: field.name,
          applicationStep: "field",
          updatedAt: new Date().toISOString(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setApplicationLoading(false);
    }
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

  // ============================================================
  // LOGGED-IN APPLICATION PAGE
  // ============================================================
  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6fbff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* APPLICATION NAVBAR */}
        <nav
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e5f2fa",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <button
              onClick={() => {
                setSelectedField("");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#65b9f5",
                fontSize: "25px",
                fontWeight: "900",
                letterSpacing: "1px",
              }}
            >
              MIDOYOL
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <span
                style={{
                  color: "#526273",
                  fontSize: "14px",
                  display: window.innerWidth < 600 ? "none" : "block",
                }}
              >
                {user.displayName || user.email}
              </span>

              <button
                className="outline-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* APPLICATION HEADER */}
        <main
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "42px 20px 70px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 15px",
                borderRadius: "30px",
                background: "#eaf6ff",
                color: "#3b9ee8",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "15px",
              }}
            >
              MIDOYOL APPLICATION
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                color: "#172b3d",
                fontSize: "clamp(28px, 5vw, 42px)",
                fontWeight: "800",
              }}
            >
              Start Your University Journey
            </h1>

            <p
              style={{
                margin: 0,
                color: "#687889",
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              First, tell us which field you want to study.
            </p>
          </div>

          {/* PROGRESS */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5f2fa",
              borderRadius: "18px",
              padding: "20px",
              marginBottom: "32px",
              boxShadow: "0 8px 30px rgba(50, 100, 140, 0.05)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(8, minmax(70px, 1fr))",
                gap: "6px",
                overflowX: "auto",
              }}
            >
              {[
                "Field",
                "Major",
                "Budget",
                "University",
                "Program",
                "Documents",
                "Payment",
                "Tracking",
              ].map((step, index) => (
                <div
                  key={step}
                  style={{
                    textAlign: "center",
                    minWidth: "70px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      margin: "0 auto 7px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        index === 0
                          ? "#65b9f5"
                          : "#edf4f8",
                      color:
                        index === 0
                          ? "#ffffff"
                          : "#91a1af",
                      fontSize: "13px",
                      fontWeight: "800",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      color:
                        index === 0
                          ? "#3b9ee8"
                          : "#91a1af",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FIELD SECTION */}
          <section>
            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#172b3d",
                  fontSize: "25px",
                  fontWeight: "800",
                }}
              >
                Choose Your Field
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#718191",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Select the academic field you are interested in.
                Your majors will be shown next based on your choice.
              </p>
            </div>

            {applicationLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  color: "#65b9f5",
                  fontWeight: "600",
                }}
              >
                Saving...
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
              }}
            >
              {fields.map((field) => {
                const isSelected =
                  selectedField === field.id;

                return (
                  <button
                    key={field.id}
                    onClick={() => handleFieldSelect(field)}
                    disabled={applicationLoading}
                    style={{
                      textAlign: "left",
                      border: isSelected
                        ? "2px solid #65b9f5"
                        : "1px solid #e2edf4",
                      background: isSelected
                        ? "#f0f9ff"
                        : "#ffffff",
                      borderRadius: "18px",
                      padding: "23px",
                      cursor: applicationLoading
                        ? "wait"
                        : "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected
                        ? "0 10px 30px rgba(101, 185, 245, 0.14)"
                        : "0 7px 22px rgba(50, 100, 140, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "15px",
                        marginBottom: "12px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#1c3448",
                          fontSize: "18px",
                          fontWeight: "800",
                        }}
                      >
                        {field.name}
                      </h3>

                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: isSelected
                            ? "none"
                            : "1px solid #d6e5ee",
                          background: isSelected
                            ? "#65b9f5"
                            : "#ffffff",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontWeight: "800",
                          fontSize: "15px",
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: "#738493",
                        fontSize: "13px",
                        lineHeight: 1.65,
                      }}
                    >
                      {field.description}
                    </p>

                    <div
                      style={{
                        marginTop: "18px",
                        color: "#3b9ee8",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {isSelected
                        ? "Selected"
                        : "Select Field"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SELECTED FIELD */}
            {selectedField && (
              <div
                style={{
                  marginTop: "30px",
                  background: "#ffffff",
                  border: "1px solid #dceef8",
                  borderRadius: "18px",
                  padding: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#7a8a98",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    Selected field
                  </div>

                  <div
                    style={{
                      color: "#183449",
                      fontWeight: "800",
                      fontSize: "18px",
                    }}
                  >
                    {
                      fields.find(
                        (field) =>
                          field.id === selectedField
                      )?.name
                    }
                  </div>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    alert(
                      "Field saved successfully. The Major selection step will be added next."
                    );
                  }}
                >
                  Continue to Major →
                </button>
              </div>
            )}
          </section>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e5f2fa",
            padding: "25px 20px",
            textAlign: "center",
            color: "#8998a6",
            fontSize: "13px",
          }}
        >
          © 2026 MIDOYOL. All rights reserved.
        </footer>
      </div>
    );
  }

  // ============================================================
  // LOGGED-OUT LANDING PAGE
  // ============================================================
  return (
    <div className="landing">
      {/* NAVBAR */}
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
            <button onClick={() => goTo("home")}>
              Home
            </button>

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
            <button
              className="outline-btn"
              onClick={openLogin}
            >
              Login
            </button>

            <button
              className="primary-btn"
              onClick={openRegister}
            >
              Register
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

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

              <div className="mobile-menu-items">
                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("home")}
                >
                  Home
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() =>
                    goTo("universities")
                  }
                >
                  Universities
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() =>
                    goTo("how-it-works")
                  }
                >
                  How It Works
                </button>

                <button
                  className="mobile-menu-item"
                  onClick={() => goTo("about")}
                >
                  About Us
                </button>
              </div>

              <div className="mobile-menu-bottom">
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
              </div>
            </div>
          </>
        )}
      </nav>

      {/* HERO */}
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
                MIDOYOL helps students discover universities,
                apply easily, find scholarships, and start their
                academic journey with confidence.
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
                  onClick={() =>
                    goTo("universities")
                  }
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

      {/* HOW IT WORKS */}
      <section
        className="section"
        id="how-it-works"
      >
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>

            <p>
              A simple and easy process designed to help
              students reach their university goals.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>

              <h3>Create Account</h3>

              <p>
                Create your MIDOYOL account and start your
                application journey.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>

              <h3>Choose University</h3>

              <p>
                Explore universities and select the program
                that fits you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>

              <h3>Submit Documents</h3>

              <p>
                Upload your documents and complete your
                application online.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>

              <h3>Track Application</h3>

              <p>
                Follow every stage of your application
                directly from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSITIES */}
      <section
        className="section"
        id="universities"
      >
        <div className="container">
          <div className="section-title">
            <h2>Find Your University</h2>

            <p>
              Discover leading universities and find the right
              academic path for your future.
            </p>
          </div>

          <div className="university-grid">
            <div className="university-card">
              <div className="university-image">
                İG
              </div>

              <div className="university-body">
                <h3>
                  Istanbul Gelisim University
                </h3>

                <p>
                  Explore programs, admission requirements,
                  and available opportunities.
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
              <div className="university-image">
                İA
              </div>

              <div className="university-body">
                <h3>
                  Istanbul Aydin University
                </h3>

                <p>
                  Discover undergraduate programs and start
                  your application.
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
              <div className="university-image">
                İÜ
              </div>

              <div className="university-body">
                <h3>
                  Explore More Universities
                </h3>

                <p>
                  Browse more universities and find the
                  program that matches your goals.
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

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>About MIDOYOL</h2>

            <p>
              MIDOYOL is designed to make the university admission
              journey simpler, clearer, and easier for students.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to start your journey?</h2>

            <p>
              Take the first step toward your university future
              with MIDOYOL.
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

      {/* FOOTER */}
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
                Your journey to university starts here. We make
                student admissions simpler, clearer, and easier.
              </p>
            </div>

            <div>
              <h4>Platform</h4>

              <div className="footer-links">
                <button
                  onClick={() =>
                    goTo("universities")
                  }
                >
                  Universities
                </button>

                <button
                  onClick={() =>
                    goTo("how-it-works")
                  }
                >
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
                    alert(
                      "MIDOYOL Support will be available here."
                    )
                  }
                >
                  Contact Us
                </button>

                <button
                  onClick={() =>
                    alert(
                      "MIDOYOL Help Center will be available here."
                    )
                  }
                >
                  Help Center
                </button>

                <button
                  onClick={() =>
                    alert(
                      "MIDOYOL Student Support will be available here."
                    )
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

      {/* AUTH MODAL */}
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

            <div className="auth-tabs">
              <button
                className={`auth-tab ${
                  authMode === "login"
                    ? "active"
                    : ""
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
                  authMode === "register"
                    ? "active"
                    : ""
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
                    onChange={(e) =>
                      setName(e.target.value)
                    }
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
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
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
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
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
                      setConfirmPassword(
                        e.target.value
                      )
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
