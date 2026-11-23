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

  function validateField(field, value, currentForm = form) {
    let err = "";
    const val = value !== undefined ? value : currentForm[field] || "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    switch (field) {
      case "email": {
        const trimmed = String(val).trim();
        if (!trimmed) {
          err = "Email is required.";
        } else if (!emailRegex.test(trimmed)) {
          err = "Please enter a valid email address (e.g. name@company.com).";
        }
        break;
      }
      case "password": {
        if (!val) {
          err = "Password is required.";
        } else if (val.length < 6) {
          err = "Password must be at least 6 characters.";
        }
        break;
      }
      case "name": {
        if (!isLogin) {
          const trimmed = String(val).trim();
          if (!trimmed) {
            err = "Full name is required.";
          } else if (trimmed.length < 2) {
            err = "Name must be at least 2 characters.";
          } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
            err = "Name should contain letters only.";
          }
        }
        break;
      }
      case "phone": {
        if (!isLogin) {
          const trimmed = String(val).trim();
          if (!trimmed) {
            err = "Mobile number is required.";
          } else if (trimmed.startsWith("0")) {
            err = "Mobile number cannot start with 0 (000 is not allowed). Must start with 6, 7, 8, or 9.";
          } else if (!/^[6-9]/.test(trimmed)) {
            err = "Mobile number must start with 6, 7, 8, or 9.";
          } else if (trimmed.length < 10) {
            err = `Mobile number must be exactly 10 digits (${trimmed.length}/10 entered).`;
          } else if (!/^\d{10}$/.test(trimmed)) {
            err = "Mobile number must be exactly 10 digits.";
          } else if (/^([0-9])\1{9}$/.test(trimmed)) {
            err = "Invalid mobile number (all digits cannot be the same).";
          }
        }
        break;
      }
      case "confirm": {
        if (!isLogin) {
          if (!val) {
            err = "Please confirm your password.";
          } else if (val !== currentForm.password) {
            err = "Passwords do not match.";
          }
        }
        break;
      }
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  }

  function handleChange(field, value) {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    validateField(field, value, updatedForm);

    if (field === "password" && form.confirm) {
      validateField("confirm", form.confirm, updatedForm);
    }
    if (apiError) setApiError("");
  }

  function handlePhoneChange(e) {
    const raw = e.target.value.replace(/\D/g, "");

    // Disallow typing 0 or starting with 0 (e.g. 0, 000)
    if (raw.startsWith("0")) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: "Mobile number cannot start with 0 (000 is not allowed). Must start with 6, 7, 8, or 9.",
      }));
      // Do not allow 0 into input
      return;
    }

    // Disallow digits not starting with 6, 7, 8, 9
    if (raw.length > 0 && !/^[6-9]/.test(raw)) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: "Mobile number must start with 6, 7, 8, or 9 (starts with " + raw[0] + " is not allowed).",
      }));
      // Do not allow invalid starting digit into input
      return;
    }

    const cleaned = raw.slice(0, 10);
    const updatedForm = { ...form, phone: cleaned };
    setForm(updatedForm);
    validateField("phone", cleaned, updatedForm);
    if (apiError) setApiError("");
  }

  function handleFocus(field) {
    validateField(field, form[field]);
  }

  function handleBlur(field) {
    validateField(field, form[field]);
  }

  function handleKeyDown(e, field) {
    if (e.key === "Enter") {
      validateField(field, form[field]);
    }
  }

  function validateAll() {
    const fields = isLogin ? ["email", "password"] : ["name", "email", "phone", "password", "confirm"];
    const errs = {};
    let isValid = true;

    for (const f of fields) {
      const err = validateField(f, form[f], form);
      if (err) {
        errs[f] = err;
        isValid = false;
      }
    }

    setFieldErrors(errs);
    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validateAll()) return;

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
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              onKeyDown={(e) => handleKeyDown(e, "name")}
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
            onChange={(e) => handleChange("email", e.target.value)}
            onFocus={() => handleFocus("email")}
            onBlur={() => handleBlur("email")}
            onKeyDown={(e) => handleKeyDown(e, "email")}
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
              onChange={handlePhoneChange}
              onFocus={() => handleFocus("phone")}
              onBlur={() => handleBlur("phone")}
              onKeyDown={(e) => handleKeyDown(e, "phone")}
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
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => handleFocus("password")}
            onBlur={() => handleBlur("password")}
            onKeyDown={(e) => handleKeyDown(e, "password")}
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
              onChange={(e) => handleChange("confirm", e.target.value)}
              onFocus={() => handleFocus("confirm")}
              onBlur={() => handleBlur("confirm")}
              onKeyDown={(e) => handleKeyDown(e, "confirm")}
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
