import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Header({ title, showBack = false, showHistory = false, showLogin = false, showLogout = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    return (
        <header className="w-full h-20 bg-green-700 flex items-center px-6 shadow-lg relative">
            {showBack && (
                <button
                    aria-label="Back"
                    className="absolute left-4 bg-white bg-opacity-90 rounded-full p-2 hover:bg-green-100 transition border border-green-200"
                    onClick={() => navigate(-1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-green-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}
            <span className="w-full text-center text-2xl font-bold tracking-wide text-white">{title}</span>
            <nav className="absolute right-4 flex gap-3 items-center">
                {showHistory && (
                    <button className="text-white hover:underline text-base font-medium" onClick={() => navigate("/history")}>{t("history_title")}</button>
                )}
                {showLogin && location.pathname !== "/login" && (
                    <button className="text-white hover:underline text-base font-medium" onClick={() => navigate("/login")}>{t("login_title")}</button>
                )}
                {showLogout && (
                    <button className="text-white hover:underline text-base font-medium" onClick={() => navigate("/logout")}>{t("logout_title")}</button>
                )}
            </nav>
        </header>
    );
}
