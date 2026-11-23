import { useState } from "react";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "",
  salary: "",
  joined: "",
};

export default function EmployeeForm({ initial, departments, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? { ...EMPTY, department: departments[0] });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function validate() {
    const e = {};
    const nameTrim = form.name.trim();
    if (!nameTrim) {
      e.name = "Full name is required";
    } else if (nameTrim.length < 2) {
      e.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrim)) {
      e.name = "Name should contain letters only";
    }

    const emailTrim = form.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrim) {
      e.email = "Email is required";
    } else if (!emailRegex.test(emailTrim)) {
      e.email = "Please enter a valid email address (e.g. name@company.com)";
    }

    const phoneTrim = (form.phone || "").trim();
    if (!phoneTrim) {
      e.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(phoneTrim)) {
      e.phone = "Mobile number must be exactly 10 digits";
    } else if (!/^[6-9]\d{9}$/.test(phoneTrim)) {
      e.phone = "Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)";
    }

    if (!form.department) {
      e.department = "Department is required";
    }

    const roleTrim = form.role.trim();
    if (!roleTrim) {
      e.role = "Role is required";
    } else if (roleTrim.length < 2) {
      e.role = "Role must be at least 2 characters";
    }

    if (form.salary === "" || form.salary === null || form.salary === undefined) {
      e.salary = "Salary is required";
    } else if (isNaN(form.salary) || Number(form.salary) <= 0) {
      e.salary = "Salary must be a valid positive amount greater than 0";
    }

    if (!form.joined) {
      e.joined = "Select a joining date";
    } else {
      const year = new Date(form.joined).getFullYear();
      if (isNaN(year) || year < 1970 || year > new Date().getFullYear() + 2) {
        e.joined = "Please select a valid joining date";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validate()) {
      onSave({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role.trim(),
        salary: Number(form.salary),
      });
    }
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <h2>{initial ? "Edit Employee" : "Add Employee"}</h2>

        <div className="grid">
          <label className="field">
            <span>Full Name</span>
            <input
              className={`input ${errors.name ? "invalid" : ""}`}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. John Doe"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </label>

          <label className="field">
            <span>Email</span>
            <input
              className={`input ${errors.email ? "invalid" : ""}`}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@company.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </label>

          <label className="field">
            <span>Mobile Number</span>
            <input
              className={`input ${errors.phone ? "invalid" : ""}`}
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digits (e.g. 9876543210)"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </label>

          <label className="field">
            <span>Department</span>
            <select
              className={`input ${errors.department ? "invalid" : ""}`}
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            {errors.department && <span className="error">{errors.department}</span>}
          </label>

          <label className="field">
            <span>Role</span>
            <input
              className={`input ${errors.role ? "invalid" : ""}`}
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Software Engineer"
            />
            {errors.role && <span className="error">{errors.role}</span>}
          </label>

          <label className="field">
            <span>Salary (₹/month)</span>
            <input
              className={`input ${errors.salary ? "invalid" : ""}`}
              type="number"
              min="1"
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
              placeholder="e.g. 50000"
            />
            {errors.salary && <span className="error">{errors.salary}</span>}
          </label>

          <label className="field">
            <span>Joining Date</span>
            <input
              className={`input ${errors.joined ? "invalid" : ""}`}
              type="date"
              value={form.joined}
              onChange={(e) => update("joined", e.target.value)}
            />
            {errors.joined && <span className="error">{errors.joined}</span>}
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary">{initial ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
