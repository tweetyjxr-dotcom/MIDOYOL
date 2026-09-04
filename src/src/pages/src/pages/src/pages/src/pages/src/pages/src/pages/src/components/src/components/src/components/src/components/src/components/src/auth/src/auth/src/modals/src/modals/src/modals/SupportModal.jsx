import React, { useState } from "react";

export default function SupportModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    await onSubmit?.({
      subject: subject.trim(),
      message: message.trim(),
    });

    setSubject("");
    setMessage("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card support-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              MIDOYOL SUPPORT
            </span>

            <h2>How can we help?</h2>

            <p>
              Send us your question and our support
              team will get back to you.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close support"
          >
            ×
          </button>
        </div>

        <form
          className="support-form"
          onSubmit={handleSubmit}
        >
          <label>
            Subject

            <input
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="What do you need help with?"
              required
              maxLength={120}
            />
          </label>

          <label>
            Message

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Describe your question or issue..."
              rows={6}
              required
              maxLength={2000}
            />
          </label>

          <div className="support-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
            }
