import React from "react";
import { formatDateTime } from "../utils/helpers";

export default function PaymentHistoryModal({
  open,
  payments = [],
  onClose,
  onReceipt,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card payment-history-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              MIDOYOL
            </span>
            <h2>Payment History</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              💳
            </div>

            <h3>No payment history</h3>

            <p>
              Your payment records will appear here
              when available.
            </p>
          </div>
        ) : (
          <div className="payment-history-list">
            {payments.map((payment) => (
              <div
                className="payment-history-item"
                key={payment.id}
              >
                <div>
                  <strong>
                    {payment.type ||
                      "Application Fee"}
                  </strong>

                  <span>
                    {formatDateTime(
                      payment.createdAt
                    )}
                  </span>
                </div>

                <div className="payment-history-right">
                  <strong>
                    {payment.amount}{" "}
                    {payment.currency}
                  </strong>

                  <span
                    className={`payment-status ${String(
                      payment.status || ""
                    ).toLowerCase()}`}
                  >
                    {payment.status || "Pending"}
                  </span>

                  {payment.status === "paid" && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        onReceipt?.(payment)
                      }
                    >
                      View Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
                    }
