import { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const COLS = ["ID", "Name", "Email", "Institution", "Position", "Phone", "Actions"];

export default function UserList({ onAdd, onEdit }) {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers(await res.json());
    } catch (err) {
      setError("Failed to load users. Make sure the API Service is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.institution?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
          />
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <span className="text-lg">⚠</span>
            <div>
              <p className="font-semibold text-sm">Could not load users</p>
              <p className="text-sm mt-0.5">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            {search ? `No users match "${search}".` : "No users yet. Click Add User to get started."}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  {COLS.map((c, i) => (
                    <th
                      key={c}
                      className={`px-4 py-3 text-left font-semibold whitespace-nowrap
                        ${i === 0 ? "rounded-tl-lg" : ""}
                        ${i === COLS.length - 1 ? "rounded-tr-lg text-center" : ""}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-100 hover:bg-blue-50 transition-colors
                      ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.institution}</td>
                    <td className="px-4 py-3 text-slate-600">{user.position}</td>
                    <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(user)}
                          className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleting === user.id}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                        >
                          {deleting === user.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
