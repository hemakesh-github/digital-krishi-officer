import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";

export default function QueryDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { details } = location.state || {};

  // Fallbacks for demo
  const question = details?.query || "Rice crop leaves turning yellow";
  const crop = details?.crop || "Rice";
  const loc = details?.location || "Guntur";
  const stage = details?.stage || "Growing";
  const date = details?.date || "23 Dec 2024";
  const status = details?.status || "Replied";
  const issue = details?.issue || "Your rice crop is showing signs of nitrogen deficiency. The yellowing of leaves (chlorosis) starting from older leaves is a typical symptom.";
  const recommendations = details?.recommendationList || [
    "Apply Urea fertilizer at 50 kg per acre",
    "Split application: Half now, half after 15 days",
    "Ensure adequate water for better nutrient uptake"
  ];
  const precautions = details?.precautionsList || [
    "Do not exceed recommended dosage",
    "Apply early morning or evening",
    "Monitor crop response after 7-10 days"
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
      <Header title="Query Details" showBack />
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        {/* Top Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 border border-green-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {status}
            </div>
            <div className="text-gray-400 text-sm">{date}</div>
          </div>
          <div className="mb-2">
            <div className="text-gray-600 text-xs">Question</div>
            <div className="font-semibold text-lg text-gray-900">{question}</div>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1 text-gray-700"><span role="img" aria-label="crop">🌾</span> Crop <span className="font-semibold ml-1">{crop}</span></div>
            <div className="flex items-center gap-1 text-gray-700"><span role="img" aria-label="location">📍</span> Location <span className="font-semibold ml-1">{loc}</span></div>
            <div className="flex items-center gap-1 text-gray-700"><span role="img" aria-label="stage">🌱</span> Stage <span className="font-semibold ml-1">{stage}</span></div>
          </div>
        </div>
        {/* Officer Response Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 border border-green-100 mb-4">
          <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 16v-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>
            Agricultural Officer Response
          </div>
          <div className="mb-3">
            <div className="font-semibold text-gray-800 mb-1">Identified Issue</div>
            <div className="text-gray-700 text-sm">{issue}</div>
          </div>
          <div className="mb-3">
            <div className="font-semibold text-gray-800 mb-1">Recommendations</div>
            <ul className="list-disc pl-6 text-green-800 text-sm">
              {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-1">Precautions</div>
            <ul className="list-disc pl-6 text-blue-800 text-sm">
              {precautions.map((prec, i) => <li key={i}>{prec}</li>)}
            </ul>
          </div>
        </div>
        {/* Follow-up Button */}
        <button className="w-full max-w-2xl py-3 rounded-xl border border-green-500 bg-white text-green-700 font-semibold text-lg hover:bg-green-50 transition flex items-center justify-center gap-2 mb-3" onClick={() => {}}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Ask Follow-up Question
        </button>
        <button className="w-full max-w-2xl py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-base hover:bg-gray-200 transition" onClick={() => navigate("/home")}>Back to Home</button>
      </main>
      <Footer />
    </div>
  );
}
