import { useState, useEffect } from "react";
import ModeCard from "../components/ModeCard";
import { getModes } from "../api_services/api_services";

export default function Home({ onModeSelect, onShowHistory, onLogout }) {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModes = async () => {
      const data = await getModes();
      setModes(data);
      setLoading(false);
    };
    fetchModes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">🌾</div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Menu */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              What do you need help with?
            </h1>
            <p className="text-gray-600 mt-2">
              Select a category to get personalized advice
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onShowHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              History
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Mode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              onClick={() => onModeSelect(mode)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
