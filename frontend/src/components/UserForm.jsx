import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const EMPTY_FORM = {
  name:        "",
  email:       "",
  institution: "",
  position:    "",
  phone:       "",
};

const FIELDS = [
  { name: "name",        label: "Full Name",        type: "text",  placeholder: "e.g. Budi Santoso",        required: true },
  { name: "email",       label: "Email Address",    type: "email", placeholder: "e.g. budi@example.com",    required: true },
  { name: "institution", label: "Institution",      type: "text",  placeholder: "e.g. SMK Negeri 1 Purwokerto", required: true },
  { name: "position",    label: "Position / Role",  type: "text",  placeholder: "e.g. Student, Teacher",    required: true },
  { name: "phone",       label: "Phone Number",     type: "tel",   placeholder: "e.g. 08123456789",         required: true },
];

function validate(form) {
  const errors = {};
  if (!form.name.trim())        errors.name        = "Full name is required.";
  if (!form.email.trim())       errors.email       = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                errors.email       = "Please enter a valid email address.";
  if (!form.institution.trim()) errors.institution = "Institution is required.";
  if (!form.position.trim())    errors.position    = "Position is required.";
  if (!form.phone.trim())       errors.phone       = "Phone number is required.";
  return errors;
}

export default function UserForm({ user, onSaved, onCancel }) {
  const isEdit = Boolean(user);
  const [form,     setForm]     = useState(isEdit ? { ...user } : EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev)   => ({ ...prev,   [name]: value }));
    setErrors((prev) => ({ ...prev,   [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError(null);
    try {
      const url    = isEdit ? `${API_URL}/api/users/${user.id}` : `${API_URL}/api/users`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      onSaved();
    } catch (err) {
      setApiError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">
          {isEdit ? "Edit User" : "Add New User"}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {isEdit
            ? "Update the details below and save."
            : "Fill in the form below to register a new user."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {apiError}
          </div>
        )}

        {FIELDS.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              autoComplete="off"
              className={`w-full border rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                ${errors[field.name]
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 bg-white"}`}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add User"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700
              py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
