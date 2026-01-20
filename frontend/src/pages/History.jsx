

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getHistory, getHistoryDetails } from "../api_services/api_services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function History({ onBack }) {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        getHistory().then(setHistory);
    }, []);

    const handleView = async (id) => {
        const data = await getHistoryDetails(id);
        // For QueryDetails page, pass all details
        navigate("/query-details", {
            state: {
                details: {
                    ...data,
                    recommendationList: data.recommendation ? [data.recommendation] : [],
                    precautionsList: data.precautions ? [data.precautions] : [],
                }
            }
        });
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
            <Header title={t("history_title")} showBack />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 border border-green-100">
                    <h2 className="text-xl font-bold text-green-700 mb-4">{t("query_history")}</h2>
                    <ul className="divide-y divide-gray-200">
                        {history.map(item => (
                            <li key={item.id} className="py-3 flex flex-row justify-between items-center gap-2">
                                <span className="font-medium text-black">{item.title}</span>
                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200 ml-2">{item.status}</span>
                                <button className="ml-2 px-3 py-1 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition" onClick={() => handleView(item.id)}>{t("view")}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
