import React from "react";

function App() {
  return (
    <div className="landing">
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="nav-logo">
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
          </a>

          <div className="nav-links">
            <button>Home</button>
            <button>Universities</button>
            <button>How It Works</button>
            <button>About Us</button>
          </div>

          <div className="nav-start">
            <button className="outline-btn">Login</button>
            <button className="primary-btn">Start Application</button>
          </div>

          <button className="hamburger">☰</button>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero">
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
                <button className="primary-btn">
                  Start Application →
                </button>

                <button className="secondary-btn">
                  Explore Universities
                </button>
              </div>
            </div>

            {/* =========================
                GLOBE
            ========================= */}
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
      <section className="section">
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
      <section className="section">
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

                <button className="outline-btn">View University</button>
              </div>
            </div>

            <div className="university-card">
              <div className="university-image">İA</div>

              <div className="university-body">
                <h3>Istanbul Aydin University</h3>

                <p>
                  Discover undergraduate programs and start your application.
                </p>

                <button className="outline-btn">View University</button>
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

                <button className="primary-btn">Explore All</button>
              </div>
            </div>
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

            <button className="primary-btn">
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
                <button>Universities</button>
                <button>How It Works</button>
                <button>Start Application</button>
              </div>
            </div>

            <div>
              <h4>Support</h4>

              <div className="footer-links">
                <button>Contact Us</button>
                <button>Help Center</button>
                <button>Student Support</button>
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
