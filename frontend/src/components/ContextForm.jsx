import { useState } from "react";

export default function ContextForm({ onSubmit, mode }) {
  const [crop, setCrop] = useState("rice");
  const [location, setLocation] = useState("Field 1, Village");
  const [stage, setStage] = useState("vegetative");

  const stages = [
    { id: "vegetative", label: "🌱 Vegetative", emoji: "🌱" },
    { id: "flowering", label: "🌸 Flowering", emoji: "🌸" },
    { id: "fruiting", label: "🍃 Fruiting", emoji: "🍃" },
    { id: "maturity", label: "🌾 Maturity", emoji: "🌾" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      crop,
      location,
      stage,
      mode
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Tell us more about your farm
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Crop Selection */}
          <div className="bg-white rounded-lg p-6 shadow">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              What crop are you growing?
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
            >
              <option value="rice">🍚 Rice</option>
              <option value="cotton">🌾 Cotton</option>
              <option value="chilli">🌶️ Chilli</option>
              <option value="maize">🌽 Maize</option>
            </select>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-6 shadow">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              Your Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
              placeholder="Enter your location"
            />
          </div>

          {/* Crop Stage */}
          <div className="bg-white rounded-lg p-6 shadow">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              Crop Stage
            </label>
            <div className="grid grid-cols-2 gap-4">
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    stage === s.id
                      ? "bg-green-600 text-white border-2 border-green-700"
                      : "bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-green-400"
                  }`}
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="text-sm">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
