import React, { useEffect, useState } from "react";
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
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

function App() {
  /* =========================
     GENERAL
  ========================= */

  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================
     AUTH
  ========================= */

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  /* =========================
     APPLICATION
  ========================= */

  const [applicationLoading, setApplicationLoading] = useState(false);

  const [selectedField, setSelectedField] = useState("");
  const [selectedFieldName, setSelectedFieldName] = useState("");

  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedMajorName, setSelectedMajorName] = useState("");

  const [applicationStep, setApplicationStep] = useState("field");
  const [showMajorStep, setShowMajorStep] = useState(false);

  /* =========================
     FIELDS
  ========================= */

  const fields = [
    {
      id: "computer-it",
      name: "Computer & IT",
      description:
        "Technology, software, artificial intelligence, data and information systems.",
    },
    {
      id: "engineering",
      name: "Engineering",
      description:
        "Engineering programs covering technology, construction, industry and energy.",
    },
    {
      id: "medicine-health",
      name: "Medicine & Health Sciences",
      description:
        "Medical, dental, pharmacy, nursing and other health-related programs.",
    },
    {
      id: "business-economics",
      name: "Business & Economics",
      description:
        "Business, finance, economics, accounting, marketing and management.",
    },
    {
      id: "law-social",
      name: "Law & Social Sciences",
      description:
        "Law, political science, international relations, psychology and social sciences.",
    },
    {
      id: "architecture-design",
      name: "Architecture & Design",
      description:
        "Architecture, interior architecture, industrial design and visual design.",
    },
    {
      id: "communication-media",
      name: "Communication & Media",
      description:
        "Communication, journalism, public relations, cinema and advertising.",
    },
    {
      id: "education",
      name: "Education",
      description:
        "Teaching, education sciences, mathematics, languages and special education.",
    },
    {
      id: "aviation",
      name: "Aviation",
      description:
        "Pilotage, aviation management, air transport and aviation-related programs.",
    },
    {
      id: "tourism-hospitality",
      name: "Tourism & Hospitality",
      description:
        "Tourism, hotels, gastronomy, travel management and tourism guidance.",
    },
  ];

  /* =========================
     MAJORS
  ========================= */

  const majorsByField = {
    "computer-it": [
      {
        id: "computer-engineering",
        name: "Computer Engineering",
      },
      {
        id: "software-engineering",
        name: "Software Engineering",
      },
      {
        id: "artificial-intelligence",
        name: "Artificial Intelligence",
      },
      {
        id: "information-systems",
        name: "Information Systems",
      },
      {
        id: "cyber-security",
        name: "Cyber Security",
      },
      {
        id: "data-science",
        name: "Data Science",
      },
      {
        id: "computer-science",
        name: "Computer Science",
      },
    ],

    engineering: [
      {
        id: "mechanical-engineering",
        name: "Mechanical Engineering",
      },
      {
        id: "civil-engineering",
        name: "Civil Engineering",
      },
      {
        id: "electrical-electronics",
        name: "Electrical & Electronics Engineering",
      },
      {
        id: "industrial-engineering",
        name: "Industrial Engineering",
      },
      {
        id: "mechatronics-engineering",
        name: "Mechatronics Engineering",
      },
      {
        id: "chemical-engineering",
        name: "Chemical Engineering",
      },
      {
        id: "environmental-engineering",
        name: "Environmental Engineering",
      },
    ],

    "medicine-health": [
      {
        id: "medicine",
        name: "Medicine",
      },
      {
        id: "dentistry",
        name: "Dentistry",
      },
      {
        id: "pharmacy",
        name: "Pharmacy",
      },
      {
        id: "nursing",
        name: "Nursing",
      },
      {
        id: "physiotherapy",
        name: "Physiotherapy",
      },
      {
        id: "nutrition-dietetics",
        name: "Nutrition & Dietetics",
      },
      {
        id: "medical-laboratory",
        name: "Medical Laboratory",
      },
    ],

    "business-economics": [
      {
        id: "business-administration",
        name: "Business Administration",
      },
      {
        id: "economics",
        name: "Economics",
      },
      {
        id: "finance",
        name: "Finance",
      },
      {
        id: "international-trade",
        name: "International Trade",
      },
      {
        id: "accounting",
        name: "Accounting",
      },
      {
        id: "marketing",
        name: "Marketing",
      },
      {
        id: "management",
        name: "Management",
      },
    ],

    "law-social": [
      {
        id: "law",
        name: "Law",
      },
      {
        id: "political-science",
        name: "Political Science",
      },
      {
        id: "international-relations",
        name: "International Relations",
      },
      {
        id: "psychology",
        name: "Psychology",
      },
      {
        id: "sociology",
        name: "Sociology",
      },
      {
        id: "public-administration",
        name: "Public Administration",
      },
    ],

    "architecture-design": [
      {
        id: "architecture",
        name: "Architecture",
      },
      {
        id: "interior-architecture",
        name: "Interior Architecture",
      },
      {
        id: "industrial-design",
        name: "Industrial Design",
      },
      {
        id: "graphic-design",
        name: "Graphic Design",
      },
      {
        id: "urban-design",
        name: "Urban Design",
      },
    ],

    "communication-media": [
      {
        id: "communication",
        name: "Communication",
      },
      {
        id: "media-communication",
        name: "Media and Communication",
      },
      {
        id: "journalism",
        name: "Journalism",
      },
      {
        id: "public-relations",
        name: "Public Relations",
      },
      {
        id: "radio-tv-cinema",
        name: "Radio / TV / Cinema",
      },
      {
        id: "advertising",
        name: "Advertising",
      },
    ],

    education: [
      {
        id: "elementary-education",
        name: "Elementary Education",
      },
      {
        id: "early-childhood",
        name: "Early Childhood Education",
      },
      {
        id: "english-language-teaching",
        name: "English Language Teaching",
      },
      {
        id: "mathematics-education",
        name: "Mathematics Education",
      },
      {
        id: "special-education",
        name: "Special Education",
      },
      {
        id: "educational-sciences",
        name: "Educational Sciences",
      },
    ],

    aviation: [
      {
        id: "pilotage",
        name: "Pilotage",
      },
      {
        id: "aviation-management",
        name: "Aviation Management",
      },
      {
        id: "air-transport-management",
        name: "Air Transport Management",
      },
      {
        id: "aircraft-technology",
        name: "Aircraft Technology",
      },
      {
        id: "cabin-services",
        name: "Cabin Services",
      },
    ],

    "tourism-hospitality": [
      {
        id: "tourism-management",
        name: "Tourism Management",
      },
      {
        id: "hotel-management",
        name: "Hotel Management",
      },
      {
        id: "gastronomy",
        name: "Gastronomy",
      },
      {
        id: "travel-management",
        name: "Travel Management",
      },
      {
        id: "tourism-guidance",
        name: "Tourism Guidance",
      },
    ],
  };

  /* =========================
     AUTH STATE
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadApplication(currentUser.uid);
      } else {
        setSelectedField("");
        setSelectedFieldName("");
        setSelectedMajor("");
        setSelectedMajorName("");
        setApplicationStep("field");
        setShowMajorStep(false);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     LOAD APPLICATION
  ========================= */

  const loadApplication = async (uid) => {
    try {
      setApplicationLoading(true);

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        if (data.selectedField) {
          setSelectedField(data.selectedField);
          setSelectedFieldName(
            data.selectedFieldName || ""
          );
        }

        if (data.selectedMajor) {
          setSelectedMajor(data.selectedMajor);
          setSelectedMajorName(
            data.selectedMajorName || ""
          );
        }

        if (data.applicationStep) {
          setApplicationStep(data.applicationStep);

          if (data.applicationStep === "major") {
            setShowMajorStep(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading application:", error);
    } finally {
      setApplicationLoading(false);
    }
  };

  /* =========================
     NAVIGATION
  ========================= */

  const goTo = (id) => {
    setMenuOpen(false);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================
     AUTH MODAL
  ========================= */

  const openLogin = () => {
    setAuthMode("login");
    setAuthError("");
    setAuthSuccess("");
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthError("");
    setAuthSuccess("");
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    if (authSubmitting) return;

    setAuthModalOpen(false);
    setAuthError("");
    setAuthSuccess("");
  };

  /* =========================
     AUTH
  ========================= */

  const handleAuth = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "register") {
      if (!name.trim()) {
        setAuthError("Please enter your name.");
        return;
      }

      if (password.length < 6) {
        setAuthError(
          "Password must be at least 6 characters."
        );
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
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await updateProfile(result.user, {
          displayName: name.trim(),
        });

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            uid: result.user.uid,
            name: name.trim(),
            email: email,
            createdAt: new Date().toISOString(),
            applicationStep: "field",
          },
          { merge: true }
        );

        setAuthSuccess(
          "Your account has been created successfully."
        );

        setTimeout(() => {
          setAuthModalOpen(false);
        }, 800);
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setAuthSuccess("Login successful.");

        setTimeout(() => {
          setAuthModalOpen(false);
        }, 500);
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setAuthError(
          "This email is already registered."
        );
      } else if (error.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email.");
      } else if (
        error.code === "auth/invalid-credential"
      ) {
        setAuthError(
          "Incorrect email or password."
        );
      } else if (
        error.code === "auth/weak-password"
      ) {
        setAuthError(
          "Password must be at least 6 characters."
        );
      } else {
        setAuthError(
          error.message || "Something went wrong."
        );
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  /* =========================
     FORGOT PASSWORD
  ========================= */

  const handleForgotPassword = async () => {
    setAuthError("");
    setAuthSuccess("");

    if (!email) {
      setAuthError(
        "Enter your email first."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      setAuthSuccess(
        "Password reset email sent."
      );
    } catch (error) {
      console.error(error);

      setAuthError(
        error.message ||
          "Unable to send reset email."
      );
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setSelectedField("");
      setSelectedFieldName("");
      setSelectedMajor("");
      setSelectedMajorName("");
      setApplicationStep("field");
      setShowMajorStep(false);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     START APPLICATION
  ========================= */

  const startApplication = () => {
    if (!user) {
      openLogin();
      return;
    }

    setApplicationStep("field");
    setShowMajorStep(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     SELECT FIELD
  ========================= */

  const handleFieldSelect = async (field) => {
    if (!user) return;

    try {
      setSelectedField(field.id);
      setSelectedFieldName(field.name);

      /*
        When changing the field, the old major
        must not remain selected.
      */

      setSelectedMajor("");
      setSelectedMajorName("");

      await setDoc(
        doc(db, "users", user.uid),
        {
          selectedField: field.id,
          selectedFieldName: field.name,
          selectedMajor: "",
          selectedMajorName: "",
          applicationStep: "field",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setApplicationStep("field");
    } catch (error) {
      console.error(
        "Error saving field:",
        error
      );

      alert(
        "We couldn't save your field. Please try again."
      );
    }
  };

  /* =========================
     CONTINUE TO MAJOR
  ========================= */

  const continueToMajor = () => {
    if (!selectedField) {
      alert("Please select a field first.");
      return;
    }

    setShowMajorStep(true);

    setTimeout(() => {
      const element =
        document.getElementById("major-section");

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  /* =========================
     SELECT MAJOR
  ========================= */

  const handleMajorSelect = async (major) => {
    if (!user || !selectedField) return;

    try {
      setSelectedMajor(major.id);
      setSelectedMajorName(major.name);

      await setDoc(
        doc(db, "users", user.uid),
        {
          selectedField,
          selectedFieldName,
          selectedMajor: major.id,
          selectedMajorName: major.name,
          applicationStep: "major",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setApplicationStep("major");
    } catch (error) {
      console.error(
        "Error saving major:",
        error
      );

      alert(
        "We couldn't save your major. Please try again."
      );
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eaf6ff",
          fontFamily: "Arial, sans-serif",
          color: "#1c3144",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px 40px",
            borderRadius: "18px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          Loading MIDOYOL...
        </div>
      </div>
    );
  }

  /* =========================
     LOGGED-IN APPLICATION
  ========================= */

  if (user) {
    const availableMajors =
      majorsByField[selectedField] || [];

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7fcff",
          fontFamily:
            "Arial, Helvetica, sans-serif",
          color: "#172b3a",
        }}
      >
        {/* NAVBAR */}

        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "#ffffff",
            borderBottom:
              "1px solid #e5eef5",
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#65b9f5",
                letterSpacing: "-1px",
              }}
            >
              MIDOYOL
            </div>

            <button
              onClick={handleLogout}
              style={{
                border: "none",
                background: "#65b9f5",
                color: "#fff",
                padding: "11px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* APPLICATION */}

        <main
          style={{
            maxWidth: "1180px",
            margin: "auto",
            padding: "45px 20px 80px",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#65b9f5",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              MIDOYOL APPLICATION
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                lineHeight: 1.2,
                marginBottom: "12px",
              }}
            >
              Start Your University Journey
            </h1>

            <p
              style={{
                margin: 0,
                color: "#71808d",
                fontSize: "16px",
              }}
            >
              Choose your field and major to
              continue your application.
            </p>
          </div>

          {/* PROGRESS */}

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "22px",
              marginBottom: "35px",
              boxShadow:
                "0 8px 30px rgba(44, 110, 150, 0.07)",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                minWidth: "750px",
                justifyContent:
                  "space-between",
                gap: "10px",
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
              ].map((step, index) => {
                const stepNumber = index + 1;

                let active = false;
                let completed = false;

                if (step === "Field") {
                  active =
                    applicationStep ===
                      "field" &&
                    !showMajorStep;

                  completed =
                    !!selectedField &&
                    (showMajorStep ||
                      applicationStep ===
                        "major");
                }

                if (step === "Major") {
                  active =
                    showMajorStep ||
                    applicationStep ===
                      "major";

                  completed =
                    !!selectedMajor;
                }

                return (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        minWidth: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        background:
                          completed ||
                          active
                            ? "#65b9f5"
                            : "#edf3f7",
                        color:
                          completed ||
                          active
                            ? "#fff"
                            : "#8a9aa7",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {completed
                        ? "✓"
                        : stepNumber}
                    </div>

                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight:
                          active ||
                          completed
                            ? "700"
                            : "500",
                        color:
                          active ||
                          completed
                            ? "#243b4a"
                            : "#8a9aa7",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FIELD SECTION */}

          <section
            id="field-section"
            style={{
              background: "#fff",
              borderRadius: "22px",
              padding: "30px",
              marginBottom: "30px",
              boxShadow:
                "0 8px 30px rgba(44, 110, 150, 0.07)",
            }}
          >
            <div
              style={{
                marginBottom: "25px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "27px",
                }}
              >
                Choose Your Field
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#71808d",
                }}
              >
                Select the academic field you
                want to study.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
              }}
            >
              {fields.map((field) => {
                const selected =
                  selectedField === field.id;

                return (
                  <button
                    key={field.id}
                    onClick={() =>
                      handleFieldSelect(
                        field
                      )
                    }
                    style={{
                      textAlign: "left",
                      background: selected
                        ? "#eaf6ff"
                        : "#ffffff",
                      border: selected
                        ? "2px solid #65b9f5"
                        : "1px solid #e0eaf0",
                      borderRadius: "16px",
                      padding: "20px",
                      cursor: "pointer",
                      transition:
                        "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "10px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          color:
                            "#1d3444",
                        }}
                      >
                        {field.name}
                      </h3>

                      {selected && (
                        <span
                          style={{
                            color:
                              "#65b9f5",
                            fontWeight:
                              "800",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin:
                          "10px 0 0",
                        color:
                          "#748592",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.5,
                      }}
                    >
                      {
                        field.description
                      }
                    </p>
                  </button>
                );
              })}
            </div>

            {/* SELECTED FIELD */}

            {selectedField && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  background: "#f7fcff",
                  borderRadius: "15px",
                  border:
                    "1px solid #dceffb",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#748592",
                    marginBottom: "5px",
                  }}
                >
                  Selected Field
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1d3444",
                  }}
                >
                  {selectedFieldName}
                </div>

                <button
                  onClick={continueToMajor}
                  style={{
                    marginTop: "18px",
                    border: "none",
                    background:
                      "#65b9f5",
                    color: "#fff",
                    padding:
                      "13px 22px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  Continue to Major →
                </button>
              </div>
            )}
          </section>

          {/* MAJOR SECTION */}

          {showMajorStep &&
            selectedField && (
              <section
                id="major-section"
                style={{
                  background: "#fff",
                  borderRadius: "22px",
                  padding: "30px",
                  marginBottom: "30px",
                  boxShadow:
                    "0 8px 30px rgba(44, 110, 150, 0.07)",
                  scrollMarginTop:
                    "90px",
                }}
              >
                <div
                  style={{
                    marginBottom: "25px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color:
                        "#65b9f5",
                      fontWeight:
                        "700",
                      marginBottom:
                        "8px",
                    }}
                  >
                    {selectedFieldName}
                  </div>

                  <h2
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize:
                        "27px",
                    }}
                  >
                    Choose Your Major
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#71808d",
                    }}
                  >
                    Choose the major you
                    want to study within
                    your selected field.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {availableMajors.map(
                    (major) => {
                      const selected =
                        selectedMajor ===
                        major.id;

                      return (
                        <button
                          key={
                            major.id
                          }
                          onClick={() =>
                            handleMajorSelect(
                              major
                            )
                          }
                          style={{
                            textAlign:
                              "left",
                            background:
                              selected
                                ? "#eaf6ff"
                                : "#fff",
                            border:
                              selected
                                ? "2px solid #65b9f5"
                                : "1px solid #e0eaf0",
                            borderRadius:
                              "15px",
                            padding:
                              "19px",
                            cursor:
                              "pointer",
                            minHeight:
                              "70px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "15px",
                              fontWeight:
                                selected
                                  ? "700"
                                  : "600",
                              color:
                                "#203746",
                            }}
                          >
                            {
                              major.name
                            }
                          </span>

                          {selected && (
                            <span
                              style={{
                                color:
                                  "#65b9f5",
                                fontWeight:
                                  "800",
                                fontSize:
                                  "18px",
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* SELECTED MAJOR */}

                {selectedMajor && (
                  <div
                    style={{
                      marginTop:
                        "25px",
                      padding:
                        "20px",
                      background:
                        "#f7fcff",
                      borderRadius:
                        "15px",
                      border:
                        "1px solid #dceffb",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#748592",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Selected Major
                    </div>

                    <div
                      style={{
                        fontSize:
                          "20px",
                        fontWeight:
                          "700",
                        color:
                          "#1d3444",
                      }}
                    >
                      {
                        selectedMajorName
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          "12px",
                        fontSize:
                          "13px",
                        color:
                          "#65b9f5",
                        fontWeight:
                          "600",
                      }}
                    >
                      Major saved
                      successfully.
                    </div>
                  </div>
                )}
              </section>
            )}

          {/* CURRENT SELECTION SUMMARY */}

          {(selectedField ||
            selectedMajor) && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "22px",
                border:
                  "1px solid #e5eef5",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#71808d",
                  marginBottom: "12px",
                  fontWeight: "700",
                }}
              >
                YOUR CURRENT SELECTION
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {selectedFieldName && (
                  <div
                    style={{
                      padding:
                        "10px 15px",
                      background:
                        "#eaf6ff",
                      borderRadius:
                        "10px",
                      color:
                        "#24516d",
                      fontSize:
                        "14px",
                    }}
                  >
                    Field:{" "}
                    <strong>
                      {
                        selectedFieldName
                      }
                    </strong>
                  </div>
                )}

                {selectedMajorName && (
                  <div
                    style={{
                      padding:
                        "10px 15px",
                      background:
                        "#eaf6ff",
                      borderRadius:
                        "10px",
                      color:
                        "#24516d",
                      fontSize:
                        "14px",
                    }}
                  >
                    Major:{" "}
                    <strong>
                      {
                        selectedMajorName
                      }
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* =========================
     LANDING PAGE
  ========================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#172b3a",
      }}
    >
      {/* NAVBAR */}

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#ffffff",
          borderBottom:
            "1px solid #eaf0f4",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: "#65b9f5",
              letterSpacing: "-1px",
            }}
          >
            MIDOYOL
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={openLogin}
              style={{
                background: "transparent",
                border: "none",
                padding:
                  "10px 15px",
                cursor: "pointer",
                fontWeight: "600",
                color: "#304655",
              }}
            >
              Login
            </button>

            <button
              onClick={openRegister}
              style={{
                background:
                  "#65b9f5",
                color: "#fff",
                border: "none",
                padding:
                  "11px 18px",
                borderRadius:
                  "10px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section
        style={{
          background:
            "linear-gradient(135deg, #eaf6ff 0%, #d9f1ff 100%)",
          minHeight:
            "560px",
          display: "flex",
          alignItems:
            "center",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            width: "100%",
            margin: "auto",
            padding:
              "70px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display:
                "inline-block",
              padding:
                "8px 14px",
              background:
                "#ffffff",
              borderRadius:
                "30px",
              color:
                "#65b9f5",
              fontSize:
                "13px",
              fontWeight:
                "700",
              marginBottom:
                "20px",
            }}
          >
            STUDY ABROAD MADE SIMPLE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(42px, 7vw, 72px)",
              lineHeight: 1.05,
              fontWeight:
                "800",
              color:
                "#1b3445",
            }}
          >
            Your University
            <br />
            Journey Starts Here
          </h1>

          <p
            style={{
              maxWidth:
                "650px",
              margin:
                "25px auto",
              color:
                "#607583",
              fontSize:
                "17px",
              lineHeight:
                1.7,
            }}
          >
            Discover universities,
            choose your field and
            major, and start your
            application journey with
            MIDOYOL.
          </p>

          <button
            onClick={startApplication}
            style={{
              background:
                "#65b9f5",
              color: "#fff",
              border: "none",
              padding:
                "15px 30px",
              borderRadius:
                "12px",
              fontSize:
                "16px",
              fontWeight:
                "700",
              cursor:
                "pointer",
            }}
          >
            Start Your Application
          </button>

          <div
            style={{
              marginTop:
                "15px",
              fontSize:
                "13px",
              color:
                "#71808d",
            }}
          >
            Application fee: $1
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        style={{
          padding:
            "75px 24px",
          background:
            "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth:
              "1100px",
            margin:
              "auto",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              color:
                "#65b9f5",
              fontWeight:
                "700",
              fontSize:
                "13px",
              marginBottom:
                "10px",
            }}
          >
            HOW IT WORKS
          </div>

          <h2
            style={{
              margin:
                "0 0 40px",
              fontSize:
                "34px",
            }}
          >
            A Simple Journey
          </h2>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              [
                "01",
                "Choose Your Field",
              ],
              [
                "02",
                "Choose Your Major",
              ],
              [
                "03",
                "Find Your University",
              ],
              [
                "04",
                "Complete Your Application",
              ],
            ].map(
              ([number, title]) => (
                <div
                  key={number}
                  style={{
                    padding:
                      "25px",
                    background:
                      "#f7fcff",
                    borderRadius:
                      "16px",
                    textAlign:
                      "left",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#65b9f5",
                      fontWeight:
                        "800",
                      marginBottom:
                        "12px",
                    }}
                  >
                    {number}
                  </div>

                  <div
                    style={{
                      fontWeight:
                        "700",
                      fontSize:
                        "17px",
                    }}
                  >
                    {title}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* UNIVERSITIES */}

      <section
        id="universities"
        style={{
          padding:
            "70px 24px",
          background:
            "#f7fcff",
        }}
      >
        <div
          style={{
            maxWidth:
              "1100px",
            margin:
              "auto",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              color:
                "#65b9f5",
              fontWeight:
                "700",
              fontSize:
                "13px",
              marginBottom:
                "10px",
            }}
          >
            UNIVERSITIES
          </div>

          <h2
            style={{
              margin:
                "0 0 35px",
              fontSize:
                "34px",
            }}
          >
            Find Your University
          </h2>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            {[
              "Istanbul Aydın University",
              "Istanbul Gelişim University",
              "İstinye University",
            ].map(
              (university) => (
                <div
                  key={university}
                  style={{
                    background:
                      "#ffffff",
                    borderRadius:
                      "16px",
                    padding:
                      "28px 20px",
                    border:
                      "1px solid #e5eef5",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "18px",
                    }}
                  >
                    {university}
                  </h3>

                  <p
                    style={{
                      color:
                        "#71808d",
                      fontSize:
                        "13px",
                      marginTop:
                        "10px",
                    }}
                  >
                    Explore available
                    programs through
                    MIDOYOL.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}

      <section
        id="about"
        style={{
          padding:
            "75px 24px",
          background:
            "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth:
              "800px",
            margin:
              "auto",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              color:
                "#65b9f5",
              fontWeight:
                "700",
              fontSize:
                "13px",
              marginBottom:
                "10px",
            }}
          >
            ABOUT MIDOYOL
          </div>

          <h2
            style={{
              margin:
                "0 0 18px",
              fontSize:
                "34px",
            }}
          >
            Built for Students
          </h2>

          <p
            style={{
              color:
                "#71808d",
              lineHeight:
                1.8,
              margin: 0,
            }}
          >
            MIDOYOL is designed to make the
            university journey easier by
            bringing university discovery,
            applications and student services
            together in one place.
          </p>
        </div>
      </section>

      {/* CTA */}

      <section
        style={{
          padding:
            "70px 24px",
          background:
            "#eaf6ff",
          textAlign:
            "center",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 15px",
            fontSize:
              "34px",
          }}
        >
          Ready to Start?
        </h2>

        <p
          style={{
            color:
              "#71808d",
            margin:
              "0 0 25px",
          }}
        >
          Create your account and begin
          your university journey.
        </p>

        <button
          onClick={openRegister}
          style={{
            background:
              "#65b9f5",
            color: "#fff",
            border: "none",
            padding:
              "14px 28px",
            borderRadius:
              "11px",
            cursor:
              "pointer",
            fontWeight:
              "700",
          }}
        >
          Create Account
        </button>
      </section>

      {/* FOOTER */}

      <footer
        style={{
          background:
            "#ffffff",
          borderTop:
            "1px solid #e9f0f4",
          padding:
            "25px 24px",
          textAlign:
            "center",
          color:
            "#8a9aa7",
          fontSize:
            "13px",
        }}
      >
        © {new Date().getFullYear()} MIDOYOL. All
        rights reserved.
      </footer>

      {/* AUTH MODAL */}

      {authModalOpen && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(17, 37, 51, 0.45)",
            zIndex: 1000,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
          }}
          onClick={closeAuth}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "430px",
              background:
                "#ffffff",
              borderRadius:
                "20px",
              padding:
                "30px",
              position:
                "relative",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={closeAuth}
              style={{
                position:
                  "absolute",
                top: "15px",
                right: "15px",
                border:
                  "none",
                background:
                  "transparent",
                fontSize:
                  "24px",
                cursor:
                  "pointer",
                color:
                  "#71808d",
              }}
            >
              ×
            </button>

            <h2
              style={{
                margin:
                  "0 0 8px",
                fontSize:
                  "28px",
              }}
            >
              {authMode ===
              "login"
                ? "Welcome Back"
                : "Create Your Account"}
            </h2>

            <p
              style={{
                color:
                  "#71808d",
                margin:
                  "0 0 25px",
                fontSize:
                  "14px",
              }}
            >
              {authMode ===
              "login"
                ? "Login to continue your MIDOYOL journey."
                : "Create your MIDOYOL account to start your application."}
            </p>

            {/* TABS */}

            <div
              style={{
                display:
                  "flex",
                background:
                  "#f2f7fa",
                borderRadius:
                  "10px",
                padding:
                  "4px",
                marginBottom:
                  "22px",
              }}
            >
              <button
                onClick={() => {
                  setAuthMode(
                    "login"
                  );
                  setAuthError("");
                  setAuthSuccess("");
                }}
                style={{
                  flex: 1,
                  border:
                    "none",
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  background:
                    authMode ===
                    "login"
                      ? "#ffffff"
                      : "transparent",
                  fontWeight:
                    authMode ===
                    "login"
                      ? "700"
                      : "500",
                }}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setAuthMode(
                    "register"
                  );
                  setAuthError("");
                  setAuthSuccess("");
                }}
                style={{
                  flex: 1,
                  border:
                    "none",
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  background:
                    authMode ===
                    "register"
                      ? "#ffffff"
                      : "transparent",
                  fontWeight:
                    authMode ===
                    "register"
                      ? "700"
                      : "500",
                }}
              >
                Sign up
              </button>
            </div>

            <form
              onSubmit={handleAuth}
            >
              {authMode ===
                "register" && (
                <div
                  style={{
                    marginBottom:
                      "15px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "7px",
                      fontSize:
                        "13px",
                      fontWeight:
                        "700",
                    }}
                  >
                    Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target
                          .value
                      )
                    }
                    placeholder="Your name"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "13px",
                      border:
                        "1px solid #dce7ed",
                      borderRadius:
                        "10px",
                      outline:
                        "none",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  marginBottom:
                    "15px",
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "13px",
                    fontWeight:
                      "700",
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target
                        .value
                    )
                  }
                  placeholder="you@example.com"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    border:
                      "1px solid #dce7ed",
                    borderRadius:
                      "10px",
                    outline:
                      "none",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom:
                    "15px",
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "13px",
                    fontWeight:
                      "700",
                  }}
                >
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target
                        .value
                    )
                  }
                  placeholder="Password"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    border:
                      "1px solid #dce7ed",
                    borderRadius:
                      "10px",
                    outline:
                      "none",
                  }}
                />
              </div>

              {authMode ===
                "register" && (
                <div
                  style={{
                    marginBottom:
                      "15px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "7px",
                      fontSize:
                        "13px",
                      fontWeight:
                        "700",
                    }}
                  >
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target
                          .value
                      )
                    }
                    placeholder="Confirm password"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "13px",
                      border:
                        "1px solid #dce7ed",
                      borderRadius:
                        "10px",
                      outline:
                        "none",
                    }}
                  />
                </div>
              )}

              {authError && (
                <div
                  style={{
                    background:
                      "#fff1f1",
                    color:
                      "#c0392b",
                    padding:
                      "11px 13px",
                    borderRadius:
                      "9px",
                    fontSize:
                      "13px",
                    marginBottom:
                      "14px",
                  }}
                >
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div
                  style={{
                    background:
                      "#eefaf3",
                    color:
                      "#23844b",
                    padding:
                      "11px 13px",
                    borderRadius:
                      "9px",
                    fontSize:
                      "13px",
                    marginBottom:
                      "14px",
                  }}
                >
                  {authSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  authSubmitting
                }
                style={{
                  width:
                    "100%",
                  border:
                    "none",
                  background:
                    "#65b9f5",
                  color:
                    "#ffffff",
                  padding:
                    "14px",
                  borderRadius:
                    "10px",
                  cursor:
                    authSubmitting
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    "700",
                  opacity:
                    authSubmitting
                      ? 0.7
                      : 1,
                }}
              >
                {authSubmitting
                  ? "Please wait..."
                  : authMode ===
                    "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            {authMode ===
              "login" && (
              <button
                onClick={
                  handleForgotPassword
                }
                style={{
                  marginTop:
                    "16px",
                  width:
                    "100%",
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "#65b9f5",
                  cursor:
                    "pointer",
                  fontSize:
                    "13px",
                  fontWeight:
                    "600",
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
