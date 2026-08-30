import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase";

/* =========================
   DATA
========================= */

const fields = {
  "Medicine & Health": [
    "Medicine",
    "Dentistry",
    "Pharmacy",
    "Nursing",
    "Physiotherapy",
  ],

  "Engineering": [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering",
    "Industrial Engineering",
    "Architecture",
  ],

  "Computer Science & Technology": [
    "Computer Science",
    "Software Engineering",
    "Computer Engineering",
    "Information Technology",
    "Artificial Intelligence",
    "Cyber Security",
  ],

  "Business & Economics": [
    "Business Administration",
    "International Business",
    "Economics",
    "Finance",
    "Accounting",
    "Marketing",
  ],

  "Law": [
    "Law",
    "International Law",
    "Commercial Law",
  ],

  "Social Sciences": [
    "Political Science & International Relations",
    "Psychology",
    "Sociology",
    "Media & Communication",
  ],

  "Design & Arts": [
    "Graphic Design",
    "Interior Design",
    "Industrial Design",
    "Visual Communication Design",
  ],

  "Education": [
    "English Language Teaching",
    "Primary Education",
    "Special Education",
  ],
};

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

/* =========================
   APP
========================= */

function App() {
  const [user, setUser] = useState(null);

  const [page, setPage] = useState("home");

  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [selectedField, setSelectedField] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     AUTH STATE
  ========================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setPage("student");
      } else {
        setPage("home");
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     AUTH MODAL
  ========================== */

  const openLogin = () => {
    setIsRegister(false);
    setMessage("");
    setShowAuth(true);
  };

  const openRegister = () => {
    setIsRegister(true);
    setMessage("");
    setShowAuth(true);
  };

  const closeAuth = () => {
    if (!loading) {
      setShowAuth(false);
      setMessage("");
    }
  };

  const switchAuth = () => {
    if (!loading) {
      setIsRegister(!isRegister);
      setMessage("");
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setDateOfBirth("");
    setCountry("");
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
  };

  /* =========================
     REGISTER
  ========================== */

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !country ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("Please accept the Terms & Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const newUser = userCredential.user;

      const fullName =
        `${firstName.trim()} ${lastName.trim()}`;

      await updateProfile(newUser, {
        displayName: fullName,
      });

      await setDoc(doc(db, "students", newUser.uid), {
        uid: newUser.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        email: email.trim().toLowerCase(),
        dateOfBirth,
        country,
        createdAt: serverTimestamp(),
      });

      setMessage("Account created successfully.");

      clearForm();

      setTimeout(() => {
        setShowAuth(false);
        setPage("student");
      }, 900);

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        setMessage("Password must be at least 6 characters.");
      } else if (error.code === "permission-denied") {
        setMessage(
          "Account created, but student information could not be saved."
        );
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGIN
  ========================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setMessage("Login successful.");

      setTimeout(() => {
        setShowAuth(false);
        setPage("student");
      }, 700);

    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setMessage("Email or password is incorrect.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email.");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET PASSWORD
  ========================== */

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await sendPasswordResetEmail(auth, email.trim());

      setMessage(
        "Password reset email sent. Check your inbox."
      );

    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        setMessage("No account was found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email.");
      } else {
        setMessage("Unable to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================== */

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setSelectedField("");
      setSelectedMajor("");
      setPage("home");

    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     FIELD CHANGE
  ========================== */

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setSelectedMajor("");
  };

  /* =========================
     APPLICATION
  ========================== */

  const handleApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    if (!selectedField || !selectedMajor) {
      document
        .getElementById("study-selection")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }

    alert(
      `Application selected:\n${selectedField}\n${selectedMajor}`
    );
  };

  /* =========================
     HOME PAGE
  ========================== */

  if (page === "home") {
    return (
      <div className="landing-page">

        <div className="landing-logo-box">
          <div className="landing-logo">
            MIDOYOL
          </div>
        </div>

        <main className="landing-content">

          <div className="landing-left">

            <div className="landing-small-title">
              UNIVERSITY ADMISSION PLATFORM
            </div>

            <h1>
              Your Journey to
              <br />
              <span>University</span>
              <br />
              Starts Here.
            </h1>

            <p>
              Discover universities, choose your major,
              and start your university application
              through MIDOYOL.
            </p>

            <div className="landing-fee">
              Start your application for just
              <strong>$1</strong>
            </div>

            <div className="landing-buttons">

              <button
                className="landing-auth-button"
                onClick={openLogin}
              >
                LOGIN
              </button>

              <button
                className="landing-auth-button"
                onClick={openRegister}
              >
                SIGN UP
              </button>

            </div>

            <div className="landing-note">
              Simple. Easy. Built for students worldwide.
            </div>

          </div>

          <div className="globe-area">

            <div className="globe-glow"></div>

            <div className="globe">

              <div className="globe-land land-one"></div>
              <div className="globe-land land-two"></div>
              <div className="globe-land land-three"></div>

              <div className="globe-line line-one"></div>
              <div className="globe-line line-two"></div>
              <div className="globe-line line-three"></div>

            </div>

            <div className="flag flag-turkey">🇹🇷</div>
            <div className="flag flag-sudan">🇸🇩</div>
            <div className="flag flag-uk">🇬🇧</div>
            <div className="flag flag-germany">🇩🇪</div>
            <div className="flag flag-brazil">🇧🇷</div>
            <div className="flag flag-saudi">🇸🇦</div>

            <div className="globe-label">
              STUDENTS AROUND THE WORLD
            </div>

          </div>

        </main>

        {showAuth && (
          <AuthModal
            isRegister={isRegister}
            switchAuth={switchAuth}
            closeAuth={closeAuth}
            loading={loading}
            message={message}

            firstName={firstName}
            setFirstName={setFirstName}

            lastName={lastName}
            setLastName={setLastName}

            email={email}
            setEmail={setEmail}

            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}

            country={country}
            setCountry={setCountry}

            password={password}
            setPassword={setPassword}

            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}

            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}

            handleRegister={handleRegister}
            handleLogin={handleLogin}
            handleResetPassword={handleResetPassword}
          />
        )}

      </div>
    );
  }

  /* =========================
     STUDENT PAGE
  ========================== */

  return (
    <div className="student-page">

      <nav className="student-navbar">

        <div className="container student-nav-content">

          <div className="logo">
            MIDOYOL
          </div>

          <div className="student-nav-right">

            <span className="student-name">
              {user?.displayName || "Student"}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      <main className="student-main">

        <div className="student-welcome">

          <span className="small-title">
            STUDENT PORTAL
          </span>

          <h1>
            Welcome to MIDOYOL
          </h1>

          <p>
            Choose your field and major to explore
            available universities.
          </p>

        </div>

        <section
          className="study-selection"
          id="study-selection"
        >

          <div className="selection-card">

            <div className="selection-number">
              01
            </div>

            <div className="selection-content">

              <label>
                Choose Your Field
              </label>

              <select
                value={selectedField}
                onChange={handleFieldChange}
              >

                <option value="">
                  Select Field
                </option>

                {Object.keys(fields).map((field) => (
                  <option
                    value={field}
                    key={field}
                  >
                    {field}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {selectedField && (
            <div className="selection-card">

              <div className="selection-number">
                02
              </div>

              <div className="selection-content">

                <label>
                  Choose Your Major
                </label>

                <select
                  value={selectedMajor}
                  onChange={(e) =>
                    setSelectedMajor(e.target.value)
                  }
                >

                  <option value="">
                    Select Major
                  </option>

                  {fields[selectedField].map((major) => (
                    <option
                      value={major}
                      key={major}
                    >
                      {major}
                    </option>
                  ))}

                </select>

              </div>

            </div>
          )}

        </section>

        {selectedMajor && (
          <section className="universities-section">

            <div className="portal-section-title">

              <div>
                <span className="small-title">
                  AVAILABLE UNIVERSITIES
                </span>

                <h2>
                  {selectedMajor}
                </h2>
              </div>

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

                    <h3>
                      {university.name}
                    </h3>

                    <p>
                      {university.programs}
                    </p>

                    <div className="scholarship">
                      🎁 {university.scholarship}
                    </div>

                    <button
                      className="apply-button"
                      onClick={handleApplication}
                    >
                      Start Application →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>
        )}

      </main>

      <footer className="student-footer">

        <div className="container footer-content">

          <div>

            <div className="logo">
              MIDOYOL
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

    </div>
  );
}

/* =========================
   AUTH MODAL
========================= */

function AuthModal({
  isRegister,
  switchAuth,
  closeAuth,
  loading,
  message,

  firstName,
  setFirstName,

  lastName,
  setLastName,

  email,
  setEmail,

  dateOfBirth,
  setDateOfBirth,

  country,
  setCountry,

  password,
  setPassword,

  confirmPassword,
  setConfirmPassword,

  acceptedTerms,
  setAcceptedTerms,

  handleRegister,
  handleLogin,
  handleResetPassword,
}) {
  return (
    <div className="login-overlay">

      <div className="login-modal">

        <button
          className="login-close"
          onClick={closeAuth}
          disabled={loading}
        >
          ×
        </button>

        <div className="login-logo">
          MIDOYOL
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

        <form
          onSubmit={
            isRegister
              ? handleRegister
              : handleLogin
          }
        >

          {isRegister && (
            <>
              <label>First Name</label>

              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                autoComplete="given-name"
              />

              <label>Last Name</label>

              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                autoComplete="family-name"
              />
            </>
          )}

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

          {isRegister && (
            <>
              <label>Date of Birth</label>

              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
              />

              <label>Country</label>

              <input
                type="text"
                placeholder="Enter your country"
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
                autoComplete="country-name"
              />
            </>
          )}

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

          {isRegister && (
            <>
              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
              />

              <label className="terms-label">

                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) =>
                    setAcceptedTerms(e.target.checked)
                  }
                />

                <span>
                  I agree to the Terms & Privacy Policy.
                </span>

              </label>
            </>
          )}

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
            disabled={loading}
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
            onClick={switchAuth}
            disabled={loading}
          >
            {isRegister
              ? " Login"
              : " Create Account"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================
   RENDER
========================= */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
