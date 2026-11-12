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
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a 10-digit phone number";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.salary || Number(form.salary) <= 0) e.salary = "Enter a valid salary";
    if (!form.joined) e.joined = "Select a joining date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validate()) {
      onSave({ ...form, name: form.name.trim(), role: form.role.trim(), salary: Number(form.salary) });
    }
  }

  const field = (label, name, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input
        className={`input ${errors[name] ? "invalid" : ""}`}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        {...props}
      />
      {errors[name] && <span className="error">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <h2>{initial ? "Edit Employee" : "Add Employee"}</h2>

        <div className="grid">
          {field("Full Name", "name", { placeholder: "John Doe" })}
          {field("Email", "email", { type: "email", placeholder: "name@company.com" })}
          {field("Phone", "phone", { inputMode: "numeric", maxLength: 10, placeholder: "9876543210" })}
          <label className="field">
            <span>Department</span>
            <select
              className="input"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          {field("Role", "role", { placeholder: "Software Engineer" })}
          {field("Salary (₹/month)", "salary", { type: "number", min: 0 })}
          {field("Joining Date", "joined", { type: "date" })}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary">{initial ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
