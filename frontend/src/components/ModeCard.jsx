export default function ModeCard({ mode, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white hover:bg-green-50 border-2 border-green-200 hover:border-green-500 rounded-lg p-6 text-center transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
    >
      <div className="text-6xl mb-4">{mode.icon}</div>
      <h3 className="text-lg font-bold text-gray-800">{mode.label}</h3>
    </button>
  );
}
