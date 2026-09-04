import React from "react";

export default function LoadingPage() {
  return (
    <main className="loading-page">
      <div className="loading-card">
        <div className="brand-box">MIDOYOL</div>

        <div className="loading-spinner" />

        <h2>Loading...</h2>

        <p>
          Please wait while we prepare your
          MIDOYOL experience.
        </p>
      </div>
    </main>
  );
}
