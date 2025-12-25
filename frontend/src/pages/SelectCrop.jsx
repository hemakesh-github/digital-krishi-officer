import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCrops } from "../api_services/api_services";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SelectCrop({ mode, question, onNext }) {
  const [crops, setCrops] = useState([]);
  const [selected, setSelected] = useState("");
  const language = (mode && mode.language) || "en";

  useEffect(() => {
    getCrops().then(setCrops);
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
      <Header title="Select Crop" showBack showHistory showLogin showLogout />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 mb-10 border border-green-100">
          <div className="text-green-700 font-semibold text-lg mb-2">Which crop do you grow?</div>
          <div className="text-gray-500 text-base mb-8">Select your crop type</div>
          <div className="flex flex-col gap-5">
            {crops.map((crop) => (
              <button
                key={crop.id}
                className={`w-full py-4 px-5 rounded-2xl border font-semibold text-lg transition flex items-center gap-3 justify-start focus:outline-none focus:ring-2 focus:ring-green-400 ${selected === crop.id ? "border-green-600 bg-green-50 text-green-700 shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:bg-green-50"}`}
                onClick={() => setSelected(crop.id)}
              >
                <span className="flex flex-col items-start">
                  {language === "te" ? (
                    <>
                      <span className="text-base font-bold text-green-800">{crop.translated}</span>
                      <span className="text-xs text-gray-400">{crop.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-bold text-green-800">{crop.name}</span>
                      <span className="text-xs text-gray-400">{crop.translated}</span>
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
        <button
          className={`w-full max-w-xl py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition ${selected ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-300 cursor-not-allowed"} text-white shadow-md`}
          disabled={!selected}
          onClick={() => selected && onNext && onNext(selected)}
        >
          Continue
        </button>
      </div>
      <Footer />
    </div>
  );
}
