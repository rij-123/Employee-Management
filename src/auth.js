import { api } from "./api.js";

const SESSION_KEY = "em-session-v2";

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSession() {
  // Page refresh logs out: never restore session across reloads
  logout();
  return null;
}

function startSession(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register({ name, email, phone, password }) {
  const mail = email.trim().toLowerCase();
  const existing = await api.get(`/users?email=${encodeURIComponent(mail)}`);
  if (existing.length) throw new Error("An account with this email already exists.");
  await api.post("/users", {
    name: name.trim(),
    email: mail,
    phone: phone ? phone.trim() : "",
    password: await hash(password),
  });
}

export async function login({ email, password }) {
  const mail = email.trim().toLowerCase();
  const [user] = await api.get(`/users?email=${encodeURIComponent(mail)}`);
  if (!user || user.password !== (await hash(password))) {
    throw new Error("Incorrect email or password.");
  }
  return startSession(user);
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error("Session remove error:", err);
  }
}
