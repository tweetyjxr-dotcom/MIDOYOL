import React, { useCallback, useEffect, useMemo, useState } from "react";

import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationPage from "./pages/ApplicationPage";
import DocumentsPage from "./pages/DocumentsPage";
import PaymentPage from "./pages/PaymentPage";

import Navbar from "./components/Navbar";
import MobileMenu from "./components/MobileMenu";
import NotificationPanel from "./components/NotificationPanel";

import AuthModal from "./auth/AuthModal";
import VerificationScreen from "./auth/VerificationScreen";

import PaymentHistoryModal from "./modals/PaymentHistoryModal";
import ReceiptModal from "./modals/ReceiptModal";
import SupportModal from "./modals/SupportModal";

import { auth } from "./firebase";

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
  createStudent,
  getCurrentApplication,
  updateApplication,
  createApplication,
} from "./services/applicationService";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "./services/documentService";

import {
  getStudentPayments,
  createPaymentRequest,
} from "./services/paymentService";

import {
  getNotifications,
  createNotification,
  markNotificationRead,
} from "./services/notificationService";

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [page, setPage] = useState("home");

  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [notificationPanelOpen, setNotificationPanelOpen] =
    useState(false);

  const [paymentHistoryOpen, setPaymentHistoryOpen] =
    useState(false);

  const [receiptOpen, setReceiptOpen] =
    useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [supportOpen, setSupportOpen] =
    useState(false);

  const [supportLoading, setSupportLoading] =
    useState(false);

  const [applicationId, setApplicationId] =
    useState("");

  const [application, setApplication] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem(
        "midoyol-dark-mode"
      ) === "true"
    );
  });

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

  const showError = (error) => {
    console.error(error);

    alert(
      error?.message ||
        "Something went wrong. Please try again."
    );
  };

  const createWelcomeNotification = useCallback(
    async (uid) => {
      try {
        await createNotification({
          uid,
          title: "Welcome to MIDOYOL",
          message:
            "Your account is ready. Start your university application whenever you're ready.",
          type: "success",
        });
      } catch (error) {
        console.error(
          "Welcome notification failed:",
          error
        );
      }
    },
    []
  );

  const loadStudentData = useCallback(
    async (currentUser) => {
      if (!currentUser) return;

      try {
        const currentApplication =
          await getCurrentApplication(
            currentUser.uid
          );

        if (currentApplication) {
          setApplicationId(
            currentApplication.id ||
              currentApplication.applicationNumber
          );

          setApplication(currentApplication);

          const loadedDocuments =
            await getDocuments(
              currentApplication.id
            );

          setDocuments(loadedDocuments);

          try {
            const loadedPayments =
              await getStudentPayments(
                currentUser.uid
              );

            setPayments(loadedPayments);
          } catch (paymentError) {
            console.error(
              "Payment loading failed:",
              paymentError
            );

            setPayments([]);
          }
        } else {
          setApplicationId("");
          setApplication(null);
          setDocuments([]);
          setPayments([]);
        }

        try {
          const loadedNotifications =
            await getNotifications(
              currentUser.uid
            );

          setNotifications(
            loadedNotifications
          );
        } catch (notificationError) {
          console.error(
            "Notification loading failed:",
            notificationError
          );

          setNotifications([]);
        }
      } catch (error) {
        console.error(
          "Student data loading failed:",
          error
        );
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setAuthChecking(false);

          if (!currentUser) {
            setUser(null);
            setPage("home");
            setApplication(null);
            setApplicationId("");
            setDocuments([]);
            setPayments([]);
            setNotifications([]);
            return;
          }

          await reload(currentUser);

          setUser(currentUser);

          await loadStudentData(
            currentUser
          );

          if (currentUser.emailVerified) {
            setPage("dashboard");
          } else {
            setPage("verify");
          }
        }
      );

    return unsubscribe;
  }, [loadStudentData]);

  const ensureApplication = useCallback(
    async () => {
      if (!user) return null;

      if (applicationId && application) {
        return application;
      }

      const existing =
        await getCurrentApplication(
          user.uid
        );

      if (existing) {
        setApplicationId(
          existing.id ||
            existing.applicationNumber
        );

        setApplication(existing);

        const loadedDocuments =
          await getDocuments(existing.id);

        setDocuments(loadedDocuments);

        return existing;
      }

      const newApplication =
        await createApplication({
          uid: user.uid,
          email: user.email,
        });

      setApplicationId(
        newApplication.id
      );

      setApplication(
        newApplication
      );

      setDocuments([]);

      await createNotification({
        uid: user.uid,
        title: "Application created",
        message:
          `Your MIDOYOL application ${newApplication.id} has been created.`,
        type: "success",
      });

      return newApplication;
    },
    [
      user,
      applicationId,
      application,
    ]
  );

  const saveApplication = useCallback(
    async (updates) => {
      if (!applicationId) return;

      setSaving(true);
