import { useState, useEffect, useCallback } from "react";
import AddExpertForm from "../../components/AddExpertForm";
import RegisteredExpertsTable from "../../components/RegisteredExpertsTable";
import { fetchAdminDashboard } from "../../api_services/adminApi";

// ── Palette ─────────────────────────────────────────────────────────────
const C = {
    bg: "#f8faf8",
    cardBg: "#ffffff",
    border: "#e4ebe4"
};

export default function AddExpert() {
    const [experts, setExperts] = useState([]);

    const load = useCallback(async () => {
        try {
            const d = await fetchAdminDashboard();
            setExperts(d.experts || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div style={{ backgroundColor: C.bg, minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ marginBottom: "30px", textAlign: 'center' }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111", marginBottom: "8px", letterSpacing: "-0.03em" }}>Add New Expert</h1>
                    <p style={{ color: "#666", fontSize: "15px" }}>Register a new agricultural expert into the system.</p>
                </div>

                <div style={{
                    background: C.cardBg,
                    borderRadius: "20px",
                    padding: "30px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                    border: `1px solid ${C.border}`,
                    marginBottom: "40px"
                }}>
                    <AddExpertForm onAdded={load} />
                </div>

                <RegisteredExpertsTable experts={experts} />
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
}
