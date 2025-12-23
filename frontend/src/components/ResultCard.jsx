export default function ResultCard({
  result,
  onHelpful,
  onEscalate,
  loading
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Getting advice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Advisory Result
        </h1>

        <div className="space-y-6">
          {/* Identified Issue */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
            <h2 className="text-lg font-bold text-red-600 mb-2">
              🔴 Identified Issue
            </h2>
            <p className="text-gray-800 text-lg">{result.issue}</p>
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
            <h2 className="text-lg font-bold text-green-600 mb-2">
              ✅ Recommendation
            </h2>
            <p className="text-gray-800 text-lg">{result.recommendation}</p>
          </div>

          {/* Precautions */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
            <h2 className="text-lg font-bold text-yellow-600 mb-2">
              ⚠️ Precautions
            </h2>
            <p className="text-gray-800 text-lg">{result.precautions}</p>
          </div>

          {/* Weather Note */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <h2 className="text-lg font-bold text-blue-600 mb-2">
              ☁️ Weather Note
            </h2>
            <p className="text-gray-800 text-lg">{result.weatherNote}</p>
          </div>

          {/* Confidence Score */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 shadow-md">
            <p className="text-gray-700 font-semibold">
              Confidence Level: <span className="text-2xl text-green-600">{(result.confidence * 100).toFixed(0)}%</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={onHelpful}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>👍</span>
              <span>Helpful</span>
            </button>

            <button
              onClick={onEscalate}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>👨‍🌾</span>
              <span>Talk to Officer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
