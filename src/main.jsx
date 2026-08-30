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

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

/* =========================
   UNIVERSITIES
========================= */

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
  {
    name: "Nisantasi University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Special Discounts",
  },
  {
    name: "Bahcesehir University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
  {
    name: "Biruni University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
];

/* =========================
   FIELDS & MAJORS
========================= */

const fields = [
  {
    id: "medicine",
    icon: "🩺",
    name: "Medicine & Health",
    description: "Medical and health-related programs",
    majors: [
      "Medicine",
      "Dentistry",
      "Pharmacy",
      "Nursing",
      "Physiotherapy",
      "Nutrition & Dietetics",
    ],
  },
  {
    id: "engineering",
    icon: "🏗️",
    name: "Engineering",
    description: "Build the future with technology",
    majors: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Industrial Engineering",
      "Mechatronics Engineering",
      "Architecture",
    ],
  },
  {
    id: "computer",
    icon: "💻",
    name: "Computer Science & IT",
    description: "Technology, software and digital innovation",
    majors: [
      "Computer Engineering",
      "Software Engineering",
      "Computer Science",
      "Artificial Intelligence",
      "Information Technology",
      "Cybersecurity",
    ],
  },
  {
    id: "business",
    icon: "💼",
    name: "Business & Economics",
    description: "Business, finance and entrepreneurship",
    majors: [
      "Business Administration",
      "International Business",
      "Economics",
      "Finance",
      "Accounting",
      "Marketing",
    ],
  },
  {
    id: "law",
    icon: "⚖️",
    name: "Law & Political Science",
    description: "Law, politics and international relations",
    majors: [
      "Law",
      "Political Science",
      "International Relations",
      "Public Administration",
      "International Law",
    ],
  },
  {
    id: "social",
    icon: "🌍",
    name: "Social Sciences",
    description: "People, society and human behavior",
    majors: [
      "Psychology",
      "Sociology",
      "Media & Communication",
      "International Studies",
      "Social Work",
    ],
  },
  {
    id: "arts",
    icon: "🎨",
    name: "Arts & Design",
    description: "Creative programs and visual communication",
    majors: [
      "Graphic Design",
      "Interior Design",
      "Visual Communication",
      "Fashion Design",
      "Fine Arts",
      "Film & Television",
    ],
  },
  {
    id: "science",
    icon: "🧪",
    name: "Sciences",
    description: "Explore science and research",
    majors: [
      "Biology",
      "Chemistry",
      "Physics",
      "Biotechnology",
      "Mathematics",
      "Molecular Biology",
    ],
  },
  {
    id: "education",
    icon: "📚",
    name: "Education",
    description: "Build the next generation",
    majors: [
      "Early Childhood Education",
      "Primary Education",
      "English Teaching",
      "Mathematics Teaching",
      "Special Education",
    ],
  },
];

/* =========================
   APP
========================= */

