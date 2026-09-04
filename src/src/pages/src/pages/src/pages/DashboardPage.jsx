import React from "react";
import ProgressTracker from "../components/ProgressTracker";

const UNIVERSITIES = [
  "Istanbul Aydin University",
  "Istanbul Gelisim University",
  "Istinye University",
];

export default function DashboardPage({
  user,
  application,
  applicationId,
  documents = [],
  currentStage = 1,
  onStartApplication,
  onDocuments,
  onPayments,
  onSupport,
}) {
  const uploadedDocuments = documents.filter(
    (document) => document.status === "uploaded"
  ).length;

  const documentsComplete =
    uploadedDocuments >= 4;

  const chooseComplete = Boolean(
    application?.field &&
      application?.specialization &&
      application?.university
  );

  const getStatus = (complete, active) => {
    if (complete) return "Completed";
    if (active) return "In Progress";
    return "Pending";
  };

  return (
    <main className="dashboard-page">
      <section className="welcome-section">
        <div>
          <span className="eyebrow">
            STUDENT DASHBOARD
          </span>

          <h1>
            Welcome
            {user?.displayName
              ? `, ${user.displayName.split(" ")[0]}`
              : ""}
            .
          </h1>

          <p>
            Keep track of your university
            application journey from one place.
          </p>
        </div>

        <div className="application-id-card">
          <span>Application ID</span>

          <strong>
            {applicationId ||
              application?.applicationNumber ||
              "Not started"}
          </strong>
        </div>
      </section>

      <section
        className="dashboard-section progress-section"
        id="progress-section"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              APPLICATION PROGRESS
            </span>

            <h2>Your application journey</h2>
          </div>
        </div>

        <ProgressTracker
          currentStage={currentStage}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              APPLICATION STATUS
            </span>

            <h2>Application overview</h2>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-card">
            <div className="status-card-number">
              01
            </div>

            <div className="status-card-content">
              <h3>Registration</h3>

              <p>
                Your MIDOYOL account is ready.
              </p>

              <span className="status-complete">
                ✓ Completed
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-number">
              02
            </div>

            <div className="status-card-content">
              <h3>Choose</h3>

              <p>
                Select your study program and
                university.
              </p>

              <span
                className={
                  chooseComplete
                    ? "status-complete"
                    : "status-active"
                }
              >
                {chooseComplete
                  ? "✓ Completed"
                  : "In Progress"}
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-number">
              03
            </div>

            <div className="status-card-content">
              <h3>Documents</h3>

              <p>
                Upload the required application
                documents.
              </p>

              <span
                className={
                  documentsComplete
                    ? "status-complete"
                    : "status-active"
                }
              >
                {documentsComplete
                  ? "✓ Completed"
                  : `${uploadedDocuments}/4 Uploaded`}
              </span>
            </div>
          </div>

          <div className="status-card payment-status-card">
            <div className="status-card-number">
              04
            </div>

            <div className="status-card-content">
              <h3>Payment</h3>

              <p>
                Application payment system.
              </p>

              <span className="status-coming-soon">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section application-summary">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              YOUR APPLICATION
            </span>

            <h2>Application details</h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={onStartApplication}
          >
            Edit Application
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span>Study Field</span>

            <strong>
              {application?.field || "Not selected"}
            </strong>
          </div>

          <div className="summary-item">
            <span>Specialization</span>

            <strong>
              {application?.specialization ||
                "Not selected"}
            </strong>
          </div>

          <div className="summary-item">
            <span>University</span>

            <strong>
              {application?.university ||
                "Not selected"}
            </strong>
          </div>

          <div className="summary-item">
            <span>Application Status</span>

            <strong>
              {application?.status === "submitted"
                ? "Submitted"
                : "Draft"}
            </strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              UNIVERSITY PARTNERS
            </span>

            <h2>Explore your options</h2>
          </div>
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

              <h3>{university}</h3>

              <p>
                Explore programs and start your
                application through MIDOYOL.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={onStartApplication}
              >
                Apply through MIDOYOL →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section how-it-works">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              HOW IT WORKS
            </span>

            <h2>Four simple steps</h2>
          </div>
        </div>

        <div className="steps-grid">
          <div className="how-step">
            <span>01</span>

            <h3>Registration</h3>

            <p>
              Create your MIDOYOL student
              account and verify your email.
            </p>
          </div>

          <div className="how-step">
            <span>02</span>

            <h3>Choose</h3>

            <p>
              Select your field, specialization,
              and preferred university.
            </p>
          </div>

          <div className="how-step">
            <span>03</span>

            <h3>Documents</h3>

            <p>
              Upload the documents required for
              your application.
            </p>
          </div>

          <div className="how-step">
            <span>04</span>

            <h3>Payment</h3>

            <p>
              Payment processing will be
              available soon.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-cta">
        <div>
          <span className="eyebrow">
            NEED HELP?
          </span>

          <h2>
            We're here for your journey.
          </h2>

          <p>
            If you have a question about your
            application, contact MIDOYOL support.
          </p>
        </div>

        <div className="dashboard-cta-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onSupport}
          >
            Contact Support
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onDocuments}
          >
            Manage Documents
          </button>

          <button
            type="button"
            className="text-button"
            onClick={onPayments}
          >
            Payment History →
          </button>
        </div>
      </section>
    </main>
  );
  }
