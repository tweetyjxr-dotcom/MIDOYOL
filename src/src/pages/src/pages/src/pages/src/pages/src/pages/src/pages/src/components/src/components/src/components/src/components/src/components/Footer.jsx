import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand-box">MIDOYOL</div>

          <p>
            Your journey to university starts here.
          </p>
        </div>

        <div className="footer-links">
          <span>University Applications</span>
          <span>Student Services</span>
          <span>Student Support</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} MIDOYOL. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
