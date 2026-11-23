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

  function validateField(field, value) {
    let err = "";
    const val = value !== undefined ? value : form[field] || "";

    switch (field) {
      case "name": {
        const trimmed = String(val).trim();
        if (!trimmed) {
          err = "Full name is required";
        } else if (trimmed.length < 2) {
          err = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
          err = "Name should contain letters only";
        }
        break;
      }
      case "email": {
        const trimmed = String(val).trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!trimmed) {
          err = "Email is required";
        } else if (!emailRegex.test(trimmed)) {
          err = "Please enter a valid email address (e.g. name@company.com)";
        }
        break;
      }
      case "phone": {
        const trimmed = String(val).trim();
        if (!trimmed) {
          err = "Mobile number is required";
        } else if (trimmed.startsWith("0")) {
          err = "Mobile number cannot start with 0 (000 is not allowed). Must start with 6, 7, 8, or 9";
        } else if (!/^[6-9]/.test(trimmed)) {
          err = "Mobile number must start with 6, 7, 8, or 9";
        } else if (trimmed.length < 10) {
          err = `Mobile number must be exactly 10 digits (${trimmed.length}/10 entered)`;
        } else if (!/^\d{10}$/.test(trimmed)) {
          err = "Mobile number must be exactly 10 digits";
        } else if (/^([0-9])\1{9}$/.test(trimmed)) {
          err = "Invalid mobile number (all digits cannot be the same)";
        }
        break;
      }
      case "department": {
        if (!val) {
          err = "Department is required";
        }
        break;
      }
      case "role": {
        const trimmed = String(val).trim();
        if (!trimmed) {
          err = "Role is required";
        } else if (trimmed.length < 2) {
          err = "Role must be at least 2 characters";
        }
        break;
      }
      case "salary": {
        if (val === "" || val === null || val === undefined) {
          err = "Salary is required";
        } else if (isNaN(val) || Number(val) <= 0) {
          err = "Salary must be a valid positive amount greater than 0";
        }
        break;
      }
      case "joined": {
        if (!val) {
          err = "Select a joining date";
        } else {
          const year = new Date(val).getFullYear();
          if (isNaN(year) || year < 1970 || year > new Date().getFullYear() + 2) {
            err = "Please select a valid joining date";
          }
        }
        break;
      }
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    validateField(field, value);
  }

  function handlePhoneChange(e) {
    const raw = e.target.value.replace(/\D/g, "");

    // Disallow typing 0 or starting with 0 (e.g. 0, 000)
    if (raw.startsWith("0")) {
      setErrors((prev) => ({
        ...prev,
        phone: "Mobile number cannot start with 0 (000 is not allowed). Must start with 6, 7, 8, or 9.",
      }));
      // Do not allow 0 into input
      return;
    }

    // Disallow digits not starting with 6, 7, 8, 9
    if (raw.length > 0 && !/^[6-9]/.test(raw)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Mobile number must start with 6, 7, 8, or 9 (starts with " + raw[0] + " is not allowed).",
      }));
      // Do not allow invalid starting digit into input
      return;
    }

    const cleaned = raw.slice(0, 10);
    setForm((f) => ({ ...f, phone: cleaned }));
    validateField("phone", cleaned);
  }

  function handleFocus(field) {
    // Show validation error on focus if field has invalid or empty value
    validateField(field, form[field]);
  }

  function handleBlur(field) {
    // Show validation error on blur
    validateField(field, form[field]);
  }

  function handleKeyDown(e, field) {
    if (e.key === "Enter") {
      validateField(field, form[field]);
    }
  }

  function validateAll() {
    const fields = ["name", "email", "phone", "department", "role", "salary", "joined"];
    const newErrors = {};
    let isValid = true;

    for (const f of fields) {
      const err = validateField(f, form[f]);
      if (err) {
        newErrors[f] = err;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validateAll()) {
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
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              onKeyDown={(e) => handleKeyDown(e, "name")}
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
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              onKeyDown={(e) => handleKeyDown(e, "email")}
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
              onChange={handlePhoneChange}
              onFocus={() => handleFocus("phone")}
              onBlur={() => handleBlur("phone")}
              onKeyDown={(e) => handleKeyDown(e, "phone")}
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
              onChange={(e) => handleChange("department", e.target.value)}
              onFocus={() => handleFocus("department")}
              onBlur={() => handleBlur("department")}
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
              onChange={(e) => handleChange("role", e.target.value)}
              onFocus={() => handleFocus("role")}
              onBlur={() => handleBlur("role")}
              onKeyDown={(e) => handleKeyDown(e, "role")}
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
              onChange={(e) => handleChange("salary", e.target.value)}
              onFocus={() => handleFocus("salary")}
              onBlur={() => handleBlur("salary")}
              onKeyDown={(e) => handleKeyDown(e, "salary")}
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
              onChange={(e) => handleChange("joined", e.target.value)}
              onFocus={() => handleFocus("joined")}
              onBlur={() => handleBlur("joined")}
              onKeyDown={(e) => handleKeyDown(e, "joined")}
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
