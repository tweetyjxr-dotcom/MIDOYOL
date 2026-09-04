import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getNotifications(uid) {
  if (!uid) {
    return [];
  }

  const notificationsQuery = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(notificationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function createNotification({
  uid,
  title,
  message,
  type = "info",
}) {
  if (!uid) {
    throw new Error("Student ID is required.");
  }

  const notificationData = {
    uid,
    title: title || "MIDOYOL",
    message: message || "",
    type,
    read: false,
    createdAt: serverTimestamp(),
  };

  const notificationRef = await addDoc(
    collection(db, "users", uid, "notifications"),
    notificationData
  );

  return {
    id: notificationRef.id,
    ...notificationData,
  };
}

export async function markNotificationRead(uid, notificationId) {
  if (!uid || !notificationId) {
    throw new Error("Notification information is required.");
  }

  const notificationRef = doc(
    db,
    "users",
    uid,
    "notifications",
    notificationId
  );

  await updateDoc(notificationRef, {
    read: true,
  });

  return true;
}
