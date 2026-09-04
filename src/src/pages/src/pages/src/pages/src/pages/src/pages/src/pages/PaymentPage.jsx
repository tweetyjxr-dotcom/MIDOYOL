import React from "react";
import ProgressTracker from "../components/ProgressTracker";

export default function PaymentPage({
  application,
  applicationId,
  payments = [],
  currentStage = 4,
  onBackToDocuments,
  onPaymentRequest,
  onPayments,
}) {
  const latestPayment = payments[0];

  return (
    <main className="payment-page">
      <section className="payment-header">
        <div>
          <span className="eyebrow">
            STEP 04 · PAYMENT
          </span>

          <h1>Payment is coming soon.</h1>

          <p>
            Your application is ready for the
            payment stage. The MIDOYOL payment
            gateway will be available soon.
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

      <section className="payment-progress">
        <ProgressTracker
          currentStage={currentStage}
        />
      </section>

      <section className="payment-coming-soon-card">
        <div className="payment-coming-soon-icon">
          $
        </div>

        <span className="eyebrow">
          PAYMENT SYSTEM
        </span>

        <h2>Coming Soon</h2>

        <p>
          We are preparing a secure payment
          system for the MIDOYOL application
          fee.
        </p>

        <div className="payment-amount">
          <span>Application Fee</span>

          <strong>$1 USD</strong>
        </div>

        <div className="payment-info-grid">
          <div>
            <span>Status</span>
            <strong>Coming Soon</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>$1 USD</strong>
          </div>

          <div>
            <span>Application</span>
            <strong>
              {applicationId ||
                application?.applicationNumber ||
                "—"}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="primary-button payment-disabled-button"
          disabled
        >
          Payment Coming Soon
        </button>

        <p className="payment-security-note">
          🔒 Secure online payment will be
          enabled when the payment gateway is
          launched.
        </p>
      </section>

      {latestPayment && (
        <section className="payment-request-card">
          <div>
            <span className="eyebrow">
              PAYMENT REQUEST
            </span>

            <h2>Payment status</h2>

            <p>
              A payment request already exists
              for this application.
            </p>
          </div>

          <div className="payment-request-status">
            <span>Status</span>

            <strong>
              {latestPayment.status === "paid"
                ? "Paid"
                : latestPayment.status ===
                  "pending"
                ? "Pending"
                : latestPayment.status ||
                  "Pending"}
            </strong>
          </div>
        </section>
      )}

      <section className="payment-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onBackToDocuments}
        >
          ← Back to Documents
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onPayments}
        >
          Payment History
        </button>
      </section>

      <section className="payment-note">
        <strong>What happens next?</strong>

        <p>
          You can complete your application
          documents now. Once the payment gateway
          is available, you will be able to pay
          the $1 application fee securely online.
        </p>
      </section>
    </main>
  );
            }
