import React from "react";

export default function Navbar({
  user,
  notifications = [],
  onHome,
  onStartApplication,
  onProgress,
  onPayments,
  onLogout,
  onToggleMobileMenu,
  darkMode,
  onToggleDarkMode,
}) {
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          type="button"
          className="brand-box"
          onClick={onHome}
          aria-label="Go to MIDOYOL home"
        >
          MIDOYOL
        </button>

        <nav className="desktop-nav-links">
          <button type="button" onClick={onHome}>
            Home
          </button>

          <button
            type="button"
            onClick={onStartApplication}
          >
            Apply
          </button>

          <button
            type="button"
            onClick={onProgress}
          >
            Progress
          </button>
        </nav>

        <div className="nav-right">
          <span className="nav-user-email">
            {user?.email || ""}
          </span>

          <button
            type="button"
            className="notification-button"
            onClick={onProgress}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="primary-button nav-application-button"
            onClick={onStartApplication}
          >
            Start Application
          </button>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={onToggleMobileMenu}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="navbar-mobile-actions">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="dark-mode-button"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button
          type="button"
          onClick={onPayments}
          className="payments-nav-button"
        >
          Payments
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="logout-nav-button"
        >
          Logout
        </button>
      </div>
    </header>
  );
      }
