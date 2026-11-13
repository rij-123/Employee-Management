import { useState } from "react";
import { login, register } from "../auth.js";

export default function AuthPage({ mode, notice, prefillEmail, onSwitch, onSuccess, onRegistered }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: prefillEmail || "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!isLogin && form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin && form.password !== form.confirm) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    try {
      if (isLogin) {
        onSuccess(await login(form));
      } else {
        await register(form);
        onRegistered(form.email.trim().toLowerCase());
      }
    } catch (err) {
      setError(err.message);
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

        {!isLogin && (
          <label className="field">
            <span>Full name</span>
            <input className="input" value={form.name} onChange={set("name")} autoComplete="name" />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </label>
        {!isLogin && (
          <label className="field">
            <span>Confirm password</span>
            <input className="input" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </label>
        )}

        {notice && <div className="form-success" role="status">{notice}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}

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