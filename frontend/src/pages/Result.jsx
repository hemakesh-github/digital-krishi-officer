
import { useState } from "react";
import { escalateQuery } from "../api_services/api_services";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function Result({ result, onHelpful, onEscalate }) {
    const { t } = useTranslation();
    const [showChat, setShowChat] = useState(false);
    const [chat, setChat] = useState([
        { sender: "ai", text: t("ai_response_placeholder") }
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const handleEscalate = async () => {
        const res = await escalateQuery(result?.id || 1);
        onEscalate && onEscalate(res);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMsg = { sender: "user", text: input };
        setChat((c) => [...c, userMsg]);
        setInput("");
        setSending(true);
        // Simulate AI response
        setTimeout(() => {
            setChat((c) => [
                ...c,
                { sender: "ai", text: "Thank you for your follow-up. Our advice: " + input }
            ]);
            setSending(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
            <Header title={t("ai_advice")} showBack />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 border border-green-100">
                    {/* Identified Issue */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-500 text-xl">&#9888;</span>
                        <span className="font-semibold text-lg text-gray-800">{t("identified_issue")}</span>
                    </div>
                    <div className="text-gray-700 mb-4 text-base">
                        {result?.issue || "Your rice crop is showing signs of nitrogen deficiency. The yellowing of leaves (chlorosis) starting from older leaves is a typical symptom."}
                    </div>
                    <hr className="my-2" />
                    {/* Recommendation */}
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <span className="text-green-600 text-xl">&#10003;</span>
                        <span className="font-semibold text-lg text-gray-800">{t("recommendation")}</span>
                    </div>
                    <ul className="list-disc pl-6 text-green-800 mb-4">
                        {(result?.recommendationList || [
                            "Apply Urea fertilizer at 50 kg per acre",
                            "Split application: Half now, half after 15 days",
                            "Ensure adequate water for better nutrient uptake"
                        ]).map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                    <hr className="my-2" />
                    {/* Precautions */}
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <span className="text-blue-600 text-xl">&#128737;</span>
                        <span className="font-semibold text-lg text-gray-800">{t("precautions")}</span>
                    </div>
                    <ul className="list-disc pl-6 text-blue-800 mb-4">
                        {(result?.precautionsList || [
                            "Do not exceed recommended dosage",
                            "Apply early morning or evening",
                            "Monitor crop response after 7-10 days"
                        ]).map((prec, i) => (
                            <li key={i}>{prec}</li>
                        ))}
                    </ul>
                    <hr className="my-2" />
                    {/* Weather Note */}
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <span className="text-orange-500 text-xl">&#9728;</span>
                        <span className="font-semibold text-lg text-gray-800">{t("weather_note")}</span>
                    </div>
                    <div className="text-gray-700 mb-4 text-base">
                        {result?.weatherNote || "Light rain expected in next 3 days. Good time for fertilizer application as it will help nutrient absorption."}
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-4 mt-6">
                        <button className="flex-1 py-3 rounded-xl border border-green-500 bg-white text-green-700 font-semibold text-lg hover:bg-green-50 transition flex items-center justify-center gap-2" onClick={onHelpful}>
                            <span className="text-xl">&#128077;</span> {t("helpful")}
                        </button>
                        <button className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-lg transition flex items-center justify-center gap-2" onClick={handleEscalate}>
                            <span className="text-xl">&#128172;</span> {t("talk_to_officer")}
                        </button>
                        <button className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition flex items-center justify-center gap-2" onClick={() => setShowChat((v) => !v)}>
                            <span className="text-xl">&#128172;</span> {t("follow_up")}
                        </button>
                    </div>
                    {/* Follow Up Chat Section */}
                    {showChat && (
                        <div className="mt-8 border border-blue-100 rounded-xl bg-blue-50 p-4 max-h-80 overflow-y-auto">
                            <div className="mb-2 font-semibold text-blue-700">{t("follow_up_chat")}</div>
                            <div className="flex flex-col gap-2 mb-2">
                                {chat.map((msg, idx) => (
                                    <div key={idx} className={msg.sender === "user" ? "self-end" : "self-start"}>
                                        <div className={`px-3 py-2 rounded-lg text-sm max-w-xs ${msg.sender === "user" ? "bg-green-100 text-green-900" : "bg-white text-gray-800 border"}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form className="flex gap-2 mt-2" onSubmit={handleSend}>
                                <input
                                    className="flex-1 rounded-lg border text-green-900 border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    placeholder={t("type_follow_up")}

                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    disabled={sending}
                                />
                                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition" disabled={sending || !input.trim()}>
                                    {t("send")}
                                </button>
                            </form>
                        </div>
                    )}
                    <button className="w-full mt-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-base hover:bg-gray-200 transition" onClick={onHelpful}>{t("back_to_home")}</button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
