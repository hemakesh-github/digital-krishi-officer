export default function LanguageSelect({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            Select Language
          </h1>
          <p className="text-gray-600">Choose your preferred language</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={() => onSelect("te")}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-6 px-4 rounded-lg text-2xl transition-all transform hover:scale-105 shadow-lg"
          >
            🇮🇳 తెలుగు (Telugu)
          </button>

          <button
            onClick={() => onSelect("en")}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-lg text-2xl transition-all transform hover:scale-105 shadow-lg"
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  );
}
