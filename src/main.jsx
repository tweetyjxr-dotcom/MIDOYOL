import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="logo">MIDOYOL</div>

          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#universities">Universities</a>
            <a href="#application">Apply</a>
            <a href="#login">Login</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <h1>
              Your Journey to <span>University</span> Starts Here
            </h1>

            <p>
              MIDOYOL helps students find the right university,
              apply easily, discover offers, and follow their
              application journey from start to finish.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary">
                Start Your Application
              </button>

              <button className="btn btn-secondary">
                Explore Universities
              </button>
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="container">
            <h2 className="section-title">Our Services</h2>

            <div className="cards">
              <div className="card">
                <div className="card-icon">🎓</div>
                <h3>University Admission</h3>
                <p>
                  Apply to universities with simple and guided steps.
                </p>
              </div>

              <div className="card">
                <div className="card-icon">🏫</div>
                <h3>Student Housing</h3>
                <p>
                  Find suitable student accommodation near your university.
                </p>
              </div>

              <div className="card">
                <div className="card-icon">✈️</div>
                <h3>Airport Transfer</h3>
                <p>
                  Get reliable transportation when you arrive.
                </p>
              </div>

              <div className="card">
                <div className="card-icon">🌍</div>
                <h3>Student Trips</h3>
                <p>
                  Discover trips and experiences designed for students.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
