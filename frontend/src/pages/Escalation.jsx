export default function Escalation({ escalationStatus, onGoHome }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-6 animate-bounce">📨</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Query Escalated
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          Your query has been sent to an Agriculture Officer
        </p>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
          <p className="text-gray-700 font-semibold mb-2">Current Status:</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">⏳</span>
            <span className="text-xl font-bold text-blue-600">
              {escalationStatus.status === "pending" ? "Pending" : "Replied"}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Query ID: {escalationStatus.queryId}
          </p>
        </div>

        <p className="text-gray-700 mb-8">
          An officer will review your query and provide personalized advice
          within 24 hours. You will be notified when they respond.
        </p>

        <button
          onClick={onGoHome}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
