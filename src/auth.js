import { api } from "./api.js";

const SESSION_KEY = "em-session-v1";

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function startSession(user) {
  const session = { id: user.id, name: user.name, email: user.email };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function register({ name, email, password }) {
  const mail = email.trim().toLowerCase();
  const existing = await api.get(`/users?email=${encodeURIComponent(mail)}`);
  if (existing.length) throw new Error("An account with this email already exists.");
  await api.post("/users", { name: name.trim(), email: mail, password: await hash(password) });
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
  sessionStorage.removeItem(SESSION_KEY);
}