import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function MetricsBar() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      try {
        const res = await fetch(`${API_URL}/api/stats/summary`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) { setMetrics(data); setError(false); }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    fetchMetrics();
    const id = setInterval(fetchMetrics, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Don't show the bar at all if the analytics service has never responded
  if (!metrics && !error) return null;

  const items = error
    ? [{ label: "Monitoring", value: "Unavailable", dim: true }]
    : [
        { label: "Total Users",    value: metrics?.total_users    ?? "—" },
        { label: "API Latency",    value: metrics?.latency_ms     ? `${metrics.latency_ms} ms` : "—" },
        { label: "ECS CPU",        value: metrics?.ecs_cpu_pct    ? `${metrics.ecs_cpu_pct}%`  : "—" },
        { label: "Req / min",      value: metrics?.req_per_min    ?? "—" },
        { label: "Active Sessions",value: metrics?.active_sessions ?? "—" },
      ];

  return (
    <div className="bg-slate-700 border-b border-slate-600">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-8 overflow-x-auto">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center min-w-max">
            <span className="text-xs text-slate-400">{item.label}</span>
            <span className={`text-sm font-semibold ${item.dim ? "text-slate-500" : "text-white"}`}>
              {item.value}
            </span>
          </div>
        ))}
        {/* VPC Peering badge */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-teal-400 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
          via VPC Peering
        </div>
      </div>
    </div>
  );
}
