import { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage.jsx";
import Dashboard from "./Dashboard.jsx";
import { logout } from "./auth.js";

export default function App() {
  // Page refresh automatically logs out: user starts as null
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => {
    // Clear any persistent session on refresh/load
    logout();
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    setMode("login");
  }

  function handleRegistered(email) {
    setPrefillEmail(email);
    setNotice("Registration successful! Please log in with your credentials.");
    setMode("login");
  }

  function handleSwitch() {
    setNotice("");
    if (mode === "login") {
      setPrefillEmail("");
      setMode("register");
    } else {
      setMode("login");
    }
  }

  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  return (
    <AuthPage
      key={mode}
      mode={mode}
      notice={notice}
      prefillEmail={prefillEmail}
      onSwitch={handleSwitch}
      onSuccess={setUser}
      onRegistered={handleRegistered}
    />
  );
}
