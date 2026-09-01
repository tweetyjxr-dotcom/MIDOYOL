import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { auth, db, storage } from "./firebase";

/* =========================================================
   MIDOYOL DATA
========================================================= */

const UNIVERSITIES = [
  "Istanbul Aydin University",
  "Istanbul Gelisim University",
  "Istinye University",
];

const STUDY_FIELDS = {
  "Medicine & Health": [
    "Medicine",
    "Dentistry",
    "Pharmacy",
    "Nursing",
    "Physiotherapy",
    "Nutrition & Dietetics",
  ],

  Engineering: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering",
    "Industrial Engineering",
    "Architecture",
  ],

  "Computer Science & IT": [
    "Computer Engineering",
    "Software Engineering",
    "Artificial Intelligence",
    "Information Technology",
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

  "Law & Social Sciences": [
    "Law",
    "International Relations",
    "Political Science",
    "Psychology",
    "Sociology",
  ],
};

const REQUIRED_DOCUMENTS = [
  {
    id: "passport",
    title: "Passport / ID",
    description: "Upload a clear copy of your passport or national ID.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "diploma",
    title: "High School Diploma",
    description: "Upload your high school diploma or graduation certificate.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "transcript",
    title: "Academic Transcript",
    description: "Upload your latest academic transcript.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "photo",
    title: "Personal Photo",
    description: "Upload a recent passport-style photo.",
    accept: ".jpg,.jpeg,.png",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const generateApplicationId = () => {
  const year = new Date().getFullYear();

  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().split("-")[0].toUpperCase()
      : Math.random().toString(36).substring(2, 10).toUpperCase();

  return `MIDO-${year}-${randomPart}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  try {
    if (value?.toDate) {
      return value.toDate().toLocaleDateString("en-US");
    }

    return new Date(value).toLocaleDateString("en-US");
  } catch {
    return "—";
  }
};

const formatDateTime = (value) => {
  if (!value) return "—";

  try {
    if (value?.toDate) {
      return value.toDate().toLocaleString("en-US");
    }

    return new Date(value).toLocaleString("en-US");
  } catch {
    return "—";
  }
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
   APP
========================================================= */

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [page, setPage] = useState("home");

  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(true);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("midoyol-dark-mode") === "true";
  });

  const [applicationId, setApplicationId] = useState("");
  const [application, setApplication] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------------------
     AUTH
  --------------------------------------------------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);

      if (!currentUser) {
        setPage("home");
        setApplicationId("");
        setApplication(null);
        setDocuments([]);
        setPayments([]);
        setNotifications([]);
        return;
      }

      await loadStudentData(currentUser);

      if (currentUser.emailVerified) {
        setPage("dashboard");
      } else {
        setPage("verify");
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------------------------------------------------------
     DARK MODE
  --------------------------------------------------------- */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    localStorage.setItem(
      "midoyol-dark-mode",
      darkMode ? "true" : "false"
    );
  }, [darkMode]);

  /* ---------------------------------------------------------
     LOAD STUDENT
  --------------------------------------------------------- */

  const loadStudentData = async (currentUser) => {
    try {
      const studentRef = doc(db, "students", currentUser.uid);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        await setDoc(
          studentRef,
          {
            uid: currentUser.uid,
            email: currentUser.email || "",
            fullName: currentUser.displayName || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        return;
      }

      const studentData = studentSnap.data();

      if (studentData.currentApplicationId) {
        setApplicationId(studentData.currentApplicationId);

        await loadApplication(
          currentUser.uid,
          studentData.currentApplicationId
        );
      }

      await loadNotifications(currentUser.uid);
      await loadPayments(currentUser.uid);

      if (studentData.currentApplicationId) {
        await loadDocuments(
          currentUser.uid,
          studentData.currentApplicationId
        );
      }
    } catch (error) {
      console.error("Load student error:", error);
    }
  };

  /* ---------------------------------------------------------
     APPLICATION
  --------------------------------------------------------- */

  const loadApplication = async (uid, id) => {
    try {
      const applicationRef = doc(db, "applications", id);
      const applicationSnap = await getDoc(applicationRef);

      if (applicationSnap.exists()) {
        setApplication(applicationSnap.data());
      }
    } catch (error) {
      console.error("Load application error:", error);
    }
  };

  const ensureApplication = async () => {
    if (!user) return null;

    if (applicationId && application) {
      return applicationId;
    }

    try {
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const data = studentSnap.data();

        if (data.currentApplicationId) {
          const existingId = data.currentApplicationId;

          setApplicationId(existingId);

          await loadApplication(user.uid, existingId);

          return existingId;
        }
      }

      const newId = generateApplicationId();

      const newApplication = {
        applicationNumber: newId,
        studentId: user.uid,
        email: user.email || "",
        stage: "choose",
        status: "draft",

        field: "",
        specialization: "",
        university: "",

        documentsComplete: false,
        paymentStatus: "coming_soon",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "applications", newId),
        newApplication
      );

      await setDoc(
        studentRef,
        {
          currentApplicationId: newId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setApplicationId(newId);
      setApplication(newApplication);

      await createNotification(
        "Application started",
        `Your MIDOYOL application ${newId} has been created.`
      );

      return newId;
    } catch (error) {
      console.error("Create application error:", error);
      alert("Could not create your application. Please try again.");
      return null;
    }
  };

  const saveApplication = async (updates = {}) => {
    if (!user || !applicationId) return;

    setSaving(true);

    try {
      const updatedApplication = {
        ...application,
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "applications", applicationId),
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setApplication(updatedApplication);
    } catch (error) {
      console.error("Save application error:", error);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     DOCUMENTS
  --------------------------------------------------------- */

  const loadDocuments = async (uid, appId) => {
    try {
      const documentsRef = collection(
        db,
        "applications",
        appId,
        "documents"
      );

      const snapshot = await getDocs(documentsRef);

      const loaded = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setDocuments(loaded);
    } catch (error) {
      console.error("Load documents error:", error);
    }
  };

  const uploadDocument = async (documentType, file) => {
    if (!user || !applicationId || !file) return;

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 10 MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, JPG, JPEG, or PNG file.");
      return;
    }

    try {
      setSaving(true);

      const storagePath = `students/${user.uid}/applications/${applicationId}/${documentType}/${file.name}`;

      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(
        doc(
          db,
          "applications",
          applicationId,
          "documents",
          documentType
        ),
        {
          documentType,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          storagePath,
          downloadURL,
          status: "uploaded",
          uploadedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await loadDocuments(user.uid, applicationId);

      await createNotification(
        "Document uploaded",
        `${documentType} has been uploaded successfully.`
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert("Could not upload the document. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (documentItem) => {
    if (!user || !applicationId || !documentItem?.storagePath) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this document?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const storageRef = ref(storage, documentItem.storagePath);

      await deleteObject(storageRef);

      await setDoc(
        doc(
          db,
          "applications",
          applicationId,
          "documents",
          documentItem.documentType
        ),
        {
          status: "missing",
          fileName: "",
          storagePath: "",
          downloadURL: "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await loadDocuments(user.uid, applicationId);
    } catch (error) {
      console.error("Delete document error:", error);
      alert("Could not remove the document.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     PAYMENTS
  --------------------------------------------------------- */

  const loadPayments = async (uid) => {
    try {
      const paymentsRef = collection(db, "payments");

      const snapshot = await getDocs(paymentsRef);

      const loaded = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((payment) => payment.studentId === uid)
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || 0;
          const bDate = b.createdAt?.toDate?.() || 0;

          return bDate - aDate;
        });

      setPayments(loaded);
    } catch (error) {
      console.error("Load payments error:", error);
    }
  };

  const createPaymentRequest = async () => {
    if (!user || !applicationId) return;

    try {
      setSaving(true);

      const paymentRef = await addDoc(collection(db, "payments"), {
        studentId: user.uid,
        applicationId,
        type: "Application Fee",
        amount: 1,
        currency: "USD",
        status: "pending",
        transactionId: "",
        createdAt: serverTimestamp(),
      });

      await loadPayments(user.uid);

      await createNotification(
        "Payment",
        "Your $1 application fee payment request has been created. Payment gateway is coming soon."
      );

      alert(
        `Payment request created.\n\nReference: ${paymentRef.id}\n\nThe payment gateway is coming soon.`
      );
    } catch (error) {
      console.error("Payment request error:", error);
      alert("Could not create the payment request.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     NOTIFICATIONS
  --------------------------------------------------------- */

  const loadNotifications = async (uid) => {
    try {
      const notificationsRef = collection(
        db,
        "users",
        uid,
        "notifications"
      );

      const q = query(
        notificationsRef,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const loaded = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setNotifications(loaded);
    } catch (error) {
      console.error("Notifications error:", error);
    }
  };

  const createNotification = async (title, message) => {
    if (!user) return;

    try {
      await addDoc(
        collection(db, "users", user.uid, "notifications"),
        {
          uid: user.uid,
          title,
          message,
          read: false,
          createdAt: serverTimestamp(),
        }
      );

      await loadNotifications(user.uid);
    } catch (error) {
      console.error("Create notification error:", error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    if (!user) return;

    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "notifications",
          notificationId
        ),
        {
          read: true,
        },
        { merge: true }
      );

      await loadNotifications(user.uid);
    } catch (error) {
      console.error("Notification update error:", error);
    }
  };

  /* ---------------------------------------------------------
     AUTH FUNCTIONS
  --------------------------------------------------------- */

  const handleRegister = async (form) => {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      country,
      password,
      confirmPassword,
      acceptedTerms,
    } = form;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !country ||
      !password ||
      !confirmPassword
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept the Terms & Privacy Policy.");
      return;
    }

    try {
      setSaving(true);

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const newUser = credential.user;

      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(
        doc(db, "students", newUser.uid),
        {
          uid: newUser.uid,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          dateOfBirth,
          country,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await sendEmailVerification(newUser);
      } catch (verificationError) {
        console.error(
          "Verification email error:",
          verificationError
        );
      }

      setShowAuth(false);
      setPage("verify");

      alert(
        "Account created successfully. Please check your email and verify your account."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak.");
      } else {
        alert(
          error.message ||
            "Could not create your account."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setSaving(true);

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const loggedUser = credential.user;

      await reload(loggedUser);

      if (!auth.currentUser.emailVerified) {
        setShowAuth(false);
        setPage("verify");
        return;
      }

      await loadStudentData(loggedUser);

      setShowAuth(false);
      setPage("dashboard");
    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Email or password is incorrect.");
      } else if (error.code === "auth/user-not-found") {
        alert("No account was found with this email.");
      } else {
        alert(
          error.message ||
            "Could not sign you in."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (email) => {
    if (!email) {
      alert("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      alert(
        "Password reset email sent. Please check your inbox."
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Could not send the password reset email."
      );
    }
  };

  const resendVerification = async () => {
    if (!auth.currentUser) return;

    try {
      await sendEmailVerification(auth.currentUser);

      alert(
        "Verification email sent again. Please check your inbox."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/too-many-requests") {
        alert(
          "Too many requests. Please wait a little before trying again."
        );
      } else {
        alert(
          error.message ||
            "Could not send the verification email."
        );
      }
    }
  };

  const checkEmailVerification = async () => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);

      await reload(auth.currentUser);

      if (auth.currentUser.emailVerified) {
        await loadStudentData(auth.currentUser);

        setPage("dashboard");

        await createNotification(
          "Email verified",
          "Your MIDOYOL account has been verified successfully."
        );
      } else {
        alert(
          "Your email is not verified yet. Please check your inbox."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Could not check verification status.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setShowMobileMenu(false);
      setShowNotifications(false);
      setPage("home");
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------------------------------------------------
     APPLICATION NAVIGATION
  --------------------------------------------------------- */

  const startApplication = async () => {
    if (!user) {
      setIsRegister(true);
      setShowAuth(true);
      return;
    }

    if (!user.emailVerified) {
      setPage("verify");
      return;
    }

    await ensureApplication();

    setPage("application");
    setShowMobileMenu(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToDocuments = async () => {
    if (!applicationId) {
      await ensureApplication();
    }

    setPage("documents");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ---------------------------------------------------------
     PROGRESS
  --------------------------------------------------------- */

  const documentCount = documents.filter(
    (item) => item.status === "uploaded"
  ).length;

  const documentsComplete =
    documentCount >= REQUIRED_DOCUMENTS.length;

  const chooseComplete =
    Boolean(
      application?.field &&
        application?.specialization &&
        application?.university
    );

  const progressStage = useMemo(() => {
    if (!user || !user.emailVerified) return 1;

    if (!chooseComplete) return 2;

    if (!documentsComplete) return 3;

    return 4;
  }, [
    user,
    chooseComplete,
    documentsComplete,
  ]);

  /* ---------------------------------------------------------
     SUPPORT
  --------------------------------------------------------- */

  const submitSupport = async (subject, message) => {
    if (!user) return;

    if (!subject || !message) {
      alert("Please complete the support form.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "supportTickets"), {
        studentId: user.uid,
        email: user.email || "",
        subject,
        message,
        status: "open",
        createdAt: serverTimestamp(),
      });

      await createNotification(
        "Support request received",
        "Your support request has been submitted successfully."
      );

      setShowSupport(false);

      alert(
        "Your support request has been submitted."
      );
    } catch (error) {
      console.error(error);
      alert("Could not submit your support request.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     AUTH CHECKING
  ========================================================= */

  if (authChecking) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">MIDOYOL</div>
        <div className="spinner"></div>
        <p>Loading your journey...</p>
      </div>
    );
  }

  /* =========================================================
     VERIFY EMAIL
  ========================================================= */

  if (user && page === "verify") {
    return (
      <VerificationScreen
        user={user}
        onResend={resendVerification}
        onCheck={checkEmailVerification}
        onLogout={logout}
        loading={saving}
      />
    );
  }

  /* =========================================================
     HOME
  ========================================================= */

  if (!user || page === "home") {
    return (
      <>
        <LandingPage
          onLogin={() => {
            setIsRegister(false);
            setShowAuth(true);
          }}
          onRegister={() => {
            setIsRegister(true);
            setShowAuth(true);
          }}
          onStart={startApplication}
        />

        {showAuth && (
          <AuthModal
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            onClose={() => setShowAuth(false)}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onResetPassword={handleResetPassword}
            loading={saving}
          />
        )}
      </>
    );
  }

  /* =========================================================
     PORTAL
  ========================================================= */

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onStartApplication={startApplication}
        onLogout={logout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        markNotificationRead={markNotificationRead}
        onProgress={() => {
          setPage("dashboard");
          setShowMobileMenu(false);

          setTimeout(() => {
            document
              .getElementById("progress-section")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }, 100);
        }}
        onPayments={() => {
          setShowPaymentHistory(true);
          setShowMobileMenu(false);
        }}
      />

      <main>
        {page === "dashboard" && (
          <DashboardPage
            user={user}
            application={application}
            applicationId={applicationId}
            progressStage={progressStage}
            documentCount={documentCount}
            documentsComplete={documentsComplete}
            chooseComplete={chooseComplete}
            onStartApplication={startApplication}
            onDocuments={goToDocuments}
            onSupport={() => setShowSupport(true)}
          />
        )}

        {page === "application" && (
          <ApplicationPage
            user={user}
            application={application}
            applicationId={applicationId}
            saving={saving}
            onSave={saveApplication}
            onDocuments={goToDocuments}
          />
        )}

        {page === "documents" && (
          <DocumentsPage
            applicationId={applicationId}
            documents={documents}
            saving={saving}
            onUpload={uploadDocument}
            onDelete={deleteDocument}
            onBack={() => setPage("application")}
            onPayment={() => setPage("payment")}
          />
        )}

        {page === "payment" && (
          <PaymentPage
            applicationId={applicationId}
            payments={payments}
            saving={saving}
            onCreatePayment={createPaymentRequest}
            onReceipt={setShowReceipt}
          />
        )}
      </main>

      <Footer
        onSupport={() => setShowSupport(true)}
      />

      {showPaymentHistory && (
        <PaymentHistoryModal
          payments={payments}
          onClose={() => setShowPaymentHistory(false)}
          onReceipt={setShowReceipt}
        />
      )}

      {showReceipt && (
        <ReceiptModal
          payment={showReceipt}
          onClose={() => setShowReceipt(null)}
        />
      )}

      {showSupport && (
        <SupportModal
          onClose={() => setShowSupport(false)}
          onSubmit={submitSupport}
          loading={saving}
        />
      )}
    </div>
  );
}

/* =========================================================
   LANDING PAGE
========================================================= */

function LandingPage({
  onLogin,
  onRegister,
  onStart,
}) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand-box">MIDOYOL</div>

        <div className="landing-actions">
          <button
            className="text-button"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            className="primary-button small"
            onClick={onRegister}
          >
            Sign Up
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            STUDY ABROAD MADE SIMPLE
          </div>

          <h1>
            Your Journey to
            <span> University </span>
            Starts Here.
          </h1>

          <p>
            Apply to universities, organize your documents,
            and follow your application journey — all in one
            simple platform.
          </p>

          <div className="hero-price">
            <strong>$1</strong>
            <span>application fee</span>
          </div>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={onStart}
            >
              Start Your Application
              <span>→</span>
            </button>

            <button
              className="secondary-button"
              onClick={onRegister}
            >
              Create Account
            </button>
          </div>

          <div className="hero-trust">
            <span>✓ Simple process</span>
            <span>✓ Student-focused</span>
            <span>✓ One platform</span>
          </div>
        </div>

        <div className="globe-wrapper">
          <div className="globe">
            <div className="globe-line line-one"></div>
            <div className="globe-line line-two"></div>
            <div className="globe-line line-three"></div>
            <div className="globe-shine"></div>

            <div className="globe-flag flag-tr">
              🇹🇷
            </div>

            <div className="globe-flag flag-sd">
              🇸🇩
            </div>

            <div className="globe-flag flag-uk">
              🇬🇧
            </div>

            <div className="globe-flag flag-de">
              🇩🇪
            </div>

            <div className="globe-flag flag-br">
              🇧🇷
            </div>

            <div className="globe-flag flag-sa">
              🇸🇦
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div>
          <span>01</span>
          <h3>Choose</h3>
          <p>
            Select your field, specialization and university.
          </p>
        </div>

        <div>
          <span>02</span>
          <h3>Prepare</h3>
          <p>
            Upload the documents needed for your application.
          </p>
        </div>

        <div>
          <span>03</span>
          <h3>Track</h3>
          <p>
            Follow every stage of your application from one
            dashboard.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} MIDOYOL. All rights reserved.
      </footer>
    </div>
  );
}

/* =========================================================
   VERIFICATION SCREEN
========================================================= */

function VerificationScreen({
  user,
  onResend,
  onCheck,
  onLogout,
  loading,
}) {
  return (
    <div className="verification-page">
      <div className="verification-card">
        <div className="verification-icon">
          ✉
        </div>

        <div className="brand-box centered">
          MIDOYOL
        </div>

        <h1>Verify your email</h1>

        <p>
          We sent a verification link to:
        </p>

        <strong className="verification-email">
          {user.email}
        </strong>

        <p className="muted">
          Open the email and click the verification link.
          After that, come back here and tap the button below.
        </p>

        <button
          className="primary-button full"
          onClick={onCheck}
          disabled={loading}
        >
          {loading
            ? "Checking..."
            : "I Verified My Email"}
        </button>

        <button
          className="secondary-button full"
          onClick={onResend}
          disabled={loading}
        >
          Resend Verification Email
        </button>

        <button
          className="link-button"
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({
  user,
  page,
  setPage,
  onStartApplication,
  onLogout,
  darkMode,
  setDarkMode,
  showMobileMenu,
  setShowMobileMenu,
  notifications,
  showNotifications,
  setShowNotifications,
  markNotificationRead,
  onProgress,
  onPayments,
}) {
  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <>
      <nav className="navbar">
        <button
          className="nav-brand"
          onClick={() => setPage("dashboard")}
        >
          MIDOYOL
        </button>

        <div className="desktop-nav-links">
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Home
          </button>

          <button
            onClick={() => {
              setPage("dashboard");

              setTimeout(() => {
                document
                  .getElementById("universities-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }, 50);
            }}
          >
            Universities
          </button>

          <button
            onClick={() => {
              setPage("application");
              onStartApplication();
            }}
          >
            Study
          </button>
        </div>

        <div className="nav-right">
          <button
            className="notification-button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >
            ♧

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            className="nav-start-button"
            onClick={onStartApplication}
          >
            Start Application
          </button>

          <button
            className="hamburger"
            onClick={() =>
              setShowMobileMenu(!showMobileMenu)
            }
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onRead={markNotificationRead}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </nav>

      {showMobileMenu && (
        <MobileMenu
          user={user}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onProgress={onProgress}
          onPayments={onPayments}
          onLogout={onLogout}
          onClose={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
}

/* =========================================================
   MOBILE MENU
========================================================= */

function MobileMenu({
  user,
  darkMode,
  setDarkMode,
  onProgress,
  onPayments,
  onLogout,
  onClose,
}) {
  return (
    <div className="mobile-menu-overlay">
      <aside className="mobile-menu">
        <div className="mobile-menu-top">
          <div className="mobile-menu-brand">
            MIDOYOL
          </div>

          <button
            className="menu-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mobile-user-card">
          <div className="user-avatar">
            {(user?.email || "S")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <small>Student Account</small>
            <strong>{user?.email}</strong>
          </div>
        </div>

        <div className="mobile-menu-items">
          <button
            onClick={() => setDarkMode(!darkMode)}
          >
            <span>🌙</span>

            <div>
              <strong>Dark Mode</strong>
              <small>
                {darkMode ? "On" : "Off"}
              </small>
            </div>

            <div
              className={`toggle ${
                darkMode ? "on" : ""
              }`}
            >
              <span></span>
            </div>
          </button>

          <button onClick={onProgress}>
            <span>📊</span>

            <div>
              <strong>Application Progress</strong>
              <small>
                View your current stage
              </small>
            </div>

            <span>›</span>
          </button>

          <button onClick={onPayments}>
            <span>💳</span>

            <div>
              <strong>Payments</strong>
              <small>
                Payment History & Receipts
              </small>
            </div>

            <span>›</span>
          </button>
        </div>

        <div className="mobile-menu-bottom">
          <button
            className="logout-menu-button"
            onClick={onLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationPanel({
  notifications,
  onRead,
  onClose,
}) {
  return (
    <div className="notification-panel">
      <div className="panel-header">
        <div>
          <h3>Notifications</h3>
          <p>Your latest MIDOYOL updates</p>
        </div>

        <button onClick={onClose}>×</button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-panel">
          <span>🔔</span>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.slice(0, 8).map((item) => (
            <button
              className={`notification-item ${
                item.read ? "" : "unread"
              }`}
              key={item.id}
              onClick={() => onRead(item.id)}
            >
              <div className="notification-dot">
                {item.read ? "✓" : "!"}
              </div>

              <div>
                <strong>{item.title}</strong>

                <p>{item.message}</p>

                <small>
                  {formatDateTime(item.createdAt)}
                </small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage({
  user,
  application,
  applicationId,
  progressStage,
  documentCount,
  documentsComplete,
  chooseComplete,
  onStartApplication,
  onDocuments,
  onSupport,
}) {
  return (
    <div className="portal-page">
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            MIDOYOL STUDENT PORTAL
          </div>

          <h1>
            Welcome back,
            <span>
              {" "}
              {user.displayName?.split(" ")[0] ||
                "Student"}
            </span>
          </h1>

          <p>
            Everything you need for your university journey,
            organized in one place.
          </p>
        </div>

        {applicationId && (
          <div className="application-id-badge">
            <small>APPLICATION ID</small>
            <strong>{applicationId}</strong>
          </div>
        )}
      </section>

      <section id="progress-section">
        <ProgressTracker
          currentStage={progressStage}
          documentsComplete={documentsComplete}
          chooseComplete={chooseComplete}
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-main-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">
                YOUR APPLICATION
              </span>

              <h2>
                Continue your journey
              </h2>
            </div>

            <span className="save-indicator">
              ● Auto Save
            </span>
          </div>

          <div className="dashboard-status">
            <div>
              <span className="status-icon">✓</span>

              <div>
                <strong>
                  Registration
                </strong>

                <small>
                  Account successfully created
                </small>
              </div>
            </div>

            <div>
              <span className="status-icon blue">
                {chooseComplete ? "✓" : "2"}
              </span>

              <div>
                <strong>
                  University Selection
                </strong>

                <small>
                  {chooseComplete
                    ? "Selection completed"
                    : "Choose your study path"}
                </small>
              </div>
            </div>

            <div>
              <span className="status-icon gray">
                {documentsComplete ? "✓" : "3"}
              </span>

              <div>
                <strong>
                  Documents
                </strong>

                <small>
                  {documentCount}/
                  {REQUIRED_DOCUMENTS.length} documents uploaded
                </small>
              </div>
            </div>

            <div>
              <span className="status-icon gray">
                4
              </span>

              <div>
                <strong>
                  Payment
                </strong>

                <small>
                  Coming Soon
                </small>
              </div>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={onStartApplication}
          >
            {chooseComplete
              ? "Review Application"
              : "Start Application"}
            <span>→</span>
          </button>
        </div>

        <div className="application-summary-card">
          <span className="eyebrow">
            APPLICATION SUMMARY
          </span>

          <h3>
            {applicationId || "Not started"}
          </h3>

          <div className="summary-row">
            <span>Field</span>
            <strong>
              {application?.field || "Not selected"}
            </strong>
          </div>

          <div className="summary-row">
            <span>Specialization</span>
            <strong>
              {application?.specialization ||
                "Not selected"}
            </strong>
          </div>

          <div className="summary-row">
            <span>University</span>
            <strong>
              {application?.university ||
                "Not selected"}
            </strong>
          </div>

          <button
            className="outline-button"
            onClick={onDocuments}
          >
            Manage Documents
          </button>
        </div>
      </section>

      <section
        className="universities-section"
        id="universities-section"
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">
              UNIVERSITY PARTNERS
            </span>

            <h2>
              Explore your options
            </h2>
          </div>

          <button
            className="link-button"
            onClick={onStartApplication}
          >
            Start application →
          </button>
        </div>

        <div className="university-grid">
          {UNIVERSITIES.map((university, index) => (
            <div
              className="university-card"
              key={university}
            >
              <div className="university-number">
                0{index + 1}
              </div>

              <div className="university-logo">
                {university
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </div>

              <h3>{university}</h3>

              <p>
                Explore programs and application options.
              </p>

              <button
                onClick={onStartApplication}
              >
                View & Apply →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section">
        <div className="section-title centered-title">
          <span className="eyebrow">
            HOW IT WORKS
          </span>

          <h2>
            Your journey in four simple stages
          </h2>
        </div>

        <div className="how-grid">
          <div>
            <span>01</span>
            <h3>Register</h3>
            <p>
              Create your secure student account.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>Choose</h3>
            <p>
              Select your field, specialization and university.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>Documents</h3>
            <p>
              Upload your required application documents.
            </p>
          </div>

          <div>
            <span>04</span>
            <h3>Payment</h3>
            <p>
              Application fee payment gateway coming soon.
            </p>
          </div>
        </div>
      </section>

      <section className="support-cta">
        <div>
          <span className="eyebrow">
            NEED HELP?
          </span>

          <h2>
            We are here for your journey.
          </h2>

          <p>
            If you have a question about your application,
            contact MIDOYOL support.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onSupport}
        >
          Contact Support
        </button>
      </section>
    </div>
  );
}

/* =========================================================
   PROGRESS TRACKER
========================================================= */

function ProgressTracker({
  currentStage,
  documentsComplete,
  chooseComplete,
}) {
  const stages = [
    {
      number: 1,
      title: "Registration",
      text: "Account",
    },
    {
      number: 2,
      title: "Choose",
      text: "University",
    },
    {
      number: 3,
      title: "Documents",
      text: "Upload",
    },
    {
      number: 4,
      title: "Payment",
      text: "Coming Soon",
    },
  ];

  return (
    <div className="progress-card">
      <div className="progress-header">
        <div>
          <span className="eyebrow">
            APPLICATION PROGRESS
          </span>

          <h2>
            Track your journey
          </h2>
        </div>

        <span className="progress-stage-label">
          Stage {currentStage} of 4
        </span>
      </div>

      <div className="progress-track">
        {stages.map((stage, index) => {
          const complete =
            stage.number < currentStage ||
            (stage.number === 2 &&
              chooseComplete) ||
            (stage.number === 3 &&
              documentsComplete);

          const active =
            stage.number === currentStage &&
            !complete;

          return (
            <React.Fragment key={stage.number}>
              <div
                className={`progress-step ${
                  complete ? "complete" : ""
                } ${active ? "active" : ""}`}
              >
                <div className="progress-circle">
                  {complete ? "✓" : stage.number}
                </div>

                <div className="progress-step-text">
                  <strong>{stage.title}</strong>
                  <small>{stage.text}</small>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`progress-line ${
                    stage.number < currentStage
                      ? "complete"
                      : ""
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   APPLICATION PAGE
========================================================= */

function ApplicationPage({
  application,
  applicationId,
  saving,
  onSave,
  onDocuments,
}) {
  const [selectedField, setSelectedField] = useState(
    application?.field || ""
  );

  const [selectedMajor, setSelectedMajor] = useState(
    application?.specialization || ""
  );

  const [selectedUniversity, setSelectedUniversity] =
    useState(application?.university || "");

  const [openField, setOpenField] = useState(false);
  const [openMajor, setOpenMajor] = useState(false);
  const [openUniversity, setOpenUniversity] =
    useState(false);

  useEffect(() => {
    setSelectedField(application?.field || "");
    setSelectedMajor(application?.specialization || "");
    setSelectedUniversity(application?.university || "");
  }, [application]);

  useEffect(() => {
    if (!applicationId) return;

    const timer = setTimeout(() => {
      onSave({
        field: selectedField,
        specialization: selectedMajor,
        university: selectedUniversity,
        stage:
          selectedField &&
          selectedMajor &&
          selectedUniversity
            ? "documents"
            : "choose",
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [
    selectedField,
    selectedMajor,
    selectedUniversity,
  ]);

  const majors = selectedField
    ? STUDY_FIELDS[selectedField] || []
    : [];

  const ready =
    selectedField &&
    selectedMajor &&
    selectedUniversity;

  const chooseField = (field) => {
    setSelectedField(field);
    setSelectedMajor("");
    setSelectedUniversity("");
    setOpenField(false);
  };

  const chooseMajor = (major) => {
    setSelectedMajor(major);
    setSelectedUniversity("");
    setOpenMajor(false);
  };

  const chooseUniversity = (university) => {
    setSelectedUniversity(university);
    setOpenUniversity(false);
  };

  return (
    <div className="inner-page">
      <section className="inner-page-header">
        <div>
          <span className="eyebrow">
            STEP 02 · CHOOSE
          </span>

          <h1>
            Build your university path.
          </h1>

          <p>
            Choose your field, specialization and preferred
            university.
          </p>
        </div>

        <div className="save-status">
          <span className={saving ? "saving-dot" : ""}>
            ●
          </span>

          {saving
            ? "Saving..."
            : "Your progress is saved"}
        </div>
      </section>

      <ProgressTracker
        currentStage={ready ? 2 : 2}
        chooseComplete={Boolean(ready)}
        documentsComplete={false}
      />

      <section className="application-layout">
        <div className="application-form-card">
          <div className="form-card-heading">
            <span className="step-number">01</span>

            <div>
              <span className="eyebrow">
                STUDY PATH
              </span>

              <h2>
                Choose your field
              </h2>

              <p>
                Start by selecting the area you want to study.
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              className={`custom-select ${
                openField ? "opened" : ""
              }`}
              onClick={() => {
                setOpenField(!openField);
                setOpenMajor(false);
                setOpenUniversity(false);
              }}
            >
              <span>
                {selectedField ||
                  "Select your field"}
              </span>

              <span>⌄</span>
            </button>

            {openField && (
              <div className="select-menu">
                {Object.keys(STUDY_FIELDS).map(
                  (field) => (
                    <button
                      key={field}
                      onClick={() =>
                        chooseField(field)
                      }
                    >
                      <span>
                        {field}
                      </span>

                      <small>
                        {STUDY_FIELDS[field].length} programs
                      </small>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="form-card-heading second">
            <span className="step-number">02</span>

            <div>
              <span className="eyebrow">
                SPECIALIZATION
              </span>

              <h2>
                Choose your specialization
              </h2>

              <p>
                Select the program that matches your goals.
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              className={`custom-select ${
                !selectedField ? "disabled" : ""
              } ${openMajor ? "opened" : ""}`}
              disabled={!selectedField}
              onClick={() => {
                setOpenMajor(!openMajor);
                setOpenField(false);
                setOpenUniversity(false);
              }}
            >
              <span>
                {selectedMajor ||
                  (selectedField
                    ? "Select specialization"
                    : "Select a field first")}
              </span>

              <span>⌄</span>
            </button>

            {openMajor && selectedField && (
              <div className="select-menu">
                {majors.map((major) => (
                  <button
                    key={major}
                    onClick={() =>
                      chooseMajor(major)
                    }
                  >
                    <span>{major}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-card-heading second">
            <span className="step-number">03</span>

            <div>
              <span className="eyebrow">
                UNIVERSITY
              </span>

              <h2>
                Choose your university
              </h2>

              <p>
                Select where you would like to apply.
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              className={`custom-select ${
                !selectedMajor ? "disabled" : ""
              } ${openUniversity ? "opened" : ""}`}
             
