import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MarketPrices() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-green-700 mb-4">{t("market_price") || "Market Prices"}</h1>
            <p className="text-gray-600 mb-8 text-lg">Market prices feature is coming soon.</p>
            <button
                onClick={() => navigate("/home")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
            >
                {t("back_to_home") || "Back to Home"}
            </button>
        </div>
    );
}
