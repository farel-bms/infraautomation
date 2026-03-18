import { useState } from "react";
import Navbar from "./components/Navbar";
import MetricsBar from "./components/MetricsBar";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";

export default function App() {
  // page: "list" | "form"
  const [page, setPage] = useState("list");
  // editUser: null (create mode) | user object (edit mode)
  const [editUser, setEditUser] = useState(null);
  // Increment to force UserList to re-fetch after a save
  const [refresh, setRefresh] = useState(0);

  const handleAdd    = ()  => { setEditUser(null); setPage("form"); };
  const handleEdit   = (u) => { setEditUser(u);    setPage("form"); };
  const handleSaved  = ()  => { setRefresh((r) => r + 1); setPage("list"); };
  const handleCancel = ()  => setPage("list");

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <MetricsBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {page === "list" && (
          <UserList key={refresh} onAdd={handleAdd} onEdit={handleEdit} />
        )}
        {page === "form" && (
          <UserForm
            user={editUser}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}
