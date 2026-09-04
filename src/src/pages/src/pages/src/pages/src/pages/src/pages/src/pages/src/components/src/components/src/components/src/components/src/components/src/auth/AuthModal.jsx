import React, { useState } from "react";

export default function AuthModal({
  open,
  isRegister,
  onClose,
  onLogin,
  onRegister,
  onResetPassword,
  onSwitchMode,
  loading = false,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    country: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isRegister) {
      onRegister?.(form);
    } else {
      onLogin?.({
        email: form.email,
        password: form.password,
      });
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="auth-modal-header">
          <div className="brand-box">MIDOYOL</div>

          <h2>
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p>
            {isRegister
              ? "Start your university journey with MIDOYOL."
              : "Sign in to continue your application."}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {isRegister && (
            <>
              <div className="form-row">
                <label>
                  First Name
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField(
                        "firstName",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField(
                        "lastName",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Date of Birth
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      updateField(
                        "dateOfBirth",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Country
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                    }
                    placeholder="Your country"
                    required
                  />
                </label>
              </div>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                updateField(
                  "password",
                  event.target.value
                )
              }
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {isRegister && (
            <>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </label>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(event) =>
                    updateField(
                      "acceptedTerms",
                      event.target.checked
                    )
                  }
                  required
                />

                <span>
                  I agree to the MIDOYOL terms and
                  conditions.
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {!isRegister && (
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onResetPassword?.(form.email)
            }
          >
            Forgot password?
          </button>
        )}

        <div className="auth-switch">
          <span>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            className="text-button"
            onClick={onSwitchMode}
          >
            {isRegister ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
                  }
