import React from "react";

export default function VerificationScreen({
  user,
  onCheckVerification,
  onResendVerification,
  onLogout,
  loading = false,
}) {
  return (
    <main className="verification-screen">
      <div className="verification-card">
        <div className="brand-box">MIDOYOL</div>

        <div className="verification-icon">
          ✉️
        </div>

        <h1>Verify your email</h1>

        <p>
          We sent a verification link to:
        </p>

        <strong className="verification-email">
          {user?.email || ""}
        </strong>

        <p className="verification-help">
          Please check your inbox and click the
          verification link before continuing.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={onCheckVerification}
          disabled={loading}
        >
          {loading
            ? "Checking..."
            : "I've Verified My Email"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onResendVerification}
          disabled={loading}
        >
          Resend Verification Email
        </button>

        <button
          type="button"
          className="text-button verification-logout"
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
