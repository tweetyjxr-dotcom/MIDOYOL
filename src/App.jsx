import React, { useState } from "react";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (id) => {
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="landing">
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="navbar">
        <div className="navbar-inner">
          <button
            className="nav-logo"
            onClick={() => goTo("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#65b9f5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "18px",
              }}
            >
              M
            </div>

            <span>MIDOYOL</span>
          </button>

          <div className="nav-links">
            <button onClick={() => goTo("home")}>Home</button>

            <button onClick={() => goTo("universities")}>
              Universities
            </button>

            <button onClick={() => goTo("how-it-works")}>
              How It Works
            </button>

            <button onClick={() => goTo("about")}>
              About Us
            </button>
          </div>

          <div className="nav-start">
            <button
              className="outline-btn"
              onClick={() => alert("Login page coming soon")}
            >
              Login
            </button>

            <button
              className="primary-btn"
              onClick={() => alert("Application page coming soon")}
            >
              Start Application
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            style={{
              padding: "15px 20px 25px",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button onClick={() => goTo("home")}>Home</button>

            <button onClick={() => goTo("universities")}>
              Universities
            </button>

            <button onClick={() => goTo("how-it-works")}>
              How It Works
            </button>

            <button onClick={() => goTo("about")}>About Us</button>

            <button
              className="outline-btn"
              onClick={() => alert("Login page coming soon")}
            >
              Login
            </button>

            <button
              className="primary-btn"
              onClick={() => alert("Application page coming soon")}
            >
              Start Application
            </button>
          </div>
        )}
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                🎓 Student Admissions Platform
              </div>

              <h1>
                Your journey to
                <br />
                <span>university</span> starts here.
              </h1>

              <p className="hero-description">
                MIDOYOL helps students discover universities, apply easily,
                find scholarships, and start their academic journey with
                confidence.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-btn"
                  onClick={() => alert("Application page coming soon")}
                >
                  Start Application →
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => goTo("universities")}
                >
                  Explore Universities
                </button>
              </div>
            </div>

            {/* GLOBE */}
            <div className="hero-visual">
              <div className="globe">
                <div className="globe-grid"></div>
              </div>

              <div className="flag flag-1">🇹🇷</div>
              <div className="flag flag-2">🇸🇩</div>
              <div className="flag flag-3">🇨🇾</div>
              <div className="flag flag-4">🎓</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>

            <p>
              A simple and easy process designed to help students reach their
              university goals.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>
                Create your MIDOYOL account and start your application journey.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose University</h3>
              <p>
                Explore universities and select the program that fits you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Submit Documents</h3>
              <p>
                Upload your documents and complete your application online.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Track Application</h3>
              <p>
                Follow every stage of your application directly from your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          UNIVERSITIES
      ========================= */}
      <section className="section" id="universities">
        <div className="container">
          <div className="section-title">
            <h2>Find Your University</h2>

            <p>
              Discover leading universities and find the right academic path
              for your future.
            </p>
          </div>

          <div className="university-grid">
            <div className="university-card">
              <div className="university-image">İG</div>

              <div className="university-body">
                <h3>Istanbul Gelisim University</h3>

                <p>
                  Explore programs, admission requirements, and available
                  opportunities.
                </p>

                <button
                  className="outline-btn"
                  onClick={() =>
                    alert("Istanbul Gelisim University coming soon")
                  }
                >
                  View University
                </button>
              </div>
            </div>

            <div className="university-card">
              <div className="university-image">İA</div>

              <div className="university-body">
                <h3>Istanbul Aydin University</h3>

                <p>
                  Discover undergraduate programs and start your application.
                </p>

                <button
                  className="outline-btn"
                  onClick={() =>
                    alert("Istanbul Aydin University coming soon")
                  }
                >
                  View University
                </button>
              </div>
            </div>

            <div className="university-card">
              <div className="university-image">İÜ</div>

              <div className="university-body">
                <h3>Explore More Universities</h3>

                <p>
                  Browse more universities and find the program that matches
                  your goals.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    alert("All universities page coming soon")
                  }
                >
                  Explore All
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>About MIDOYOL</h2>

            <p>
              MIDOYOL is designed to make the university admission journey
              simpler, clearer, and easier for students.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to start your journey?</h2>

            <p>
              Take the first step toward your university future with MIDOYOL.
            </p>

            <button
              className="primary-btn"
              onClick={() => alert("Application page coming soon")}
            >
              Start Your Application →
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "9px",
                    background: "#65b9f5",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                  }}
                >
                  M
                </div>

                <span>MIDOYOL</span>
              </div>

              <p>
                Your journey to university starts here. We make student
                admissions simpler, clearer, and easier.
              </p>
            </div>

            <div>
              <h4>Platform</h4>

              <div className="footer-links">
                <button onClick={() => goTo("universities")}>
                  Universities
                </button>

                <button onClick={() => goTo("how-it-works")}>
                  How It Works
                </button>

                <button onClick={() => alert("Application page coming soon")}>
                  Start Application
                </button>
              </div>
            </div>

            <div>
              <h4>Support</h4>

              <div className="footer-links">
                <button onClick={() => alert("Contact page coming soon")}>
                  Contact Us
                </button>

                <button onClick={() => alert("Help Center coming soon")}>
                  Help Center
                </button>

                <button onClick={() => alert("Student Support coming soon")}>
                  Student Support
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 MIDOYOL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
