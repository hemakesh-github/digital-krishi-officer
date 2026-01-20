import { useEffect, useState } from "react";
import { getModes } from "../api_services/api_services";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function Home() {
    const [modes, setModes] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        getModes().then(setModes);
    }, []);

    // Map mode IDs to translation keys
    const getModeLabel = (modeId) => {
        switch (modeId) {
            case "crop": return t("crop_problem");
            case "pest": return t("pest_disease");
            case "weather": return t("weather_advice");
            case "scheme": return t("govt_schemes");
            case "marketprice": return t("market_price");
            case "mislenous": return t("miscellaneous");
            default: return modeId;
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-white">
            <Header title={t("digital_krishi_officer")} />
            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
                <div className="mb-8 text-center">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">{t("welcome")}</h2>
                    <p className="text-gray-600 text-base md:text-lg">{t("help_prompt")}</p>
                </div>
                <div
                    className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl justify-items-center"
                >
                    {modes.map((mode) => {
                        let iconFile = "/default.png";
                        if (mode.id === "crop") iconFile = "/crop.svg";
                        else if (mode.id === "pest") iconFile = "/pest.svg";
                        else if (mode.id === "weather") iconFile = "/weather.svg";
                        else if (mode.id === "scheme") iconFile = "/scheme.svg";
                        else if (mode.id === "mislenous") iconFile = "/mislenous.svg";
                        else if (mode.id === "marketprice") iconFile = "/market.png"

                        const handleClick = () => {
                            if (mode.id === "marketprice") {
                                navigate('/market-prices');
                            } else if (["crop", "pest", "mislenous", "scheme"].includes(mode.id)) {
                                navigate('/ask-doubt', { state: { mode } });
                            } else if (mode.id === "weather") {
                                navigate('/select-crop', { state: { mode } });
                            } else {
                                navigate('/ask-doubt', { state: { mode } });
                            }
                        };
                        return (
                            <button
                                key={mode.id}
                                className="flex flex-col items-center justify-center bg-white border-2 border-green-500 rounded-2xl shadow-lg py-8 px-4 w-44 h-44 hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                                onClick={handleClick}
                            >
                                <img src={iconFile} alt="icon" className="w-14 h-14 mb-4" />
                                <span className="text-lg font-semibold text-green-700 text-center break-words">{getModeLabel(mode.id)}</span>
                            </button>
                        );
                    })}
                </div>
            </main>
            <div className="h-8" />
            <Footer />
        </div>
    );
}
