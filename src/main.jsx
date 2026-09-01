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
  where,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { auth, db, storage } from "./firebase";

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
    description:
      "Upload a clear copy of your passport or national ID.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "diploma",
    title: "High School Diploma",
    description:
      "Upload your high school diploma or graduation certificate.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "transcript",
    title: "Academic Transcript",
    description:
      "Upload your latest academic transcript.",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "photo",
    title: "Personal Photo",
    description:
      "Upload a recent passport-style photo.",
    accept: ".jpg,.jpeg,.png",
  },
];

function generateApplicationId() {
  const year = new Date().getFullYear();
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `MIDO-${year}-${randomPart}`;
}

function formatDate(value) {
  if (!value) return "—";

  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [page, setPage] = useState("home");

  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [paymentHistoryOpen, setPaymentHistoryOpen] =
    useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("midoyol-dark-mode") === "true";
  });

  const [applicationId, setApplicationId] = useState(null);
  const [application, setApplication] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "midoyol-dark-mode",
      darkMode ? "true" : "false"
    );
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setAuthChecking(false);

        if (!currentUser) {
          setUser(null);
          setApplicationId(null);
          setApplication(null);
          setDocuments([]);
          setPayments([]);
          setNotifications([]);
          setPage("home");
          return;
        }

        setUser(currentUser);

        await loadStudentData(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  async function loadStudentData(currentUser) {
    try {
      const uid = currentUser.uid;

      const studentRef = doc(db, "students", uid);
      const studentSnap = await getDoc(studentRef);

      let studentData;

      if (studentSnap.exists()) {
        studentData = studentSnap.data();
      } else {
        studentData = {
          uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || "",
          createdAt: serverTimestamp(),
        };

        await setDoc(studentRef, studentData, {
          merge: true,
        });
      }

      const currentApplicationId =
        studentData?.currentApplicationId || null;

      if (currentApplicationId) {
        setApplicationId(currentApplicationId);

        await loadApplication(uid, currentApplicationId);
        await loadDocuments(uid, currentApplicationId);
        await loadPayments(uid);
      } else {
        setApplicationId(null);
        setApplication(null);
        setDocuments([]);
        await loadPayments(uid);
      }

      await loadNotifications(uid);

      if (currentUser.emailVerified) {
        setPage("dashboard");
      } else {
        setPage("verify");
      }
    } catch (error) {
      console.error("Failed to load student data:", error);
    }
  }

  async function loadApplication(uid, id) {
    try {
      const applicationRef = doc(
        db,
        "applications",
        id
      );

      const applicationSnap = await getDoc(applicationRef);

      if (applicationSnap.exists()) {
        setApplication({
          id: applicationSnap.id,
          ...applicationSnap.data(),
        });
      } else {
        setApplication(null);
      }
    } catch (error) {
      console.error("Failed to load application:", error);
    }
  }

  async function loadDocuments(uid, id) {
    try {
      const documentsRef = collection(
        db,
        "applications",
        id,
        "documents"
      );

      const snapshot = await getDocs(documentsRef);

      const loadedDocuments = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setDocuments(loadedDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    }
  }

  async function loadPayments(uid) {
    try {
      const paymentsRef = collection(db, "payments");

      const q = query(
        paymentsRef,
        where("studentId", "==", uid)
      );

      const snapshot = await getDocs(q);

      const loadedPayments = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort((a, b) => {
          const aDate =
            typeof a.createdAt?.toDate === "function"
              ? a.createdAt.toDate().getTime()
              : 0;

          const bDate =
            typeof b.createdAt?.toDate === "function"
              ? b.createdAt.toDate().getTime()
              : 0;

          return bDate - aDate;
        });

      setPayments(loadedPayments);
    } catch (error) {
      console.error("Failed to load payments:", error);
      setPayments([]);
    }
  }

  async function loadNotifications(uid) {
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

      const loadedNotifications = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      setNotifications(loadedNotifications);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
    }
  }

  async function createNotification(title, message) {
    if (!user) return;

    try {
      const notificationsRef = collection(
        db,
        "users",
        user.uid,
        "notifications"
      );

      await addDoc(notificationsRef, {
        uid: user.uid,
        title,
        message,
        read: false,
        createdAt: serverTimestamp(),
      });

      await loadNotifications(user.uid);
    } catch (error) {
      console.error(
        "Failed to create notification:",
        error
      );
    }
  }

  async function markNotificationRead(notificationId) {
    if (!user) return;

    try {
      const notificationRef = doc(
        db,
        "users",
        user.uid,
        "notifications",
        notificationId
      );

      await setDoc(
        notificationRef,
        {
          read: true,
        },
        {
          merge: true,
        }
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, read: true }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification read:",
        error
      );
    }
  }

  async function ensureApplication() {
    if (!user) return null;

    if (applicationId && application) {
      return applicationId;
    }

    try {
      const studentRef = doc(
        db,
        "students",
        user.uid
      );

      const studentSnap = await getDoc(studentRef);

      const studentData = studentSnap.exists()
        ? studentSnap.data()
        : {};

      if (studentData.currentApplicationId) {
        const existingId =
          studentData.currentApplicationId;

        setApplicationId(existingId);

        await loadApplication(user.uid, existingId);
        await loadDocuments(user.uid, existingId);

        return existingId;
      }

      const newApplicationId =
        generateApplicationId();

      const applicationData = {
        applicationNumber: newApplicationId,
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
        doc(
          db,
          "applications",
          newApplicationId
        ),
        applicationData
      );

      await setDoc(
        studentRef,
        {
          uid: user.uid,
          email: user.email || "",
          currentApplicationId:
            newApplicationId,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setApplicationId(newApplicationId);

      setApplication({
        id: newApplicationId,
        ...applicationData,
      });

      setDocuments([]);

      await createNotification(
        "Application created",
        `Your application ${newApplicationId} is ready to complete.`
      );

      return newApplicationId;
    } catch (error) {
      console.error(
        "Failed to create application:",
        error
      );

      alert(
        error?.message ||
          "Could not create your application."
      );

      return null;
    }
  }

  async function saveApplication(updates) {
    if (!user || !applicationId) return;

    setSaving(true);

    try {
      const applicationRef = doc(
        db,
        "applications",
        applicationId
      );

      await setDoc(
        applicationRef,
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setApplication((current) => ({
        ...(current || {}),
        ...updates,
      }));
    } catch (error) {
      console.error(
        "Failed to save application:",
        error
      );

      alert(
        error?.message ||
          "Could not save your application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(documentType, file) {
    if (!user || !applicationId || !file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );
      return;
    }

    try {
      setSaving(true);

      const fileRef = ref(
        storage,
        `students/${user.uid}/applications/${applicationId}/${documentType}/${file.name}`
      );

      await uploadBytes(fileRef, file, {
        contentType: file.type,
      });

      const downloadURL =
        await getDownloadURL(fileRef);

      const documentRef = doc(
        db,
        "applications",
        applicationId,
        "documents",
        documentType
      );

      await setDoc(
        documentRef,
        {
          documentType,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          downloadURL,
          storagePath: fileRef.fullPath,
          status: "uploaded",
          uploadedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await loadDocuments(
        user.uid,
        applicationId
      );

      const documentsSnapshot = await getDocs(
        collection(
          db,
          "applications",
          applicationId,
          "documents"
        )
      );

      const uploadedIds =
        documentsSnapshot.docs
          .filter(
            (item) =>
              item.data()?.status === "uploaded"
          )
          .map((item) => item.id);

      const complete =
        REQUIRED_DOCUMENTS.every((item) =>
          uploadedIds.includes(item.id)
        );

      await setDoc(
        doc(
          db,
          "applications",
          applicationId
        ),
        {
          documentsComplete: complete,
          stage: complete ? "payment" : "documents",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setApplication((current) => ({
        ...(current || {}),
        documentsComplete: complete,
        stage: complete
          ? "payment"
          : "documents",
      }));

      await createNotification(
        "Document uploaded",
        `${file.name} has been uploaded successfully.`
      );
    } catch (error) {
      console.error(
        "Failed to upload document:",
        error
      );

      alert(
        error?.message ||
          "Could not upload the document."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument(documentItem) {
    if (!user || !applicationId || !documentItem)
      return;

    try {
      setSaving(true);

      if (documentItem.storagePath) {
        try {
          const fileRef = ref(
            storage,
            documentItem.storagePath
          );

          await deleteObject(fileRef);
        } catch (storageError) {
          console.warn(
            "Storage file could not be deleted:",
            storageError
          );
        }
      }

      const documentRef = doc(
        db,
        "applications",
        applicationId,
        "documents",
        documentItem.id
      );

      await setDoc(
        documentRef,
        {
          status: "missing",
          fileName: "",
          fileSize: 0,
          downloadURL: "",
          storagePath: "",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await loadDocuments(
        user.uid,
        applicationId
      );

      await setDoc(
        doc(
          db,
          "applications",
          applicationId
        ),
        {
          documentsComplete: false,
          stage: "documents",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setApplication((current) => ({
        ...(current || {}),
        documentsComplete: false,
        stage: "documents",
      }));

      await createNotification(
        "Document removed",
        `${documentItem.title || documentItem.fileName || "Document"} was removed.`
      );
    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      );

      alert(
        error?.message ||
          "Could not delete the document."
      );
    } finally {
      setSaving(false);
    }
  }

  async function createPaymentRequest() {
    if (!user || !applicationId) return;

    const existingPending = payments.find(
      (payment) =>
        payment.applicationId === applicationId &&
        payment.status === "pending"
    );

    if (existingPending) {
      alert(
        "You already have a pending payment request for this application."
      );
      return;
    }

    try {
      setSaving(true);

      const paymentsRef = collection(
        db,
        "payments"
      );

      await addDoc(paymentsRef, {
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
        "Payment request created",
        "Your $1 application fee request is recorded. Online payment is coming soon."
      );

      alert(
        "Your payment request has been recorded. Online payment is coming soon."
      );
    } catch (error) {
      console.error(
        "Failed to create payment request:",
        error
      );

      alert(
        error?.message ||
          "Could not create payment request."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRegister(formData) {
    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.dateOfBirth ||
        !formData.country ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        alert("Please complete all required fields.");
        return;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        alert("Passwords do not match.");
        return;
      }

      if (formData.password.length < 6) {
        alert(
          "Password must be at least 6 characters."
        );
        return;
      }

      if (!formData.acceptedTerms) {
        alert(
          "Please accept the terms and conditions."
        );
        return;
      }

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

      await updateProfile(credential.user, {
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      });

      await setDoc(
        doc(db, "students", credential.user.uid),
        {
          uid: credential.user.uid,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          dateOfBirth: formData.dateOfBirth,
          country: formData.country,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await sendEmailVerification(
        credential.user
      );

      setShowAuth(false);
      setIsRegister(false);
      setPage("verify");

      alert(
        "Account created. Please verify your email."
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        error?.message ||
          "Could not create your account."
      );
    }
  }

  async function handleLogin(email, password) {
    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await reload(credential.user);

      setShowAuth(false);

      if (credential.user.emailVerified) {
        await loadStudentData(credential.user);
        setPage("dashboard");
      } else {
        setPage("verify");
      }
    } catch (error) {
      console.error("Login error:", error);

      alert(
        error?.message ||
          "Could not sign in."
      );
    }
  }

  async function handleResetPassword(email) {
    if (!email?.trim()) {
      alert("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      alert(
        "Password reset email sent. Check your inbox."
      );
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      alert(
        error?.message ||
          "Could not send password reset email."
      );
    }
  }

  async function resendVerification() {
    if (!auth.currentUser) return;

    try {
      await sendEmailVerification(
        auth.currentUser
      );

      alert(
        "Verification email sent again."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      alert(
        error?.message ||
          "Could not resend verification email."
      );
    }
  }

  async function checkEmailVerification() {
    if (!auth.currentUser) return;

    try {
      await reload(auth.currentUser);

      const refreshedUser = auth.currentUser;

      setUser({
        ...refreshedUser,
      });

      if (refreshedUser.emailVerified) {
        await loadStudentData(refreshedUser);
        setPage("dashboard");
      } else {
        alert(
          "Your email is not verified yet."
        );
      }
    } catch (error) {
      console.error(
        "Verification check error:",
        error
      );
    }
  }

  async function logout() {
    try {
      await signOut(auth);

      setMobileMenuOpen(false);
      setNotificationOpen(false);
      setPaymentHistoryOpen(false);
      setSupportOpen(false);
      setReceiptPayment(null);
      setShowAuth(false);
      setPage("home");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  async function startApplication() {
    if (!user) {
      setIsRegister(true);
      setShowAuth(true);
      return;
    }

    if (!user.emailVerified) {
      setPage("verify");
      return;
    }

    const id = await ensureApplication();

    if (id) {
      setPage("application");
    }
  }

  async function goToDocuments() {
    if (!user) {
      setIsRegister(true);
      setShowAuth(true);
      return;
    }

    const id = await ensureApplication();

    if (id) {
      await loadDocuments(user.uid, id);
      setPage("documents");
    }
  }

  async function goToPayment() {
    if (!user) return;

    const id = await ensureApplication();

    if (id) {
      await loadPayments(user.uid);
      setPage("payment");
    }
  }

  function openProgress() {
    setMobileMenuOpen(false);
    setPage("dashboard");

    setTimeout(() => {
      document
        .getElementById("progress-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function openPayments() {
    setMobileMenuOpen(false);
    setPaymentHistoryOpen(true);
  }

  function openSupport() {
    setMobileMenuOpen(false);
    setSupportOpen(true);
  }

  const documentCount = useMemo(() => {
    return documents.filter(
      (item) => item.status === "uploaded"
    ).length;
  }, [documents]);

  const chooseComplete = Boolean(
    application?.field &&
      application?.specialization &&
      application?.university
  );

  const documentsComplete =
    documentCount >=
    REQUIRED_DOCUMENTS.length;

  const progressStage = useMemo(() => {
    if (!user?.emailVerified) return 1;

    if (!chooseComplete) return 2;

    if (!documentsComplete) return 3;

    return 4;
  }, [
    user,
    chooseComplete,
    documentsComplete,
  ]);

  if (authChecking) {
    return <LoadingScreen />;
  }

  if (page === "verify" && user) {
    return (
      <VerificationScreen
        user={user}
        onCheck={checkEmailVerification}
        onResend={resendVerification}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="app-shell">
      {user && user.emailVerified && (
        <Navbar
          user={user}
          darkMode={darkMode}
          onToggleDark={() =>
            setDarkMode((current) => !current)
          }
          onHome={() => setPage("dashboard")}
          onStartApplication={startApplication}
          onProgress={openProgress}
          onPayments={openPayments}
          onSupport={openSupport}
          onLogout={logout}
          notificationOpen={notificationOpen}
          setNotificationOpen={
            setNotificationOpen
          }
          notifications={notifications}
          onMarkNotificationRead={
            markNotificationRead
          }
          onOpenMobile={() =>
            setMobileMenuOpen(true)
          }
        />
      )}

      {page === "home" && !user && (
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
      )}

      {page === "dashboard" &&
        user &&
        user.emailVerified && (
          <DashboardPage
            user={user}
            application={application}
            applicationId={applicationId}
            documents={documents}
            payments={payments}
            progressStage={progressStage}
            documentCount={documentCount}
            onStartApplication={
              startApplication
            }
            onDocuments={goToDocuments}
            onPayment={goToPayment}
            onSupport={openSupport}
          />
        )}

      {page === "application" &&
        user &&
        user.emailVerified && (
          <ApplicationPage
            application={application}
            applicationId={applicationId}
            saving={saving}
            onSave={saveApplication}
            onDocuments={goToDocuments}
            progressStage={progressStage}
          />
        )}

      {page === "documents" &&
        user &&
        user.emailVerified && (
          <DocumentsPage
            application={application}
            applicationId={applicationId}
            documents={documents}
            documentCount={documentCount}
            saving={saving}
            progressStage={progressStage}
            onUpload={uploadDocument}
            onDelete={deleteDocument}
            onPayment={goToPayment}
            onBack={() =>
              setPage("application")
            }
          />
        )}

      {page === "payment" &&
        user &&
        user.emailVerified && (
          <PaymentPage
            user={user}
            application={application}
            applicationId={applicationId}
            payments={payments}
            saving={saving}
            progressStage={progressStage}
            onCreatePayment={
              createPaymentRequest
            }
            onBack={() =>
              setPage("documents")
            }
            onReceipt={setReceiptPayment}
          />
        )}

      {user && user.emailVerified && (
        <Footer onSupport={openSupport} />
      )}

      {!user && page === "home" && (
        <Footer
          onSupport={() => {
            setIsRegister(false);
            setShowAuth(true);
          }}
        />
      )}

      {mobileMenuOpen && user && (
        <MobileMenu
          user={user}
          darkMode={darkMode}
          onToggleDark={() =>
            setDarkMode((current) => !current)
          }
          onProgress={openProgress}
          onPayments={openPayments}
          onSupport={openSupport}
          onLogout={logout}
          onClose={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {showAuth && (
        <AuthModal
          isRegister={isRegister}
          onClose={() =>
            setShowAuth(false)
          }
          onSwitch={() =>
            setIsRegister((current) => !current)
          }
          onLogin={handleLogin}
          onRegister={handleRegister}
          onResetPassword={
            handleResetPassword
          }
        />
      )}

      {paymentHistoryOpen && (
        <PaymentHistoryModal
          payments={payments}
          applicationId={applicationId}
          onClose={() =>
            setPaymentHistoryOpen(false)
          }
          onReceipt={setReceiptPayment}
          onPayment={() => {
            setPaymentHistoryOpen(false);
            goToPayment();
          }}
        />
      )}

      {receiptPayment && (
        <ReceiptModal
          payment={receiptPayment}
          user={user}
          applicationId={applicationId}
          onClose={() =>
            setReceiptPayment(null)
          }
        />
      )}

      {supportOpen && (
        <SupportModal
          user={user}
          onClose={() =>
            setSupportOpen(false)
          }
          onSubmit={async (
            subject,
            message
          ) => {
            if (!user) return;

            try {
              await addDoc(
                collection(
                  db,
                  "supportTickets"
                ),
                {
                  studentId: user.uid,
                  email:
                    user.email || "",
                  subject,
                  message,
                  status: "open",
                  createdAt:
                    serverTimestamp(),
                }
              );

              await createNotification(
                "Support request sent",
                "Your support request has been received."
              );

              setSupportOpen(false);

              alert(
                "Your support request has been sent."
              );
            } catch (error) {
              console.error(
                "Support error:",
                error
              );

              alert(
                error?.message ||
                  "Could not send your support request."
              );
            }
          }}
        />
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">M</div>
      <div className="loading-spinner" />
      <p>Loading MIDOYOL...</p>
    </div>
  );
}

function LandingPage({
  onLogin,
  onRegister,
  onStart,
}) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="brand-box">
          <span>MIDOYOL</span>
        </div>

        <div className="landing-auth-buttons">
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

      <section className="hero-section">
        <div className="hero-content">
          <div className="eyebrow">
            YOUR UNIVERSITY JOURNEY
          </div>

          <h1>
            Your Journey to University
            <span> Starts Here.</span>
          </h1>

          <p>
            MIDOYOL makes your university
            application journey simple,
            organized, and easy to track.
          </p>

          <div className="hero-price">
            <strong>$1</strong>
            <span>application fee</span>
          </div>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={onStart}
            >
              Start Your Application
            </button>

            <button
              className="secondary-button"
              onClick={onRegister}
            >
              Create Account
            </button>
          </div>

          <div className="hero-trust">
            <span>✓ Simple application</span>
            <span>✓ Secure documents</span>
            <span>✓ Track your progress</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="globe-container">
            <div className="globe">
              <div className="globe-line horizontal" />
              <div className="globe-line vertical" />
              <div className="globe-shape" />
            </div>

            <div className="globe-flag flag-turkey">
              🇹🇷
            </div>

            <div className="globe-flag flag-sudan">
              🇸🇩
            </div>

            <div className="globe-flag flag-uk">
              🇬🇧
            </div>

            <div className="globe-flag flag-germany">
              🇩🇪
            </div>

            <div className="globe-flag flag-brazil">
              🇧🇷
            </div>

            <div className="globe-flag flag-saudi">
              🇸🇦
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span>WHY MIDOYOL</span>
          <h2>Everything in one place.</h2>
          <p>
            From your first application step
            to document preparation and
            progress tracking.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            number="01"
            icon="🎓"
            title="Choose"
            text="Choose your field, specialization, and university."
          />

          <FeatureCard
            number="02"
            icon="📄"
            title="Prepare"
            text="Upload and organize the documents required for your application."
          />

          <FeatureCard
            number="03"
            icon="📊"
            title="Track"
            text="Follow your application progress from one simple dashboard."
          />
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Four simple stages.</h2>
        </div>

        <div className="how-grid">
          <HowCard
            number="01"
            title="Registration"
            text="Create your MIDOYOL student account."
          />

          <HowCard
            number="02"
            title="Choose"
            text="Select your study field, major, and university."
          />

          <HowCard
            number="03"
            title="Documents"
            text="Upload the documents required for your application."
          />

          <HowCard
            number="04"
            title="Payment"
            text="Application payment will be available soon."
          />
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span>READY TO START?</span>
          <h2>
            Your university journey
            starts with one step.
          </h2>
        </div>

        <button
          className="primary-button"
          onClick={onStart}
        >
          Start Your Application
        </button>
      </section>
    </main>
  );
}

function FeatureCard({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className="feature-card">
      <div className="feature-top">
        <span className="feature-number">
          {number}
        </span>

        <span className="feature-icon">
          {icon}
        </span>
      </div>

      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function HowCard({
  number,
  title,
  text,
}) {
  return (
    <div className="how-card">
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function VerificationScreen({
  user,
  onCheck,
  onResend,
  onLogout,
}) {
  return (
    <div className="verification-page">
      <div className="verification-card">
        <div className="verification-logo">
          MIDOYOL
        </div>

        <div className="verification-icon">
          ✉
        </div>

        <h1>Verify your email</h1>

        <p>
          We sent a verification email to:
        </p>

        <strong>{user?.email}</strong>

        <p className="verification-help">
          Open your email and click the
          verification link, then come back
          here.
        </p>

        <button
          className="primary-button full"
          onClick={onCheck}
        >
          I've Verified My Email
        </button>

        <button
          className="secondary-button full"
          onClick={onResend}
        >
          Resend Verification Email
        </button>

        <button
          className="text-button"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Navbar({
  user,
  darkMode,
  onToggleDark,
  onHome,
  onStartApplication,
  onProgress,
  onPayments,
  onSupport,
  onLogout,
  notificationOpen,
  setNotificationOpen,
  notifications,
  onMarkNotificationRead,
  onOpenMobile,
}) {
  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <header className="main-navbar">
      <button
        className="navbar-brand"
        onClick={onHome}
      >
        <span>MIDOYOL</span>
      </button>

      <nav className="desktop-nav-links">
        <button onClick={onHome}>
          Home
        </button>

        <button
          onClick={() => {
            document
              .getElementById(
                "universities-section"
              )
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          Universities
        </button>

        <button
          onClick={() => {
            document
              .getElementById(
                "study-section"
              )
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          Study
        </button>
      </nav>

      <div className="nav-right">
        <div className="notification-wrapper">
          <button
            className="icon-button"
            onClick={() =>
              setNotificationOpen(
                (current) => !current
              )
            }
            aria-label="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <NotificationPanel
              notifications={notifications}
              onRead={
                onMarkNotificationRead
              }
              onClose={() =>
                setNotificationOpen(
                  false
                )
              }
            />
          )}
        </div>

        <button
          className="primary-button small"
          onClick={onStartApplication}
        >
          Start Application
        </button>

        <button
          className="hamburger-button"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function MobileMenu({
  user,
  darkMode,
  onToggleDark,
  onProgress,
  onPayments,
  onSupport,
  onLogout,
  onClose,
}) {
  return (
    <div className="mobile-menu-overlay">
      <aside className="mobile-menu">
        <div className="mobile-menu-header">
          <div className="brand-box">
            MIDOYOL
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-account">
          <div className="account-avatar">
            {(user?.displayName ||
              user?.email ||
              "S")[0].toUpperCase()}
          </div>

          <div>
            <strong>
              {user?.displayName ||
                "Student"}
            </strong>

            <span>{user?.email}</span>
          </div>
        </div>

        <div className="mobile-menu-items">
          <button
            onClick={onToggleDark}
            className="mobile-menu-item"
          >
            <span>🌙</span>

            <div>
              <strong>Dark Mode</strong>
              <small>
                {darkMode
                  ? "Enabled"
                  : "Disabled"}
              </small>
            </div>

            <span className="toggle-indicator">
              {darkMode ? "ON" : "OFF"}
            </span>
          </button>

          <button
            onClick={onProgress}
            className="mobile-menu-item"
          >
            <span>📊</span>

            <div>
              <strong>
                Application Progress
              </strong>

              <small>
                View your application
                progress
              </small>
            </div>
          </button>

          <button
            onClick={onPayments}
            className="mobile-menu-item"
          >
            <span>💳</span>

            <div>
              <strong>Payments</strong>

              <small>
                Payment history &
                receipts
              </small>
            </div>
          </button>

          <button
            onClick={onSupport}
            className="mobile-menu-item"
          >
            <span>💬</span>

            <div>
              <strong>
                Contact Support
              </strong>

              <small>
                Get help with your
                application
              </small>
            </div>
          </button>
        </div>

        <div className="mobile-menu-bottom">
          <button
            className="logout-button"
            onClick={onLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}

function NotificationPanel({
  notifications,
  onRead,
  onClose,
}) {
  return (
    <div className="notification-panel">
      <div className="notification-header">
        <div>
          <strong>Notifications</strong>
          <span>
            Your latest updates
          </span>
        </div>

        <button
          className="icon-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state small">
            <span>🔔</span>
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications
            .slice(0, 8)
            .map((item) => (
              <button
                key={item.id}
                className={`notification-item ${
                  item.read
                    ? ""
                    : "unread"
                }`}
                onClick={() =>
                  onRead(item.id)
                }
              >
                <span className="notification-dot" />

                <div>
                  <strong>
                    {item.title}
                  </strong>

                  <p>
                    {item.message}
                  </p>

                  <small>
                    {formatDateTime(
                      item.createdAt
                    )}
                  </small>
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );
}

function DashboardPage({
  user,
  application,
  applicationId,
  documents,
  payments,
  progressStage,
  documentCount,
  onStartApplication,
  onDocuments,
  onPayment,
  onSupport,
}) {
  const applicationReady =
    Boolean(applicationId);

  const chooseComplete = Boolean(
    application?.field &&
      application?.specialization &&
      application?.university
  );

  const paymentStatus =
    application?.paymentStatus ||
    "coming_soon";

  return (
    <main className="portal-page">
      <section className="welcome-section">
        <div>
          <span className="eyebrow">
            STUDENT PORTAL
          </span>

          <h1>
            Welcome back,{" "}
            {user?.displayName?.split(
              " "
            )[0] || "Student"}
            .
          </h1>

          <p>
            Manage your application and
            keep track of your progress
            from here.
          </p>
        </div>

        {applicationId && (
          <div className="application-id-badge">
            <span>APPLICATION ID</span>
            <strong>
              {applicationId}
            </strong>
          </div>
        )}
      </section>

      <section
        id="progress-section"
        className="dashboard-section"
      >
        <ProgressTracker
          currentStage={progressStage}
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-main-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">
                APPLICATION
              </span>

              <h2>
                Application Status
              </h2>
            </div>

            {application?.status && (
              <span
                className={`status-pill ${
                  application.status
                }`}
              >
                {application.status}
              </span>
            )}
          </div>

          <div className="status-list">
            <StatusRow
              number="01"
              title="Registration"
              status="Completed"
              complete
            />

            <StatusRow
              number="02"
              title="Choose"
              status={
                chooseComplete
                  ? "Completed"
                  : "In Progress"
              }
              complete={chooseComplete}
            />

            <StatusRow
              number="03"
              title="Documents"
              status={
                documentCount ===
                REQUIRED_DOCUMENTS.length
                  ? "Completed"
                  : `${documentCount}/${REQUIRED_DOCUMENTS.length} uploaded`
              }
              complete={
                documentCount ===
                REQUIRED_DOCUMENTS.length
              }
            />

            <StatusRow
              number="04"
              title="Payment"
              status="Coming Soon"
              complete={false}
              comingSoon
            />
          </div>

          {!applicationReady ? (
            <div className="card-action">
              <button
                className="primary-button"
                onClick={onStartApplication}
              >
                Start Application
              </button>
            </div>
          ) : progressStage === 2 ? (
            <div className="card-action">
              <button
                className="primary-button"
                onClick={onStartApplication}
              >
                Continue Application
              </button>
            </div>
          ) : progressStage === 3 ? (
            <div className="card-action">
              <button
                className="primary-button"
                onClick={onDocuments}
              >
                Continue to Documents
              </button>
            </div>
          ) : (
            <div className="card-action">
              <button
                className="primary-button"
                onClick={onPayment}
              >
                View Payment
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-side-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">
                SUMMARY
              </span>

              <h2>
                Your Application
              </h2>
            </div>
          </div>

          <div className="summary-list">
            <SummaryRow
              label="Field"
              value={
                application?.field ||
                "Not selected"
              }
            />

            <SummaryRow
              label="Specialization"
              value={
                application?.specialization ||
                "Not selected"
              }
            />

            <SummaryRow
              label="University"
              value={
                application?.university ||
                "Not selected"
              }
            />

            <SummaryRow
              label="Documents"
              value={`${documentCount}/${REQUIRED_DOCUMENTS.length}`}
            />

            <SummaryRow
              label="Payment"
              value="Coming Soon"
            />
          </div>
        </div>
      </section>

      <section
        id="universities-section"
        className="dashboard-section"
      >
        <div className="section-heading left">
          <span>UNIVERSITY PARTNERS</span>
          <h2>
            Explore your options.
          </h2>
        </div>

        <div className="university-grid">
          {UNIVERSITIES.map(
            (university) => (
              <div
                className="university-card"
                key={university}
              >
                <div className="university-logo">
                  {university
                    .split(" ")
                    .map((word) =>
                      word[0]
                    )
                    .join("")
                    .slice(0, 3)}
                </div>

                <h3>{university}</h3>

                <p>
                  Istanbul, Türkiye
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section
        id="study-section"
        className="dashboard-section"
      >
        <div className="section-heading left">
          <span>HOW IT WORKS</span>
          <h2>
            Your application journey.
          </h2>
        </div>

        <div className="how-grid portal">
          <HowCard
            number="01"
            title="Registration"
            text="Create your student account and verify your email."
          />

          <HowCard
            number="02"
            title="Choose"
            text="Select your field, specialization, and university."
          />

          <HowCard
            number="03"
            title="Documents"
            text="Upload all required application documents."
          />

          <HowCard
            number="04"
            title="Payment"
            text="Online payment will become available soon."
          />
        </div>
      </section>

      <section className="support-cta">
        <div>
          <span>NEED HELP?</span>
          <h2>
            We're here to help you.
          </h2>

          <p>
            Contact MIDOYOL support if you
            have a question about your
            application.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onSupport}
        >
          Contact Support
        </button>
      </section>
    </main>
  );
}

function StatusRow({
  number,
  title,
  status,
  complete,
  comingSoon,
}) {
  return (
    <div className="status-row">
      <div
        className={`status-number ${
          complete
            ? "complete"
            : comingSoon
            ? "coming-soon"
            : ""
        }`}
      >
        {complete ? "✓" : number}
      </div>

      <div className="status-content">
        <strong>{title}</strong>
        <span>{status}</span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProgressTracker({
  currentStage,
}) {
   const stages = [
    { number: 1, title: "Registration", short: "Register" },
    { number: 2, title: "Choose", short: "Choose" },
    { number: 3, title: "Documents", short: "Documents" },
    { number: 4, title: "Payment", short: "Payment" },
  ];

  return (
    <div className="progress-card">
      <div className="progress-card-header">
        <div>
          <span className="card-kicker">APPLICATION PROGRESS</span>
          <h2>Your journey</h2>
        </div>

        <span className="progress-stage-label">
          Step {currentStage} of 4
        </span>
      </div>

      <div className="progress-track">
        {stages.map((stage, index) => {
          const completed = stage.number < currentStage;
          const active = stage.number === currentStage;

          return (
            <React.Fragment key={stage.number}>
              <div
                className={`progress-step ${
                  completed ? "completed" : ""
                } ${active ? "active" : ""}`}
              >
                <div className="progress-circle">
                  {completed ? "✓" : stage.number}
                </div>

                <div className="progress-step-text">
                  <strong>{stage.title}</strong>

                  <span>
                    {stage.number === 4
                      ? "Coming Soon"
                      : active
                      ? "In Progress"
                      : completed
                      ? "Completed"
                      : "Next"}
                  </span>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`progress-line ${
                    stage.number < currentStage
                      ? "completed"
                      : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationPage({
  application,
  applicationId,
  saving,
  onSave,
  onDocuments,
  progressStage,
}) {
  const [selectedField, setSelectedField] = useState(
    application?.field || ""
  );

  const [selectedMajor, setSelectedMajor] = useState(
    application?.specialization || ""
  );

  const [selectedUniversity, setSelectedUniversity] = useState(
    application?.university || ""
  );

  const [openField, setOpenField] = useState(false);
  const [openMajor, setOpenMajor] = useState(false);
  const [openUniversity, setOpenUniversity] = useState(false);

  useEffect(() => {
    setSelectedField(application?.field || "");
    setSelectedMajor(application?.specialization || "");
    setSelectedUniversity(application?.university || "");
  }, [
    application?.field,
    application?.specialization,
    application?.university,
  ]);

  useEffect(() => {
    if (
      !selectedField ||
      !selectedMajor ||
      !selectedUniversity
    ) {
      return;
    }

    const timer = setTimeout(() => {
      onSave({
        field: selectedField,
        specialization: selectedMajor,
        university: selectedUniversity,
        stage: "documents",
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

  const ready = Boolean(
    selectedField &&
      selectedMajor &&
      selectedUniversity
  );

  function chooseField(value) {
    setSelectedField(value);
    setSelectedMajor("");
    setOpenField(false);
    setOpenMajor(false);
  }

  function chooseMajor(value) {
    setSelectedMajor(value);
    setOpenMajor(false);
  }

  function chooseUniversity(value) {
    setSelectedUniversity(value);
    setOpenUniversity(false);
  }

  return (
    <main className="portal-page application-page">
      <section className="application-header">
        <div>
          <span className="step-label">
            STEP 02 · CHOOSE
          </span>

          <h1>Build your university application</h1>

          <p>
            Choose your study field, specialization and
            preferred university.
          </p>
        </div>

        <div className="application-id-box">
          <span>Application ID</span>
          <strong>{applicationId || "—"}</strong>
        </div>
      </section>

      <section className="dashboard-section">
        <ProgressTracker currentStage={progressStage} />
      </section>

      <section className="application-card">
        <div className="application-card-header">
          <div>
            <span className="card-kicker">
              YOUR ACADEMIC CHOICES
            </span>

            <h2>Choose your program</h2>

            <p>
              You can change your choices before submitting
              your application.
            </p>
          </div>
        </div>

        <div className="application-form">
          <div className="form-group">
            <label className="form-label">
              Study Field
            </label>

            <div className="select-field">
              <button
                type="button"
                className="select-trigger"
                onClick={() => {
                  setOpenField(!openField);
                  setOpenMajor(false);
                  setOpenUniversity(false);
                }}
              >
                <span>
                  {selectedField || "Select a study field"}
                </span>

                <span>⌄</span>
              </button>

              {openField && (
                <div className="dropdown-menu">
                  {Object.keys(STUDY_FIELDS).map((field) => (
                    <button
                      type="button"
                      key={field}
                      onClick={() => chooseField(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="form-help">
              Select the academic field you want to study.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Specialization
            </label>

            <div className="select-field">
              <button
                type="button"
                className="select-trigger"
                disabled={!selectedField}
                onClick={() => {
                  if (!selectedField) return;

                  setOpenMajor(!openMajor);
                  setOpenField(false);
                  setOpenUniversity(false);
                }}
              >
                <span>
                  {selectedMajor ||
                    (selectedField
                      ? "Select a specialization"
                      : "Choose a study field first")}
                </span>

                <span>⌄</span>
              </button>

              {openMajor && selectedField && (
                <div className="dropdown-menu">
                  {majors.map((major) => (
                    <button
                      type="button"
                      key={major}
                      onClick={() => chooseMajor(major)}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="form-help">
              Choose the program you want to apply for.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Preferred University
            </label>

            <div className="select-field">
              <button
                type="button"
                className="select-trigger"
                onClick={() => {
                  setOpenUniversity(!openUniversity);
                  setOpenField(false);
                  setOpenMajor(false);
                }}
              >
                <span>
                  {selectedUniversity ||
                    "Select a university"}
                </span>

                <span>⌄</span>
              </button>

              {openUniversity && (
                <div className="dropdown-menu">
                  {UNIVERSITIES.map((university) => (
                    <button
                      type="button"
                      key={university}
                      onClick={() =>
                        chooseUniversity(university)
                      }
                    >
                      {university}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="form-help">
              Select your preferred university in Türkiye.
            </span>
          </div>
        </div>

        <div className="application-footer">
          <div className="save-status">
            {saving ? "Saving..." : "Auto Saved"}
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={!ready}
            onClick={onDocuments}
          >
            Continue to Documents
            <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}

function DocumentsPage({
  application,
  applicationId,
  documents,
  documentCount,
  saving,
  progressStage,
  onUpload,
  onDelete,
  onPayment,
  onBack,
}) {
  const allComplete =
    documentCount === REQUIRED_DOCUMENTS.length;

  const documentMap = Object.fromEntries(
    documents.map((item) => [item.id, item])
  );

  return (
    <main className="portal-page documents-page">
      <section className="application-header">
        <div>
          <span className="step-label">
            STEP 03 · DOCUMENTS
          </span>

          <h1>Prepare your documents</h1>

          <p>
            Upload the documents required for your
            application.
          </p>
        </div>

        <div className="application-id-box">
          <span>Application ID</span>
          <strong>{applicationId || "—"}</strong>
        </div>
      </section>

      <section className="dashboard-section">
        <ProgressTracker
          currentStage={allComplete ? 4 : progressStage}
        />
      </section>

      <section className="documents-card">
        <div className="documents-card-header">
          <div>
            <span className="card-kicker">
              REQUIRED DOCUMENTS
            </span>

            <h2>Upload your files</h2>

            <p>
              Accepted formats: PDF, JPG and PNG. Maximum
              size: 10 MB per file.
            </p>
          </div>

          <div className="documents-count">
            <strong>
              {documentCount}/{REQUIRED_DOCUMENTS.length}
            </strong>

            <span>Uploaded</span>
          </div>
        </div>

        <div className="documents-list">
          {REQUIRED_DOCUMENTS.map((item) => {
            const uploaded = documentMap[item.id];
            const isUploaded =
              uploaded?.status === "uploaded";

            return (
              <div
                className={`document-item ${
                  isUploaded ? "uploaded" : ""
                }`}
                key={item.id}
              >
                <div className="document-icon">
                  {isUploaded ? "✓" : "↑"}
                </div>

                <div className="document-info">
                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  {isUploaded && (
                    <div className="document-meta">
                      <span>
                        {uploaded.fileName || "Uploaded file"}
                      </span>

                      <span>
                        {formatDate(uploaded.uploadedAt)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="document-actions">
                  {isUploaded &&
                    uploaded.downloadURL && (
                      <a
                        href={uploaded.downloadURL}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                      >
                        View
                      </a>
                    )}

                  {isUploaded ? (
                    <button
                      type="button"
                      className="danger-button"
                      disabled={saving}
                      onClick={() =>
                        onDelete(
                          item.id,
                          uploaded.storagePath
                        )
                      }
                    >
                      Delete
                    </button>
                  ) : (
                    <label className="upload-button">
                      Upload

                      <input
                        type="file"
                        accept={item.accept}
                        disabled={saving}
                        onChange={(event) => {
                          const file =
                            event.target.files?.[0];

                          if (file) {
                            onUpload(item.id, file);
                          }

                          event.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="documents-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Application
          </button>

          {allComplete ? (
            <button
              type="button"
              className="primary-button"
              onClick={onPayment}
            >
              Continue to Payment
              <span>→</span>
            </button>
          ) : (
            <div className="documents-note">
              Upload all required documents to continue.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PaymentPage({
  user,
  application,
  applicationId,
  payments,
  saving,
  onCreatePayment,
  onBack,
  onReceipt,
}) {
  const applicationPayments = payments.filter(
    (payment) =>
      payment.applicationId === applicationId
  );

  const pendingPayment = applicationPayments.find(
    (payment) => payment.status === "pending"
  );

  return (
    <main className="portal-page payment-page">
      <section className="application-header">
        <div>
          <span className="step-label">
            STEP 04 · PAYMENT
          </span>

          <h1>Application fee</h1>

          <p>
            Complete the final step when online payment
            becomes available.
          </p>
        </div>

        <div className="application-id-box">
          <span>Application ID</span>
          <strong>{applicationId || "—"}</strong>
        </div>
      </section>

      <section className="dashboard-section">
        <ProgressTracker currentStage={4} />
      </section>

      <section className="payment-card">
        <div className="payment-icon">$</div>

        <span className="card-kicker">
          MIDOYOL APPLICATION FEE
        </span>

        <h2>$1 USD</h2>

        <p className="payment-description">
          The MIDOYOL application fee is currently
          <strong> $1 USD</strong>.
        </p>

        <div className="coming-soon-box">
          <span className="coming-soon-badge">
            COMING SOON
          </span>

          <h3>Online payment is not active yet.</h3>

          <p>
            We are preparing the secure payment gateway.
            You will be able to pay online once it is
            available.
          </p>
        </div>

        {pendingPayment && (
          <div className="pending-payment-box">
            <strong>Payment request created</strong>

            <span>
              Status:{" "}
              {pendingPayment.status || "pending"}
            </span>

            <small>
              {formatDateTime(
                pendingPayment.createdAt
              )}
            </small>
          </div>
        )}

        <div className="payment-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Documents
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={saving || Boolean(pendingPayment)}
            onClick={onCreatePayment}
          >
            {pendingPayment
              ? "Request Pending"
              : "Create Payment Request"}
          </button>
        </div>

        <p className="payment-security-note">
          No card details are collected until the secure
          payment gateway is officially launched.
        </p>
      </section>

      {applicationPayments.length > 0 && (
        <section className="payment-history-section">
          <div className="section-heading">
            <span className="card-kicker">
              PAYMENT HISTORY
            </span>

            <h2>Your payment requests</h2>
          </div>

          <div className="payment-history-list">
            {applicationPayments.map((payment) => (
              <div
                className="payment-history-item"
                key={payment.id}
              >
                <div>
                  <strong>
                    {payment.type ||
                      "Application Fee"}
                  </strong>

                  <span>
                    {formatDateTime(payment.createdAt)}
                  </span>
                </div>

                <div>
                  <strong>
                    ${Number(payment.amount || 1).toFixed(
                      2
                    )}{" "}
                    {payment.currency || "USD"}
                  </strong>

                  <span
                    className={`status-pill ${
                      payment.status || "pending"
                    }`}
                  >
                    {payment.status || "pending"}
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onReceipt(payment)}
                >
                  Receipt
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function PaymentHistoryModal({
  payments,
  onClose,
  onOpenPayment,
  onReceipt,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card payment-history-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="card-kicker">
              PAYMENTS
            </span>

            <h2>Payment history</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">$</div>

            <h3>No payment history yet</h3>

            <p>
              Your payment requests and receipts will
              appear here.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onOpenPayment}
            >
              Open Payment Page
            </button>
          </div>
        ) : (
          <>
            <div className="payment-history-list">
              {payments.map((payment) => (
                <div
                  className="payment-history-item"
                  key={payment.id}
                >
                  <div>
                    <strong>
                      {payment.type ||
                        "Application Fee"}
                    </strong>

                    <span>
                      Application:{" "}
                      {payment.applicationId || "—"}
                    </span>

                    <span>
                      {formatDateTime(
                        payment.createdAt
                      )}
                    </span>
                  </div>

                  <div>
                    <strong>
                      $
                      {Number(
                        payment.amount || 1
                      ).toFixed(2)}{" "}
                      {payment.currency || "USD"}
                    </strong>

                    <span
                      className={`status-pill ${
                        payment.status || "pending"
                      }`}
                    >
                      {payment.status || "pending"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onReceipt(payment)}
                  >
                    Receipt
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="primary-button"
                onClick={onOpenPayment}
              >
                Open Payment Page
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReceiptModal({
  payment,
  user,
  onClose,
}) {
  if (!payment) return null;

  function printReceipt() {
    window.print();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card receipt-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="receipt-content">
          <div className="receipt-brand">
            <div className="brand-box">MIDOYOL</div>

            <span>Student Services</span>
          </div>

          <div className="receipt-title">
            <span>PAYMENT RECEIPT</span>

            <h2>Application Fee</h2>
          </div>

          <div className="receipt-amount">
            <span>Amount</span>

            <strong>
              ${Number(payment.amount || 1).toFixed(2)}{" "}
              {payment.currency || "USD"}
            </strong>
          </div>

          <div className="receipt-details">
            <div>
              <span>Status</span>

              <strong>
                {payment.status || "pending"}
              </strong>
            </div>

            <div>
              <span>Application ID</span>

              <strong>
                {payment.applicationId || "—"}
              </strong>
            </div>

            <div>
              <span>Transaction ID</span>

              <strong>
                {payment.transactionId ||
                  "Not generated"}
              </strong>
            </div>

            <div>
              <span>Student Email</span>

              <strong>{user?.email || "—"}</strong>
            </div>

            <div>
              <span>Date</span>

              <strong>
                {formatDateTime(payment.createdAt)}
              </strong>
            </div>
          </div>

          <div className="receipt-notice">
            This receipt represents a payment request.
            Online payment is currently coming soon.
          </div>
        </div>

        <div className="modal-footer receipt-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={printReceipt}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportModal({
  onClose,
  onSubmit,
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      alert("Please complete all fields.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubject("");
      setMessage("");
    } catch (error) {
      alert(
        error?.message ||
          "Could not send your support request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card support-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="card-kicker">
              SUPPORT
            </span>

            <h2>Contact MIDOYOL Support</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="support-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label className="form-label">
              Subject
            </label>

            <input
              className="form-input"
              type="text"
              placeholder="How can we help?"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Message
            </label>

            <textarea
              className="form-input form-textarea"
              placeholder="Tell us what you need help with..."
              rows="6"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Sending..."
                : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthModal({
  isRegister,
  onClose,
  onSwitch,
  onLogin,
  onRegister,
  onResetPassword,
}) {
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] =
    useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      if (isRegister) {
        await onRegister({
          firstName,
          lastName,
          email,
          dateOfBirth,
          country,
          password,
          confirmPassword,
          acceptedTerms,
        });
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      alert(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      alert("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      await onResetPassword(email.trim());

      alert(
        "Password reset email sent. Please check your inbox."
      );

      setShowReset(false);
    } catch (error) {
      alert(
        error?.message ||
          "Could not send the reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="brand-box">MIDOYOL</div>

            <h2>
              {isRegister
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p>
              {isRegister
                ? "Start your university journey with MIDOYOL."
                : "Sign in to continue your application."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {!isRegister && showReset ? (
          <div className="reset-password-section">
            <span className="card-kicker">
              PASSWORD RESET
            </span>

            <h3>Reset your password</h3>

            <p>
              Enter your email and we will send you a
              password reset link.
            </p>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowReset(false)}
              >
                Back
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={loading}
                onClick={handleReset}
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Email"}
              </button>
            </div>
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {isRegister && (
              <div className="auth-two-columns">
                <div className="form-group">
                  <label className="form-label">
                    First Name
                  </label>

                  <input
                    className="form-input"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Last Name
                  </label>

                  <input
                    className="form-input"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            {isRegister && (
              <>
                <div className="auth-two-columns">
                  <div className="form-group">
                    <label className="form-label">
                      Date of Birth
                    </label>

                    <input
                      className="form-input"
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) =>
                        setDateOfBirth(
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Country
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      placeholder="Your country"
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">
                Password
              </label>

              <input
                className="form-input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            )}

            {isRegister && (
              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(
                      event.target.checked
                    )
                  }
                />

                <span>
                  I agree to the MIDOYOL terms and
                  privacy policy.
                </span>
              </label>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Login"}
            </button>

            {!isRegister && (
              <button
                type="button"
                className="text-button"
                onClick={() => setShowReset(true)}
              >
                Forgot your password?
              </button>
            )}

            <div className="auth-switch">
              <span>
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>

              <button
                type="button"
                className="text-button"
                onClick={onSwitch}
              >
                {isRegister ? "Login" : "Sign Up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Footer({ onSupport }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="brand-box">MIDOYOL</div>

          <p>
            Your journey to university starts here.
          </p>
        </div>

        <button
          type="button"
          className="footer-support"
          onClick={onSupport}
        >
          Contact Support
        </button>

        <div className="footer-bottom">
          © {new Date().getFullYear()} MIDOYOL. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
