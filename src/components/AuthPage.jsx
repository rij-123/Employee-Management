import { useState } from "react";
import { login, register } from "../auth.js";

export default function AuthPage({ mode, notice, prefillEmail, onSwitch, onSuccess, onRegistered }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: prefillEmail || "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) setApiError("");
  }

  function validate() {
    const errs = {};
    const emailTrim = form.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Email validation (both login and register)
    if (!emailTrim) {
      errs.email = "Email is required.";
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = "Please enter a valid email address (e.g. name@company.com).";
    }

    // Password validation (both login and register)
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    // Additional validations for Registration
    if (!isLogin) {
      const nameTrim = form.name.trim();
      if (!nameTrim) {
        errs.name = "Full name is required.";
      } else if (nameTrim.length < 2) {
        errs.name = "Name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrim)) {
        errs.name = "Name should contain letters only.";
      }

      const phoneTrim = (form.phone || "").trim();
      if (!phoneTrim) {
        errs.phone = "Mobile number is required.";
      } else if (!/^\d{10}$/.test(phoneTrim)) {
        errs.phone = "Mobile number must be exactly 10 digits.";
      } else if (!/^[6-9]\d{9}$/.test(phoneTrim)) {
        errs.phone = "Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).";
      }

      if (!form.confirm) {
        errs.confirm = "Please confirm your password.";
      } else if (form.password !== form.confirm) {
        errs.confirm = "Passwords do not match.";
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setBusy(true);
    try {
      if (isLogin) {
        const user = await login(form);
        onSuccess(user);
      } else {
        await register(form);
        onRegistered(form.email.trim().toLowerCase());
      }
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>{isLogin ? "Welcome back" : "Create account"}</h1>
        <p className="muted">
          {isLogin ? "Log in to view your dashboard" : "Create a new account"}
        </p>

        {notice && (
          <div className="form-success" role="status">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{notice}</span>
          </div>
        )}

        {apiError && (
          <div className="form-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        {!isLogin && (
          <label className="field">
            <span>Full name</span>
            <input
              className={`input ${fieldErrors.name ? "invalid" : ""}`}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. John Doe"
              autoComplete="name"
            />
            {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            className={`input ${fieldErrors.email ? "invalid" : ""}`}
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
          />
          {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
        </label>

        {!isLogin && (
          <label className="field">
            <span>Mobile number</span>
            <input
              className={`input ${fieldErrors.phone ? "invalid" : ""}`}
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number (e.g. 9876543210)"
              autoComplete="tel"
            />
            {fieldErrors.phone && <span className="error">{fieldErrors.phone}</span>}
          </label>
        )}

        <label className="field">
          <span>Password</span>
          <input
            className={`input ${fieldErrors.password ? "invalid" : ""}`}
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}
        </label>

        {!isLogin && (
          <label className="field">
            <span>Confirm password</span>
            <input
              className={`input ${fieldErrors.confirm ? "invalid" : ""}`}
              type="password"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {fieldErrors.confirm && <span className="error">{fieldErrors.confirm}</span>}
          </label>
        )}

        <button className="btn primary auth-submit" disabled={busy}>
          {busy ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p className="auth-switch muted">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
}
