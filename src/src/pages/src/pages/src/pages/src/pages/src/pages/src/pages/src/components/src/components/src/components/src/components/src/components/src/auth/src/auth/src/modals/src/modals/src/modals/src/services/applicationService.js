
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { generateApplicationId } from "../utils/helpers";

export async function getStudent(uid) {
  const studentRef = doc(db, "students", uid);
  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createStudent(uid, data = {}) {
  const studentRef = doc(db, "students", uid);

  const studentData = {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(studentRef, studentData, { merge: true });

  return studentData;
}

export async function getApplication(applicationId) {
  if (!applicationId) return null;

  const applicationRef = doc(db, "applications", applicationId);
  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createApplication({
  uid,
  email,
  applicationId: providedApplicationId,
} = {}) {
  if (!uid) {
    throw new Error("Student ID is required.");
  }

  const applicationId =
    providedApplicationId || generateApplicationId();

  const applicationRef = doc(db, "applications", applicationId);

  const applicationData = {
    applicationNumber: applicationId,
    studentId: uid,
    email: email || "",
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

  await setDoc(applicationRef, applicationData);

  await setDoc(
    doc(db, "students", uid),
    {
      uid,
      currentApplicationId: applicationId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    id: applicationId,
    ...applicationData,
  };
}

export async function updateApplication(applicationId, updates = {}) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const applicationRef = doc(db, "applications", applicationId);

  await setDoc(
    applicationRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getCurrentApplication(uid) {
  if (!uid) return null;

  const student = await getStudent(uid);

  if (!student?.currentApplicationId) {
    return null;
  }

  return getApplication(student.currentApplicationId);
}
