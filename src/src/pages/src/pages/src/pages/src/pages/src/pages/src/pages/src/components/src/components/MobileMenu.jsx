import React from "react";

export default function MobileMenu({
  open,
  user,
  darkMode,
  onToggleDarkMode,
  onProgress,
  onPayments,
  onLogout,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="mobile-menu-overlay"
        onClick={onClose}
      />

      <aside className="mobile-menu">
        <div className="mobile-menu-header">
          <div className="brand-box">MIDOYOL</div>

          <button
            type="button"
            onClick={onClose}
            className="mobile-menu-close"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="mobile-account">
          <span className="mobile-account-label">
            Student Account
          </span>

          <strong>{user?.email || "Student"}</strong>
        </div>

        <div className="mobile-menu-items">
          <button
            type="button"
            onClick={() => {
              onToggleDarkMode();
              onClose();
            }}
          >
            <span>{darkMode ? "☀️" : "🌙"}</span>
            <span>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onProgress();
              onClose();
            }}
          >
            <span>📊</span>
            <span>Application Progress</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onPayments();
              onClose();
            }}
          >
            <span>💳</span>
            <span>Payments</span>
          </button>
        </div>

        <div className="mobile-menu-bottom">
          <button
            type="button"
            className="mobile-logout"
            onClick={onLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
