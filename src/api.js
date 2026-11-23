export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STORAGE_KEYS = {
  employees: "em_employees_data_v2",
  users: "em_users_data_v2",
};

const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    name: "Rajeshwari Kanojiya",
    email: "rajeshwari.kanojiya@idealake.com",
    phone: "7208417961",
    department: "Engineering",
    role: "Frontend Developer",
    salary: 55000,
    joined: "2023-04-12",
    userId: 1,
    addedBy: "Rajeshwari Kanojiya",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@company.com",
    phone: "9123456780",
    department: "HR",
    role: "HR Manager",
    salary: 70000,
    joined: "2022-09-01",
    userId: 1,
    addedBy: "Rajeshwari Kanojiya",
  },
  {
    id: 3,
    name: "Rohan Mehta",
    email: "rohan@company.com",
    phone: "9988776655",
    department: "Sales",
    role: "Sales Executive",
    salary: 55000,
    joined: "2024-01-20",
    userId: 1,
    addedBy: "Rajeshwari Kanojiya",
  },
  {
    id: 4,
    name: "Kamika Gharth",
    email: "kamika_gharth@gmail.com",
    phone: "7208417962",
    department: "Marketing",
    role: "Marketing Head",
    salary: 150000,
    joined: "2026-12-01",
    userId: 2,
    addedBy: "R K",
  },
];

const DEFAULT_USERS = [
  {
    name: "Rajeshwari Kanojiya",
    email: "rajeshwari.kanojiya@gmail.com",
    password: "3aa23d68e93dbf93f6163ea510202c7104467b7744c379e5cd5b922ed64a73dc",
    id: 1,
  },
  {
    name: "R K",
    email: "rk@gmail.com",
    password: "69758790f9a529071e3957932058735c6781ad1427110864a86521a9eb1b6664",
    id: 2,
  },
];

function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

export const api = {
  async get(path) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        // Sync API response to localStorage cache
        if (path === "/employees" && Array.isArray(data)) {
          setLocal(STORAGE_KEYS.employees, data);
        } else if (path.startsWith("/users") && Array.isArray(data)) {
          const current = getLocal(STORAGE_KEYS.users, DEFAULT_USERS);
          const merged = [...current];
          for (const u of data) {
            const idx = merged.findIndex((m) => m.id === u.id || m.email === u.email);
            if (idx >= 0) merged[idx] = u;
            else merged.push(u);
          }
          setLocal(STORAGE_KEYS.users, merged);
        }
        return data;
      }
    } catch {
      // API server offline - fallback to localStorage
    }

    // Local fallback
    if (path === "/employees") {
      return getLocal(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES);
    }
    if (path.startsWith("/users?email=")) {
      const targetEmail = decodeURIComponent(path.split("email=")[1] || "").toLowerCase();
      const users = getLocal(STORAGE_KEYS.users, DEFAULT_USERS);
      return users.filter((u) => u.email.toLowerCase() === targetEmail);
    }
    if (path === "/users") {
      return getLocal(STORAGE_KEYS.users, DEFAULT_USERS);
    }

    return [];
  },

  async post(path, body) {
    let saved = null;
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        saved = await res.json();
      }
    } catch {
      // API server offline
    }

    if (!saved) {
      saved = { ...body, id: body.id || Date.now() };
    }

    // Always update local cache
    if (path === "/employees") {
      const list = getLocal(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES);
      const updated = [...list.filter((e) => e.id !== saved.id), saved];
      setLocal(STORAGE_KEYS.employees, updated);
    } else if (path === "/users") {
      const list = getLocal(STORAGE_KEYS.users, DEFAULT_USERS);
      const updated = [...list.filter((u) => u.id !== saved.id && u.email !== saved.email), saved];
      setLocal(STORAGE_KEYS.users, updated);
    }

    return saved;
  },

  async put(path, body) {
    let saved = null;
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        saved = await res.json();
      }
    } catch {
      // API server offline
    }

    if (!saved) {
      saved = body;
    }

    if (path.startsWith("/employees/")) {
      const id = saved.id || Number(path.replace("/employees/", ""));
      const list = getLocal(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES);
      const updated = list.map((e) => (e.id === id ? { ...e, ...saved } : e));
      setLocal(STORAGE_KEYS.employees, updated);
    }

    return saved;
  },

  async del(path) {
    try {
      await fetch(`${API_URL}${path}`, { method: "DELETE" });
    } catch {
      // API server offline
    }

    if (path.startsWith("/employees/")) {
      const id = Number(path.replace("/employees/", ""));
      const list = getLocal(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES);
      const updated = list.filter((e) => e.id !== id);
      setLocal(STORAGE_KEYS.employees, updated);
    }

    return null;
  },
};
