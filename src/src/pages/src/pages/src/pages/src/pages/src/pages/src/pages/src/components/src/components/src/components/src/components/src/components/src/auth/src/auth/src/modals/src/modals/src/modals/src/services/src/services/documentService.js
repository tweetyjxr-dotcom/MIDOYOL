import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "../firebase";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export async function getDocuments(applicationId) {
  if (!applicationId) return [];

  const documentsRef = collection(
    db,
    "applications",
    applicationId,
    "documents"
  );

  const snapshot = await getDocs(documentsRef);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function uploadDocument({
  uid,
  applicationId,
  documentType,
  file,
}) {
  if (!uid) {
    throw new Error("Student ID is required.");
  }

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!documentType) {
    throw new Error("Document type is required.");
  }

  if (!file) {
    throw new Error("Please select a file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 10 MB.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Only PDF, JPEG, and PNG files are allowed."
    );
  }

  const safeFileName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const storagePath = `students/${uid}/applications/${applicationId}/${documentType}/${safeFileName}`;

  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const downloadURL = await getDownloadURL(storageRef);

  const documentRef = doc(
    db,
    "applications",
    applicationId,
    "documents",
    documentType
  );

  const documentData = {
    documentType,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
    storagePath,
    downloadURL,
    status: "uploaded",
    updatedAt: serverTimestamp(),
  };

  await setDoc(documentRef, documentData, {
    merge: true,
  });

  return {
    id: documentType,
    ...documentData,
  };
}

export async function deleteDocument({
  applicationId,
  documentId,
}) {
  if (!applicationId || !documentId) {
    throw new Error("Application and document are required.");
  }

  const documentRef = doc(
    db,
    "applications",
    applicationId,
    "documents",
    documentId
  );

  const documents = await getDocs(
    collection(
      db,
      "applications",
      applicationId,
      "documents"
    )
  );

  const documentSnapshot = documents.docs.find(
    (item) => item.id === documentId
  );

  if (documentSnapshot?.data()?.storagePath) {
    try {
      const storageRef = ref(
        storage,
        documentSnapshot.data().storagePath
      );

      await deleteObject(storageRef);
    } catch (error) {
      // Continue removing the Firestore record
      // if the Storage file is already missing.
      console.warn(
        "Storage file could not be deleted:",
        error
      );
    }
  }

  await deleteDoc(documentRef);

  return true;
      }
