import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import EmployeeForm from "./components/EmployeeForm.jsx";
import EmployeeTable from "./components/EmployeeTable.jsx";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Sales", "Marketing", "Operations"];

export default function Dashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'mine'

  useEffect(() => {
    api
      .get("/employees")
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allCount = employees.length;
  const myCount = useMemo(() => {
    return employees.filter(
      (e) => String(e.userId) === String(user.id) || e.addedBy === user.name
    ).length;
  }, [employees, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      // Filter by my employees vs all
      if (viewMode === "mine") {
        const isMine = String(e.userId) === String(user.id) || e.addedBy === user.name;
        if (!isMine) return false;
      }

      const matchDept = dept === "All" || e.department === dept;
      const matchQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        (e.addedBy && e.addedBy.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [employees, query, dept, viewMode, user]);

  const totalSalary = filtered.reduce((sum, e) => sum + Number(e.salary || 0), 0);

  async function handleSave(data) {
    try {
      if (data.id) {
        // Preserving original creator if editing, otherwise assign current user
        const existingEmp = employees.find((e) => e.id === data.id);
        const payload = {
          ...data,
          userId: existingEmp?.userId || data.userId || user.id,
          addedBy: existingEmp?.addedBy || data.addedBy || user.name,
          updatedAt: new Date().toISOString(),
        };
        const saved = await api.put(`/employees/${data.id}`, payload);
        setEmployees((list) => list.map((e) => (e.id === saved.id ? saved : e)));
      } else {
        const payload = {
          ...data,
          userId: user.id,
          addedBy: user.name,
          createdAt: new Date().toISOString(),
        };
        const saved = await api.post("/employees", payload);
        setEmployees((list) => [...list, saved]);
      }
      setError("");
      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save employee.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.del(`/employees/${id}`);
      setEmployees((list) => list.filter((e) => e.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete employee.");
    }
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Employee Management</h1>
          <p className="muted">Manage your team in one place</p>
        </div>
        <div className="header-actions">
          <span className="user-chip">
            <span className="avatar small-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span>{user.name}</span>
          </span>
          <button className="btn primary" onClick={openAdd}>+ Add Employee</button>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{allCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Added by You</span>
          <span className="stat-value" style={{ color: "var(--primary)" }}>{myCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Monthly Payroll</span>
          <span className="stat-value">₹{totalSalary.toLocaleString("en-IN")}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Departments</span>
          <span className="stat-value">{new Set(filtered.map((e) => e.department)).size}</span>
        </div>
      </section>

      <div className="view-toggle">
        <button
          type="button"
          className={`tab-btn ${viewMode === "all" ? "active" : ""}`}
          onClick={() => setViewMode("all")}
        >
          All Employees
          <span className="tab-count">{allCount}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${viewMode === "mine" ? "active" : ""}`}
          onClick={() => setViewMode("mine")}
        >
          Added by Me
          <span className="tab-count">{myCount}</span>
        </button>
      </div>

      <section className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search by name, email, role or who added..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option>All</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </section>

      {error && <div className="form-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p className="muted">Loading employees...</p>
      ) : (
        <EmployeeTable
          employees={filtered}
          currentUser={user}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <EmployeeForm
          initial={editing}
          departments={DEPARTMENTS}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
