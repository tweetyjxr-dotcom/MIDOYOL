import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getStudentPayments(uid) {
  if (!uid) {
    return [];
  }

  const paymentsQuery = query(
    collection(db, "payments"),
    where("studentId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(paymentsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function createPaymentRequest({
  uid,
  applicationId,
}) {
  if (!uid) {
    throw new Error("Student ID is required.");
  }

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const paymentData = {
    studentId: uid,
    applicationId,
    type: "Application Fee",
    amount: 1,
    currency: "USD",
    status: "pending",
    transactionId: "",
    createdAt: serverTimestamp(),
  };

  const paymentRef = await addDoc(
    collection(db, "payments"),
    paymentData
  );

  return {
    id: paymentRef.id,
    ...paymentData,
  };
}
