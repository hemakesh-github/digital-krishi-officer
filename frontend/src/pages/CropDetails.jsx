
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function CropDetails({ mode, question, crop, onNext }) {
    const [location, setLocation] = useState("");
    const [stage, setStage] = useState("");
    const [detecting, setDetecting] = useState(false);
    const [error, setError] = useState("");
    const { t } = useTranslation();

    const stages = [
        { key: "Sowing", label: t("stage_sowing") },
        { key: "Vegetative", label: t("stage_vegetative") },
        { key: "Flowering", label: t("stage_flowering") },
        { key: "Maturity", label: t("stage_maturity") },
        { key: "Harvest", label: t("stage_harvest") }
    ];
    const isScheme = mode && (mode.id === "scheme" || mode === "scheme");

    const handleDetectLocation = () => {
        setDetecting(true);
        setError("");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Use a free reverse geocoding API (OpenStreetMap Nominatim)
                    try {
                        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await resp.json();
                        const address = data.address;
                        const locString = [address.village, address.town, address.city, address.mandal, address.county, address.state_district, address.state, address.country]
                            .filter(Boolean)
                            .join(", ");
                        setLocation(locString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    } catch (e) {
                        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                    setDetecting(false);
                },
                (err) => {
                    setError(t("error_location_manual"));
                    setDetecting(false);
                }
            );
        } else {
            setError(t("error_location_support"));
            setDetecting(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
            <Header title={t("crop_details_title")} showBack />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 border border-green-100">
                    <h2 className="text-xl font-bold text-green-700 mb-4">{t("tell_us_about_crop")}</h2>
                    <label className="block mb-4">
                        <span className="text-gray-700 font-medium">{t("your_location")}</span>
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                className="flex-1 p-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-800 placeholder-gray-400"
                                placeholder={t("location_placeholder")}
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                disabled={detecting}
                            />
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg font-medium text-sm ${detecting ? "bg-gray-300 text-gray-500" : "bg-green-500 hover:bg-green-600 text-white"}`}
                                onClick={handleDetectLocation}
                                disabled={detecting}

                            >
                                <div className="w-fit flex items-center gap-2">
                                    <img src="/location.svg" alt="Location Icon" className="w-5 h-5" />
                                    {detecting ? t("detecting") : t("use_current_location")}
                                </div>

                            </button>
                        </div>
                        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
                    </label>
                    {!isScheme && (
                        <label className="block mb-4">
                            <span className="text-gray-700 font-medium">{t("stage_of_crop")}</span>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {stages.map(s => (
                                    <button
                                        key={s.key}
                                        type="button"
                                        className={`py-2 px-4 rounded-xl border font-medium text-base transition focus:outline-none focus:ring-2 focus:ring-green-400 ${stage === s.key ? "border-green-600 bg-green-50 text-green-700 shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:bg-green-50"}`}
                                        onClick={() => setStage(s.key)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </label>
                    )}
                    <button
                        className={`w-full py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition ${location && (isScheme || stage) ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-300 cursor-not-allowed"} text-white`}
                        disabled={!location || (!isScheme && !stage)}
                        onClick={() => location && (isScheme || stage) && onNext && onNext({ location, stage })}
                    >
                        {t("continue")}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
