import { useState, useEffect, useCallback } from "react";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { fetchAdminDashboard } from "../../api_services/adminApi";
import AddExpertForm from "../../components/AddExpertForm";
import RegisteredExpertsTable from "../../components/RegisteredExpertsTable";

// ── Palette ─────────────────────────────────────────────────────────────
const C = {
    green: "#2eb668",
    greenD: "#25994f",
    red: "#ef4444",
    amber: "#f59e0b",
    blue: "#3b82f6",
    purple: "#8b5cf6",
    sky: "#38bdf8",
    border: "#e4ebe4",
};



// ── Helpers ─────────────────────────────────────────────────────────────
const mask = (no) => { const s = String(no || ""); return s.length >= 4 ? `****${s.slice(-4)}` : s || "—"; };
const stars = (r) => { const n = Math.round(parseFloat(r) || 0); return "★".repeat(n) + "☆".repeat(5 - n); };

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, bg, accent }) {
    return (
        <div
            style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, transition: "box-shadow 0.18s, transform 0.18s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
            <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1.5px solid ${accent || C.border}` }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#a0b0a2" }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#111", lineHeight: 1.1, marginTop: 3, letterSpacing: "-0.03em" }}>{value ?? "—"}</div>
                {sub && <div style={{ fontSize: 11, color: "#b0bcb0", marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

// ── Card Wrapper ──────────────────────────────────────────────────────────
function Card({ title, right, children, style = {} }) {
    return (
        <div style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${C.border}`, overflow: "hidden", ...style }}>
            <div style={{ padding: "18px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.green }}>{title}</span>
                {right && <span style={{ fontSize: 11, color: "#b0bcb0", fontWeight: 600 }}>{right}</span>}
            </div>
            <div style={{ height: 1.5, background: "#f0f4f0", margin: "14px 22px 0" }} />
            <div style={{ padding: "16px 22px 22px" }}>{children}</div>
        </div>
    );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, boxShadow: "0 4px 16px rgba(0,0,0,0.09)", fontFamily: "inherit" }}>
            {label && <div style={{ fontWeight: 700, color: "#111", marginBottom: 2 }}>{label}</div>}
            {payload.map((p, i) => <div key={i} style={{ color: p.color || "#555", marginTop: 2 }}>{p.name}: <b>{p.value}</b></div>)}
        </div>
    );
}



// ── Expert Requests Breakdown ─────────────────────────────────────────────
function ExpertRequestsCard({ data }) {
    const reqs = data?.expert_requests || {};
    const statuses = [
        { key: "pending", label: "Pending", color: C.amber, icon: "⏳" },
        { key: "answered", label: "Answered", color: C.green, icon: "✅" },
    ];
    const barData = statuses.map(s => ({ name: s.label, value: reqs[s.key] || 0, fill: s.color }));

    return (
        <Card title="📋 Expert Request Pipeline">
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {statuses.map(s => (
                    <div key={s.key} style={{ flex: 1, borderRadius: 12, padding: "12px 10px", background: `${s.color}14`, border: `1.5px solid ${s.color}30`, textAlign: "center" }}>
                        <div style={{ fontSize: 18 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1.1, marginTop: 4 }}>{reqs[s.key] ?? 0}</div>
                        <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={130}>
                <BarChart data={barData} barSize={28} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#aaa", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10.5, fill: "#aaa", fontFamily: "inherit" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f5faf5" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const d = await fetchAdminDashboard();
            setData(d);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to load dashboard. Is the backend running?');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.green}`, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                    <div style={{ color: "#aaa", fontSize: 13.5 }}>Loading dashboard…</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "'Inter', sans-serif", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 36 }}>⚠️</div>
                <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, textAlign: "center", maxWidth: 400 }}>{error}</div>
                <button onClick={load} style={{ padding: "9px 22px", background: C.green, color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    ↻ Retry
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const pieData = [
        { name: "Bot Handled", value: data.bot_sessions || 0, color: C.green },
        { name: "Escalated", value: data.escalated_sessions || 0, color: C.red },
    ].filter(d => d.value > 0);

    const barData = [
        { name: "Users", value: data.total_users || 0, fill: C.blue },
        { name: "Experts", value: data.total_experts || 0, fill: C.purple },
        { name: "Sessions", value: data.total_sessions || 0, fill: C.green },
        { name: "Scans", value: data.total_scans || 0, fill: C.amber },
        { name: "Escalated", value: data.escalated_sessions || 0, fill: C.red },
    ];

    const experts = data.experts || [];

    return (
        <div className="px-4 py-6 sm:px-8 sm:py-8 font-sans antialiased">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-1">System overview — users, experts, sessions &amp; satisfaction metrics</p>
                </div>
                <button onClick={load}
                    style={{ background: C.green }}
                    className="px-4 py-2 text-white text-xs font-bold rounded-xl hover:opacity-90 transition border-none cursor-pointer shrink-0"
                >↻ Refresh</button>
            </div>

            {/* Stat cards — 2 cols on mobile, 4 on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard icon="👤" label="Total Farmers" value={data.total_users} sub="Registered farmers" bg="#eff6ff" accent="#bfdbfe" />
                <StatCard icon="🎓" label="Experts" value={data.total_experts} sub={`${data.available_experts ?? "—"} available`} bg="#f5f3ff" accent="#ddd6fe" />
                <StatCard icon="💬" label="Chat Sessions" value={data.total_sessions} sub="Total sessions" bg="#f0fdfa" accent="#99f6e4" />
                <StatCard icon="🌾" label="Disease Scans" value={data.total_scans} sub="AI detections" bg="#fef9ec" accent="#fde68a" />
                <StatCard icon="🤖" label="Bot Handled" value={data.bot_sessions} sub="Resolved without expert" bg="#edfbf1" accent="#bbf7d0" />
                <StatCard icon="🚨" label="Escalated" value={data.escalated_sessions} sub="Routed to expert" bg="#fef2f2" accent="#fecaca" />
            </div>

            {/* Row 2: Charts stacked on mobile, side-by-side on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-1">
                    <Card title="📊 System Overview">
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={barData} barSize={34} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f5faf5" }} />
                                <Bar dataKey="value" radius={[7, 7, 0, 0]}>
                                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="🍩 Session Breakdown">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={210}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="42%" innerRadius={52} outerRadius={76} dataKey="value" paddingAngle={3} strokeWidth={0}>
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 12.5, fontFamily: "inherit" }} />
                                    <Legend iconType="circle" iconSize={8} formatter={val => <span style={{ fontSize: 11, color: "#666", fontFamily: "inherit" }}>{val}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", color: "#c0ccc0", fontSize: 13, flexDirection: "column", gap: 8 }}>
                                <span style={{ fontSize: 28 }}>🫙</span>No session data yet
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="➕ Add New Expert">
                        <AddExpertForm onAdded={load} />
                    </Card>
                </div>
            </div>

            {/* Row 3: Expert Requests full width */}
            <div className="mb-4">
                <ExpertRequestsCard data={data} />
            </div>

            {/* Row 4: Experts table — scrollable on mobile */}
            <RegisteredExpertsTable experts={experts} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
