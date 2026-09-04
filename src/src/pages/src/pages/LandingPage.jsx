import React from "react";

export default function LandingPage({
  onLogin,
  onRegister,
  onStartApplication,
}) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          MIDOYOL
        </div>

        <div className="landing-auth-buttons">
          <button
            type="button"
            className="secondary-button"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onRegister}
          >
            Sign Up
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            YOUR UNIVERSITY JOURNEY
          </span>

          <h1>
            Your Journey to University
            <span> Starts Here.</span>
          </h1>

          <p>
            MIDOYOL makes your university
            application journey simple, clear,
            and easy to follow.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button hero-primary-button"
              onClick={onStartApplication}
            >
              Start Your Application
            </button>

            <button
              type="button"
              className="secondary-button hero-secondary-button"
              onClick={onRegister}
            >
              Create Account
            </button>
          </div>

          <div className="hero-fee">
            <strong>$1</strong>

            <span>
              application fee
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="globe-container">
            <div className="globe">
              <div className="globe-line globe-line-one" />
              <div className="globe-line globe-line-two" />
              <div className="globe-line globe-line-three" />

              <div className="globe-land land-one" />
              <div className="globe-land land-two" />
              <div className="globe-land land-three" />
            </div>

            <div className="flag flag-turkey">
              🇹🇷
            </div>

            <div className="flag flag-sudan">
              🇸🇩
            </div>

            <div className="flag flag-uk">
              🇬🇧
            </div>

            <div className="flag flag-germany">
              🇩🇪
            </div>

            <div className="flag flag-brazil">
              🇧🇷
            </div>

            <div className="flag flag-saudi">
              🇸🇦
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <div className="feature-icon">
            01
          </div>

          <h3>Choose</h3>

          <p>
            Select your study field,
            specialization, and university.
          </p>
        </div>

        <div className="landing-feature">
          <div className="feature-icon">
            02
          </div>

          <h3>Prepare</h3>

          <p>
            Upload the documents required
            for your application.
          </p>
        </div>

        <div className="landing-feature">
          <div className="feature-icon">
            03
          </div>

          <h3>Track</h3>

          <p>
            Follow your application progress
            from one simple dashboard.
          </p>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="eyebrow">
            READY TO START?
          </span>

          <h2>
            Take the first step toward
            your university.
          </h2>

          <p>
            Create your account and start
            your application with MIDOYOL.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onStartApplication}
        >
          Start Application
        </button>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-box">
              MIDOYOL
            </div>

            <p>
              Your journey to university
              starts here.
            </p>
          </div>

          <div className="footer-links">
            <span>
              University Applications
            </span>

            <span>
              Student Services
            </span>

            <span>
              Student Support
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} MIDOYOL.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
              }
