import StatusBadge from "./StatusBadge";

export default function HistoryItem({ item, onClick }) {
  const modeIcons = {
    crop: "🌾",
    pest: "🐛",
    weather: "☁️",
    scheme: "📋"
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-500 rounded-lg p-4 text-left transition-all shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800 flex-1">
          <span className="mr-2">{modeIcons[item.mode] || "❓"}</span>
          {item.title}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">📅 {item.date}</p>
      <StatusBadge status={item.status} />
    </button>
  );
}
