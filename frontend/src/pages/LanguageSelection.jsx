import { getLanguages } from "../api_services/api_services";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LanguageSelection({ onSelect }) {
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getLanguages().then(setLanguages);
  }, []);

  const handleSelect = (lang) => {
    if (onSelect) onSelect(lang);
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col justify-center items-center bg-linear-to-b from-green-50 to-white z-50 overflow-hidden">
      <div className="flex flex-col items-center mb-8">
        {/* Language icon */}
        <div className="text-green-600 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="72"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 8h14M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2m-7 8 2-3 2 3m-2-3v5"
            />
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20h.01"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-green-800 mb-2 text-center">
          Choose Language
        </h1>
        <p className="text-gray-500 text-lg md:text-xl text-center mb-8">
          Select your preferred language
        </p>
      </div>
      <div className="w-full max-w-lg flex flex-col gap-6 items-center">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleSelect(lang)}
            className="w-full py-5 text-lg md:text-xl border-2 border-green-500 rounded-xl bg-white text-green-700 hover:bg-green-50 transition-all focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm font-medium"
          >
            {lang === "te" ? "తెలుగు (Telugu)" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
}
