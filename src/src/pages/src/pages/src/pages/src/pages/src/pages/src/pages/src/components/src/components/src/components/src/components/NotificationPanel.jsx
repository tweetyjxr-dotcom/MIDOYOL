import React from "react";

export default function NotificationPanel({
  notifications = [],
  open = false,
  onClose,
  onMarkRead,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="notification-panel-overlay"
        onClick={onClose}
      />

      <div className="notification-panel">
        <div className="notification-panel-header">
          <div>
            <h3>Notifications</h3>
            <p>Updates from MIDOYOL</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-notifications-icon">
                🔔
              </div>

              <strong>No notifications yet</strong>

              <p>
                We'll let you know when there is an
                update to your application.
              </p>
            </div>
          ) : (
            notifications.slice(0, 8).map((notification) => (
              <button
                type="button"
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkRead?.(notification.id);
                  }
                }}
              >
                <div className="notification-icon">
                  {notification.type === "success"
                    ? "✓"
                    : notification.type === "warning"
                    ? "!"
                    : "•"}
                </div>

                <div className="notification-content">
                  <strong>
                    {notification.title || "MIDOYOL"}
                  </strong>

                  <p>{notification.message || ""}</p>

                  {!notification.read && (
                    <span className="notification-unread">
                      New
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
