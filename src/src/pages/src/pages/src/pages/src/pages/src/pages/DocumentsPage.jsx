import React, { useRef, useState } from "react";
import ProgressTracker from "../components/ProgressTracker";

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

function formatFileSize(bytes) {
  if (!bytes) return "—";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage({
  application,
  applicationId,
  documents = [],
  currentStage = 3,
  onUpload,
  onDelete,
  onContinue,
}) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");

  const fileInputs = useRef({});

  const getDocument = (documentType) =>
    documents.find(
      (document) =>
        document.id === documentType ||
        document.documentType === documentType
    );

  const uploadedCount = REQUIRED_DOCUMENTS.filter(
    (item) => {
      const document = getDocument(item.id);

      return document?.status === "uploaded";
    }
  ).length;

  const allUploaded =
    uploadedCount === REQUIRED_DOCUMENTS.length;

  const handleFileSelect = async (
    documentType,
    event
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setUploading(documentType);

    try {
      await onUpload?.({
        documentType,
        file,
      });
    } catch (uploadError) {
      console.error(
        "Document upload failed:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Something went wrong while uploading the file."
      );
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Remove "${document.fileName || "this document"}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await onDelete?.(document.id);
    } catch (deleteError) {
      console.error(
        "Document delete failed:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "Something went wrong while removing the document."
      );
    }
  };

  return (
    <main className="documents-page">
      <section className="documents-header">
        <div>
          <span className="eyebrow">
            STEP 03 · DOCUMENTS
          </span>

          <h1>
            Prepare your documents.
          </h1>

          <p>
            Upload the required documents for
            your university application.
          </p>
        </div>

        <div className="application-id-card">
          <span>Application ID</span>

          <strong>
            {applicationId ||
              application?.applicationNumber ||
              "—"}
          </strong>
        </div>
      </section>

      <section className="documents-progress">
        <ProgressTracker
          currentStage={currentStage}
        />
      </section>

      <section className="documents-summary">
        <div>
          <span className="eyebrow">
            DOCUMENT CHECKLIST
          </span>

          <h2>
            {uploadedCount}/
            {REQUIRED_DOCUMENTS.length} documents
            uploaded
          </h2>

          <p>
            Make sure every file is clear and
            readable before continuing.
          </p>
        </div>

        <div className="documents-progress-count">
          <strong>{uploadedCount}</strong>

          <span>
            of {REQUIRED_DOCUMENTS.length}
          </span>
        </div>
      </section>

      {error && (
        <div className="documents-error">
          <span>!</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      <section className="documents-list">
        {REQUIRED_DOCUMENTS.map(
          (requiredDocument, index) => {
            const document = getDocument(
              requiredDocument.id
            );

            const isUploaded =
              document?.status === "uploaded";

            const isUploading =
              uploading === requiredDocument.id;

            return (
              <article
                className={`document-card ${
                  isUploaded
                    ? "uploaded"
                    : ""
                }`}
                key={requiredDocument.id}
              >
                <div className="document-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="document-main">
                  <div className="document-title-row">
                    <div>
                      <h3>
                        {requiredDocument.title}
                      </h3>

                      <p>
                        {
                          requiredDocument.description
                        }
                      </p>
                    </div>

                    {isUploaded && (
                      <span className="document-status">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>

                  {isUploaded ? (
                    <div className="uploaded-file">
                      <div className="uploaded-file-icon">
                        {document.contentType ===
                        "application/pdf"
                          ? "PDF"
                          : "IMG"}
                      </div>

                      <div className="uploaded-file-info">
                        <strong>
                          {document.fileName}
                        </strong>

                        <span>
                          {formatFileSize(
                            document.fileSize
                          )}
                        </span>
                      </div>

                      <div className="uploaded-file-actions">
                        {document.downloadURL && (
                          <a
                            href={
                              document.downloadURL
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-button"
                          >
                            View
                          </a>
                        )}

                        <button
                          type="button"
                          className="remove-document-button"
                          onClick={() =>
                            handleDelete(
                              document
                            )
                          }
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="document-upload-area">
                      <input
                        ref={(element) => {
                          fileInputs.current[
                            requiredDocument.id
                          ] = element;
                        }}
                        type="file"
                        accept={
                          requiredDocument.accept
                        }
                        hidden
                        onChange={(event) =>
                          handleFileSelect(
                            requiredDocument.id,
                            event
                          )
                        }
                      />

                      <div className="document-upload-info">
                        <div className="upload-icon">
                          ↑
                        </div>

                        <div>
                          <strong>
                            {isUploading
                              ? "Uploading..."
                              : "Choose a file"}
                          </strong>

                          <span>
                            PDF, JPG, JPEG or PNG
                            · Max 10 MB
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="secondary-button"
                        disabled={isUploading}
                        onClick={() =>
                          fileInputs.current[
                            requiredDocument.id
                          ]?.click()
                        }
                      >
                        {isUploading
                          ? "Uploading..."
                          : "Upload"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          }
        )}
      </section>

      <section className="documents-bottom">
        <div className="documents-save-status">
          <span className="save-check">
            ✓
          </span>

          Your documents are securely stored.
        </div>

        <button
          type="button"
          className="primary-button"
          disabled={!allUploaded}
          onClick={onContinue}
        >
          Continue to Payment
          <span>→</span>
        </button>
      </section>

      {!allUploaded && (
        <p className="documents-hint">
          Upload all required documents to
          continue.
        </p>
      )}

      {allUploaded && (
        <div className="documents-ready">
          <span>✓</span>

          <div>
            <strong>
              Your documents are complete.
            </strong>

            <p>
              The next step is payment. The
              payment system is currently coming
              soon.
            </p>
          </div>
        </div>
      )}
    </main>
  );
      }
