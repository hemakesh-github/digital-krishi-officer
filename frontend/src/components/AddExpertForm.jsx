import { useState } from "react";
import { addExpert } from "../api_services/adminApi";

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

// ── Add Expert Form ───────────────────────────────────────────────────────
export default function AddExpertForm({ onAdded }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusName, setFocusName] = useState(false);
    const [focusEmail, setFocusEmail] = useState(false);

    const inputStyle = focused => ({
        width: "100%", padding: "10px 14px",
        border: `1.5px solid ${focused ? C.green : "#dde8dd"}`,
        borderRadius: 9, fontSize: 13.5, fontFamily: "inherit", color: "#111",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        boxSizing: "border-box",
        boxShadow: focused ? "0 0 0 3px rgba(46,182,104,0.12)" : "none",
        background: "#fafcfa",
    });

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleAdd = async () => {
        setStatus(null);
        if (!name.trim() || !email.trim()) { setErrMsg("Please fill in both fields."); setStatus("error"); return; }
        if (!validateEmail(email)) { setErrMsg("Enter a valid email address."); setStatus("error"); return; }
        setLoading(true);
        try {
            const result = await addExpert({ name: name.trim(), email: email.trim() });
            if (result.success) {
                setStatus("success"); setName(""); setEmail("");
                setTimeout(() => { setStatus(null); onAdded?.(); }, 2000);
            } else { setErrMsg(result.message || "Failed to add expert."); setStatus("error"); }
        } catch (err) {
            setErrMsg("Could not reach server. An unexpected error occurred."); setStatus("error");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {status === "success" && <div style={{ background: "#edfbf1", border: "1.5px solid #bbf7d0", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✅ Expert added successfully!</div>}
            {status === "error" && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>❌ {errMsg}</div>}
            <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a9a7c", marginBottom: 5 }}>Full Name</label>
                <input style={inputStyle(focusName)} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Rajan Kumar" onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} />
            </div>
            <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a9a7c", marginBottom: 5 }}>Email Address</label>
                <input
                    type="email"
                    style={inputStyle(focusEmail)}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="expert@example.com"
                    onFocus={() => setFocusEmail(true)}
                    onBlur={() => setFocusEmail(false)}
                />
            </div>
            <button
                onClick={handleAdd} disabled={loading}
                style={{ width: "100%", padding: "11px", background: loading ? "#a7f3d0" : C.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s", marginTop: 4 }}
                onMouseEnter={e => { if (!loading) e.target.style.background = C.greenD; }}
                onMouseLeave={e => { if (!loading) e.target.style.background = C.green; }}
            >
                {loading ? "Adding…" : "＋ Add Expert"}
            </button>
        </div>
    );
}