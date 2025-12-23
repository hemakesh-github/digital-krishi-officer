import { useState, useEffect } from "react";
import HistoryItem from "../components/HistoryItem";
import { getHistory } from "../api_services/api_services";

export default function History({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={onBack}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Query History</h1>
        <p className="text-gray-600 mb-8">
          All your previous queries and their status
        </p>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-600 text-lg">No queries yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onClick={() => alert(`Viewing: ${item.title}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
