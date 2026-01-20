import { useState, useEffect } from "react";
import { loginUser } from "../api_services/api_services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setToken } from "../Auth/auth_utils";

export default function Login({ onLogin }) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { t } = useTranslation();

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            onLogin && onLogin({ success: true, token });
            navigate("/language");
        }
    }, [token, navigate, onLogin]);

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (!userId || !password) {
            setError("Please enter both user ID and password");
            return;
        }
        const res = await loginUser(userId, password);
        if (res.success) {
            setToken(res.token);
            onLogin && onLogin(res);
            navigate("/language");
        } else {
            setError("Invalid credenntials");
        }
    };

    return (
        <div className="fixed inset-0 min-h-screen min-w-full flex flex-col justify-center items-center bg-linear-to-b from-green-50 to-white z-50">
            <div className="flex flex-col items-center mb-8">
                <div className="w-25 h-25 md:w-30 md:h-30 rounded-full border-8 border-green-600 flex items-center justify-center mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full"></div>
                </div>
                <h1 className="text-2xl md:text-3xl font-normal text-green-800 mb-2 text-center">
                    {t("digital_krishi_officer")}
                </h1>
                <p className="text-green-700 text-lg md:text-xl text-center">
                    {t("farmer_advisory_system")}
                </p>
            </div>
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="w-full h-px bg-gray-200 mb-8"></div>
                <div
                    className="w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 flex flex-col items-center"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(60, 120, 60, 0.10)",
                    }}
                >
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div>
                            <label className="block mb-2 text-gray-700 text-lg text-left ">
                                {t("userid")}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                                    <svg
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle cx="12" cy="7" r="4" />
                                        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:outline-none text-lg bg-white placeholder-gray-400  text-black"
                                    placeholder={t("enter_userid")}
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700 text-lg text-left ">
                                {t("password")}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                                    <svg
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        viewBox="0 0 24 24"
                                    >
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:outline-none text-lg bg-white text-black placeholder-gray-400"
                                    placeholder={t("enter_password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-4 rounded-xl shadow-md hover:bg-green-700 transition-colors text-lg font-normal"
                        >
                            {t("login_title")}
                        </button>
                        {error && (
                            <div className="text-red-600 text-center text-base">{error}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
