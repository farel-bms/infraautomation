export default function Navbar() {
  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AWS orange accent bar */}
          <span className="block w-1 h-8 rounded bg-orange-500" />
          <div>
            <p className="text-lg font-bold leading-tight">LKS 2026 — User Management</p>
            <p className="text-xs text-slate-400">AWS Academy Learner Lab</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
          Cloud Computing · VPC Peering
        </span>
      </div>
    </nav>
  );
}
