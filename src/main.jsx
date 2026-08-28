import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const universities = [
  {
    name: "Istanbul Aydin University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
  {
    name: "Istanbul Gelisim University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Special Discounts",
  },
  {
    name: "Istinye University",
    location: "Istanbul, Türkiye",
    programs: "Bachelor & Master",
    scholarship: "Scholarships Available",
  },
];

function App() {
  return (
    <div className="app">

      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">MIDOYOL</div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#universities">Universities</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#login">Login</a>
          </div>

          <button className="nav-button">
            Start Application
          </button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="container hero-content">

          <div className="hero-text">
            <span className="hero-label">
              🎓 UNIVERSITY ADMISSION PLATFORM
            </span>

            <h1>
              Your Journey to
              <span> University </span>
              Starts Here
            </h1>

            <p>
              Find the right university, discover available
              scholarships and discounts, and start your
              application with MIDOYOL.
            </p>

            <div className="hero-buttons">
              <button className="primary-button">
                Start Your Application
              </button>

              <button className="secondary-button">
                Explore Universities
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span>🎓</span>
              <span>Student Application</span>
            </div>

            <h3>Find your university</h3>

            <div className="select-box">
              <span>Study Level</span>
              <strong>Choose level</strong>
            </div>

            <div className="select-box">
              <span>Major</span>
              <strong>Choose your major</strong>
            </div>

            <button className="primary-button full">
              Find Universities
            </button>
          </div>

        </div>
      </section>

      <section className="universities" id="universities">
        <div className="container">

          <div className="section-heading">
            <div>
              <span className="small-title">OUR UNIVERSITIES</span>
              <h2>Choose Your University</h2>
            </div>

            <button className="view-all">
              View All →
            </button>
          </div>

          <div className="university-grid">

            {universities.map((university) => (
              <div className="university-card" key={university.name}>

                <div className="university-image">
                  🎓
                </div>

                <div className="university-info">
                  <span className="location">
                    📍 {university.location}
                  </span>

                  <h3>{university.name}</h3>

                  <p>{university.programs}</p>

                  <div className="scholarship">
                    🎁 {university.scholarship}
                  </div>

                  <button className="apply-button">
                    View University →
                  </button>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">

          <div className="section-center">
            <span className="small-title">
              SIMPLE PROCESS
            </span>

            <h2>How MIDOYOL Works</h2>

            <p>
              Your university application made simple.
            </p>
          </div>

          <div className="steps">

            <div className="step">
              <div className="step-number">01</div>
              <h3>Choose Your University</h3>
              <p>
                Explore universities and find the program
                that matches your goals.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Submit Your Application</h3>
              <p>
                Fill in your information and upload the
                required documents.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Track Your Application</h3>
              <p>
                Follow your application status until you
                receive your admission decision.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-content">

          <div>
            <span>READY TO START?</span>
            <h2>Start Your University Journey Today.</h2>
          </div>

          <button className="primary-button">
            Start Application →
          </button>

        </div>
      </section>

      <footer>
        <div className="container footer-content">
          <div>
            <div className="logo">MIDOYOL</div>
            <p>
              Your journey to university starts here.
            </p>
          </div>

          <p>© 2026 MIDOYOL. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
