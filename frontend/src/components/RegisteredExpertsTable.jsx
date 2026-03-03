// ── Palette ─────────────────────────────────────────────────────────────
const C = {
    green: "#2eb668",
    amber: "#f59e0b",
    border: "#e4ebe4",
};

// ── Helpers ─────────────────────────────────────────────────────────────
const mask = (no) => { const s = String(no || ""); return s.length >= 4 ? `****${s.slice(-4)}` : s || "—"; };

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

export default function RegisteredExpertsTable({ experts }) {
    return (
        <Card title="🎓 Registered Experts" right={`${experts.length} TOTAL`} style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
            {experts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#c0ccc0", fontSize: 13 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
                    No experts registered yet. Use the form above to add one.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-1">
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                        <thead>
                            <tr>
                                {["#", "Name", "Email", "Status"].map(h => (
                                    <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#a0b0a2", padding: "0 12px 12px 0", textAlign: "left" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {experts.map((e, i) => (
                                <tr key={e.user_id || i}>
                                    <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: "#c0ccc0", fontWeight: 700, borderTop: "1px solid #f0f4f0", width: 28 }}>{i + 1}</td>
                                    <td style={{ padding: "12px 12px 12px 0", fontSize: 13.5, fontWeight: 700, color: "#111", borderTop: "1px solid #f0f4f0" }}>{e.name}</td>
                                    <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: "#aaa", letterSpacing: "0.02em", borderTop: "1px solid #f0f4f0", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email || "—"}</td>
                                    <td style={{ padding: "12px 0 12px 0", borderTop: "1px solid #f0f4f0" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, background: e.is_available ? "#edfbf1" : "#fef2f2", color: e.is_available ? "#16a34a" : "#dc2626" }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.is_available ? "#16a34a" : "#dc2626", display: "inline-block" }} />
                                            {e.is_available ? "Available" : "Offline"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
