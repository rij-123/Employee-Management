import { useState } from "react";
import AuthPage from "./components/AuthPage.jsx";
import Dashboard from "./Dashboard.jsx";
import { getSession, logout } from "./auth.js";

export default function App() {
  const [user, setUser] = useState(getSession);
  const [mode, setMode] = useState("login");

  function handleLogout() {
    logout();
    setUser(null);
    setMode("login");
  }

  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  return (
    <AuthPage
      key={mode}
      mode={mode}
      onSwitch={() => setMode(mode === "login" ? "register" : "login")}
      onSuccess={setUser}
    />
  );
}
