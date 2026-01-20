import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function AskDoubt({ mode, onNext }) {
    const [question, setQuestion] = useState("");
    const { t } = useTranslation();

    return (
        <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
            <Header title={t("ask_question_title")} showBack />
            <div className="flex-1 flex flex-col items-center justify-center px-2 py-6">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 mb-8">
                    <label className="block text-gray-700 text-base font-medium mb-2">{t("describe_problem")}</label>
                    <textarea
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 min-h-[120px] text-base bg-gray-50 placeholder-gray-400 text-gray-700"
                        placeholder={t("type_question_placeholder")}
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full max-w-xl mb-8">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-green-500 rounded-xl bg-white text-green-700 font-medium text-base hover:bg-green-50 transition">
                        <img src="/mic.svg" alt="Voice Input" className="w-6 h-6" />
                        {t("voice_input")}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-green-500 rounded-xl bg-white text-green-700 font-medium text-base hover:bg-green-50 transition">
                        <img src="/img.svg" alt="" />
                        {t("upload_photo")}
                    </button>
                </div>
                <button
                    className={`w-full max-w-xl py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition ${question.trim() ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-300 cursor-not-allowed"} text-white`}
                    disabled={!question.trim()}
                    onClick={() => {
                        if (question.trim() && onNext) {
                            onNext(question);
                        }
                    }}
                >
                    {t("next")}
                </button>
            </div>
            <Footer />
        </div>
    );
}