function App() {
  const [user, setUser] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [showPortal, setShowPortal] = useState(false);

  const [selectedField, setSelectedField] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [applicationStep, setApplicationStep] = useState(0);

  const [application, setApplication] = useState({
    studyLevel: "",
    field: "",
    major: "",
    university: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    education: "",
    documents: "",
  });

  /* AUTH FORM */

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
        setShowPortal(true);
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     AUTH FUNCTIONS
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
        setShowPortal(true);
      }, 900);

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already registered.");
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
        setShowPortal(true);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowPortal(false);
      setSelectedField(null);
      setSelectedMajor("");
      setSelectedUniversity(null);
      setApplicationStep(0);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     APPLICATION
  ========================== */

  const startApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    setApplicationStep(1);

    setTimeout(() => {
      document
        .getElementById("application")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  const chooseField = (field) => {
    setSelectedField(field);
    setSelectedMajor("");

    setApplication((prev) => ({
      ...prev,
      field: field.name,
      major: "",
    }));
  };

  const chooseMajor = (major) => {
    setSelectedMajor(major);

    setApplication((prev) => ({
      ...prev,
      major,
    }));

    setApplicationStep(2);

    setTimeout(() => {
      document
        .getElementById("universities")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  const chooseUniversity = (university) => {
    setSelectedUniversity(university);

    setApplication((prev) => ({
      ...prev,
      university: university.name,
    }));

    setApplicationStep(3);

    setTimeout(() => {
      document
        .getElementById("application")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  const updateApplication = (field, value) => {
    setApplication((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const continueApplication = () => {
    setApplicationStep((prev) => prev + 1);
  };

  const goBackApplication = () => {
    setApplicationStep((prev) =>
      Math.max(1, prev - 1)
    );
  };

  const submitApplication = async () => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(
          db,
          "applications",
          `${user.uid}_${Date.now()}`
        ),
        {
          studentId: user.uid,
          studentEmail: user.email,
          ...application,
          status: "Pending Payment",
          applicationFee: 1,
          currency: "USD",
          createdAt: serverTimestamp(),
        }
      );

      setApplicationStep(6);
      setMessage(
        "Application saved. Payment is the final step."
      );

    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to save your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LANDING PAGE
  ========================== */

  if (!showPortal) {
    return (
      <div className="landing-page">

        <div className="landing-logo-box">
          <div className="landing-logo">
            MIDOYOL
          </div>
        </div>

        <div className="landing-content">

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
              Discover universities, explore your field,
              choose your major, and apply through
              MIDOYOL from anywhere in the world.
            </p>

            <div className="landing-features">

              <span>✓ Universities</span>
              <span>✓ Programs</span>
              <span>✓ Application Support</span>

            </div>

            <div className="landing-buttons">

              <button
                className="landing-auth-button"
                onClick={openLogin}
              >
                LOG IN
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

          <div className="landing-right">

            <div className="landing-card">

              <div className="landing-card-icon">
                🎓
              </div>

              <h2>
                Find Your Future
              </h2>

              <p>
                Choose your field, discover your major,
                find a university and start your journey.
              </p>

              <div className="landing-card-line">
                <span>01</span>
                Choose Your Field
              </div>

              <div className="landing-card-line">
                <span>02</span>
                Choose Your Major
              </div>

              <div className="landing-card-line">
                <span>03</span>
                Choose Your University
              </div>

              <div className="landing-card-line">
                <span>04</span>
                Complete Your Application
              </div>

              <div className="landing-card-world">
                🌍 Students Worldwide
              </div>

            </div>

          </div>

        </div>

        {showAuth && (
          <AuthModal
            isRegister={isRegister}
            setIsRegister={setIsRegister}
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
     STUDENT PORTAL
  ========================== */

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="container nav-content">

          <div className="logo">
            MIDOYOL
          </div>

          <div className="nav-links">

            <a href="#home">
              Home
            </a>

            <a href="#fields">
              Fields
            </a>

            <a href="#universities">
              Universities
            </a>

            <a href="#application">
              Application
            </a>

            <button
              className="nav-login"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

          <button
            className="nav-button"
            onClick={startApplication}
          >
            Start Application
          </button>

        </div>

      </nav>

      {/* WELCOME */}

      <section
        className="portal-welcome"
        id="home"
      >

        <div className="container">

          <span className="hero-label">
            WELCOME TO MIDOYOL
          </span>

          <h1>
            Find the right
            <span> path for your future.</span>
          </h1>

          <p>
            Explore fields and majors, discover universities,
            and complete your application step by step.
          </p>

        </div>

      </section>

      {/* FIELDS */}

      <section
        className="fields-section"
        id="fields"
      >

        <div className="container">

          <div className="section-heading">

            <div>

              <span className="small-title">
                EXPLORE YOUR OPTIONS
              </span>

              <h2>
                What do you want to study?
              </h2>

            </div>

          </div>

          <div className="fields-grid">

            {fields.map((field) => (

              <button
                className={`field-card ${
                  selectedField?.id === field.id
                    ? "field-selected"
                    : ""
                }`}
                key={field.id}
                onClick={() => chooseField(field)}
              >

                <div className="field-icon">
                  {field.icon}
                </div>

                <h3>
                  {field.name}
                </h3>

                <p>
                  {field.description}
                </p>

                <span>
                  Explore majors →
                </span>

              </button>

            ))}

          </div>

          {selectedField && (

            <div className="major-box">

              <div className="major-header">

                <div>

                  <span className="small-title">
                    SELECTED FIELD
                  </span>

                  <h2>
                    {selectedField.icon}{" "}
                    {selectedField.name}
                  </h2>

                </div>

                <button
                  onClick={() => {
                    setSelectedField(null);
                    setSelectedMajor("");
                  }}
                >
                  Change Field
                </button>

              </div>

              <div className="major-grid">

                {selectedField.majors.map((major) => (

                  <button
                    key={major}
                    className={
                      selectedMajor === major
                        ? "major-selected"
                        : ""
                    }
                    onClick={() =>
                      chooseMajor(major)
                    }
                  >
                    {major}
                    <span>→</span>
                  </button>

                ))}

              </div>

            </div>

          )}

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
                FIND YOUR UNIVERSITY
              </span>

              <h2>
                Choose Your University
              </h2>

            </div>

          </div>

          {!selectedMajor ? (

            <div className="selection-message">
              <span>🎓</span>
              <h3>
                Choose a major first
              </h3>
              <p>
                Select a field and major above to
                continue your university search.
              </p>
            </div>

          ) : (

            <>

              <div className="selected-program">

                <span>
                  YOUR SELECTION
                </span>

                <strong>
                  {selectedField?.name}
                  {" • "}
                  {selectedMajor}
                </strong>

              </div>

              <div className="university-grid">

                {universities.map((university) => (

                  <div
                    className={`university-card ${
                      selectedUniversity?.name ===
                      university.name
                        ? "university-selected"
                        : ""
                    }`}
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
                        onClick={() =>
                          chooseUniversity(
                            university
                          )
                        }
                      >
                        Select University →
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </div>

      </section>

      {/* APPLICATION */}

      <section
        className="application-section"
        id="application"
      >

        <div className="container">

          <div className="section-center">

            <span className="small-title">
              YOUR APPLICATION
            </span>

            <h2>
              Complete Your Application
            </h2>

            <p>
              Your application is completed step by step.
            </p>

          </div>

          {applicationStep === 0 && (

            <div className="application-start">

              <div className="application-start-icon">
                📝
              </div>

              <h3>
                Ready to apply?
              </h3>

              <p>
                Choose your field, major and university
                before starting your application.
              </p>

              <button
                className="primary-button"
                onClick={startApplication}
              >
                Start Application
              </button>

            </div>

          )}

          {applicationStep >= 1 &&
            applicationStep <= 5 && (

            <div className="application-box">

              {/* PROGRESS */}

              <div className="application-progress">

                {[1, 2, 3, 4, 5].map((step) => (

                  <div
                    className={
                      applicationStep >= step
                        ? "progress-active"
                        : ""
                    }
                    key={step}
                  >
                    <span>{step}</span>
                  </div>

                ))}

              </div>

              {/* STEP 1 */}

              {applicationStep === 1 && (

                <div className="application-step">

                  <span className="small-title">
                    STEP 1
                  </span>

                  <h3>
                    Choose your study level
                  </h3>

                  <p>
                    What level do you want to study?
                  </p>

                  <div className="choice-grid">

                    {[
                      "Bachelor's Degree",
                      "Master's Degree",
                      "PhD",
                    ].map((level) => (

                      <button
                        className={
                          application.studyLevel ===
                          level
                            ? "choice-selected"
                            : ""
                        }
                        key={level}
                        onClick={() =>
                          updateApplication(
                            "studyLevel",
                            level
                          )
                        }
                      >
                        🎓 {level}
                      </button>

                    ))}

                  </div>

                  <div className="application-actions">

                    <button
                      className="secondary-button"
                      onClick={() =>
                        setApplicationStep(0)
                      }
                    >
                      Back
                    </button>

                    <button
                      className="primary-button"
                      disabled={!application.studyLevel}
                      onClick={continueApplication}
                    >
                      Continue →
                    </button>

                  </div>

                </div>

              )}

              {/* STEP 2 */}

              {applicationStep === 2 && (

                <div className="application-step">

                  <span className="small-title">
                    STEP 2
                  </span>

                  <h3>
                    Confirm your program
                  </h3>

                  <div className="summary-card">

                    <div>
                      <span>Field</span>
                      <strong>
                        {application.field}
                      </strong>
                    </div>

                    <div>
                      <span>Major</span>
                      <strong>
                        {application.major}
                      </strong>
                    </div>

                    <div>
                      <span>Study Level</span>
                      <strong>
                        {application.studyLevel}
                      </strong>
                    </div>

                  </div>

                  <div className="application-actions">

                    <button
                      className="secondary-button"
                      onClick={goBackApplication}
                    >
                      Back
                    </button>

                    <button
                      className="primary-button"
                      onClick={continueApplication}
                    >
                      Continue →
                    </button>

                  </div>

                </div>

              )}

              {/* STEP 3 */}

              {applicationStep === 3 && (

                <div className="application-step">

                  <span className="small-title">
                    STEP 3
                  </span>

                  <h3>
                    Personal Information
                  </h3>

                  <div className="form-grid">

                    <div>
                      <label>
                        First Name
                      </label>

                      <input
                        type="text"
                        value={
                          application.firstName
                        }
                        onChange={(e) =>
                          updateApplication(
                            "firstName",
                            e.target.value
                          )
                        }
                        placeholder="First name"
                      />
                    </div>

                    <div>
                      <label>
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={
                          application.lastName
                        }
                        onChange={(e) =>
                          updateApplication(
                            "lastName",
                            e.target.value
                          )
                        }
                        placeholder="Last name"
                      />
                    </div>

                    <div>
                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        value={
                          application.email ||
                          user?.email ||
                          ""
                        }
                        onChange={(e) =>
                          updateApplication(
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <label>
                        Country
                      </label>

                      <input
                        type="text"
                        value={
                          application.country
                        }
                        onChange={(e) =>
                          updateApplication(
                            "country",
                            e.target.value
                          )
                        }
                        placeholder="Country"
                      />
                    </div>

                    <div className="full-form">
                      <label>
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        value={
                          application.phone
                        }
                        onChange={(e) =>
                          updateApplication(
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="+90..."
                      />
                    </div>

                  </div>

                  <div className="application-actions">

                    <button
                      className="secondary-button"
                      onClick={goBackApplication}
                    >
                      Back
                    </button>

                    <button
                      className="primary-button"
                      onClick={continueApplication}
                    >
                      Continue →
                    </button>

                  </div>

                </div>

              )}

              {/* STEP 4 */}

              {applicationStep === 4 && (

                <div className="application-step">

                  <span className="small-title">
                    STEP 4
                  </span>

                  <h3>
                    Education & Documents
                  </h3>

                  <div className="form-grid">

                    <div className="full-form">

                      <label>
                        Previous Education
                      </label>

                      <input
                        type="text"
                        value={
                          application.education
                        }
                        onChange={(e) =>
                          updateApplication(
                            "education",
                            e.target.value
                          )
                        }
                        placeholder="High school / Bachelor's degree..."
                      />

                    </div>

                    <div className="full-form">

                      <label>
                        Documents
                      </label>

                      <textarea
                        value={
                          application.documents
                        }
                        onChange={(e) =>
                          updateApplication(
                            "documents",
                            e.target.value
                          )
                        }
                        placeholder="List the documents you have available..."
                        rows="5"
                      />

                    </div>

                  </div>

                  <div className="application-actions">

                    <button
                      className="secondary-button"
                      onClick={goBackApplication}
                    >
                      Back
                    </button>

                    <button
                      className="primary-button"
                      onClick={continueApplication}
                    >
                      Continue →
                    </button>

                  </div>

                </div>

              )}

              {/* STEP 5 */}

              {applicationStep === 5 && (

                <div className="application-step">

                  <span className="small-title">
                    STEP 5
                  </span>

                  <h3>
                    Review Your Application
                  </h3>

                  <div className="review-card">

                    <div>
                      <span>Study Level</span>
                      <strong>
                        {application.studyLevel}
                      </strong>
                    </div>

                    <div>
                      <span>Field</span>
                      <strong>
                        {application.field}
                      </strong>
                    </div>

                    <div>
                      <span>Major</span>
                      <strong>
                        {application.major}
                      </strong>
                    </div>

                    <div>
                      <span>University</span>
                      <strong>
                        {application.university}
                      </strong>
                    </div>

                    <div>
                      <span>Student</span>
                      <strong>
                        {application.firstName}{" "}
                        {application.lastName}
                      </strong>
                    </div>

                    <div>
                      <span>Country</span>
                      <strong>
                        {application.country}
                      </strong>
                    </div>

                  </div>

                  <div className="important-note">

                    <strong>
                      Final step
                    </strong>

                    <p>
                      Your application information is
                      ready. The application fee of
                      <strong> $1 USD </strong>
                      will only be requested after
                      you finish reviewing your application.
                    </p>

                  </div>

                  <div className="application-actions">

                    <button
                      className="secondary-button"
                      onClick={goBackApplication}
                    >
                      Back
                    </button>

                    <button
                      className="primary-button"
                      onClick={submitApplication}
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : "Continue to $1 Payment →"}
                    </button>

                  </div>

                </div>

              )}

            </div>

          )}

          {/* FINAL PAYMENT */}

          {applicationStep === 6 && (

            <div className="payment-box">

              <div className="payment-icon">
                ✓
              </div>

              <span className="small-title">
                APPLICATION READY
              </span>

              <h2>
                One Final Step
              </h2>

              <p>
                Your application has been prepared.
                Complete the application fee to submit it.
              </p>

              <div className="payment-price">
                <span>
                  Application Fee
                </span>

                <strong>
                  $1
                </strong>

                <small>
                  USD
                </small>
              </div>

              <button
                className="primary-button payment-button"
                onClick={() =>
                  alert(
                    "Payment gateway will be connected here."
                  )
                }
              >
                Pay $1 & Submit Application
              </button>

              <div className="payment-secure">
                🔒 Secure payment • Application fee only
              </div>

            </div>

          )}

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

            <h2>
              How MIDOYOL Works
            </h2>

            <p>
              Choose. Apply. Track.
            </p>

          </div>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Explore
              </h3>

              <p>
                Choose the field and major
                you want to study.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Apply
              </h3>

              <p>
                Complete your information
                and application documents.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Submit
              </h3>

              <p>
                Pay the $1 application fee
                at the final stage.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="cta">

        <div className="container cta-content">

          <div>

            <span>
              READY TO START?
            </span>

            <h2>
              Start Your University Journey.
            </h2>

          </div>

          <button
            className="primary-button"
            onClick={startApplication}
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
  setIsRegister,
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
              <label>
                First Name
              </label>

              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                autoComplete="given-name"
              />

              <label>
                Last Name
              </label>

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

          <label>
            Email
          </label>

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
              <label>
                Date of Birth
              </label>

              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
              />

              <label>
                Country
              </label>

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

          <label>
            Password
          </label>

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
              <label>
                Confirm Password
              </label>

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
                    setAcceptedTerms(
                      e.target.checked
                    )
                  }
                />

                <span>
                  I agree to the Terms &
                  Privacy Policy.
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
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
