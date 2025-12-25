import { useEffect, useState } from "react";
import { getModes } from "../api_services/api_services";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [modes, setModes] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getModes().then(setModes);
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Header title="Digital Krishi Officer" showHistory showLogin showLogout />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-600 text-base md:text-lg">How can we help you today?</p>
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
            const handleClick = () => {
              if (["crop", "pest", "mislenous"].includes(mode.id)) {
                navigate('/ask-doubt', { state: { mode } });
              } else if (["weather", "scheme"].includes(mode.id)) {
                navigate('/select-crop', { state: { mode } });
              } else {
                navigate('/context', { state: { mode } });
              }
            };
            return (
              <button
                key={mode.id}
                className="flex flex-col items-center justify-center bg-white border-2 border-green-500 rounded-2xl shadow-lg py-8 px-4 w-44 h-44 hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={handleClick}
              >
                <img src={iconFile} alt="icon" className="w-14 h-14 mb-4" />
                <span className="text-lg font-semibold text-green-700 text-center break-words">{mode.label}</span>
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
