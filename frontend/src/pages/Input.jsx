import { useState } from "react";
import VoiceInput from "../components/VoiceInput";
import { submitQuery } from "../api_services/api_services";

export default function Input({ context, mode, onQuerySubmit, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (inputData) => {
    setLoading(true);
    try {
      const queryPayload = {
        ...context,
        ...inputData,
        mode: mode.id
      };
      const result = await submitQuery(queryPayload);
      onQuerySubmit(result);
    } catch (error) {
      console.error("Query submission error:", error);
    }
    setLoading(false);
  };

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
    <div>
      <button
        onClick={onBack}
        className="fixed top-4 left-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        ← Back
      </button>
      <VoiceInput onSubmit={handleSubmit} />
    </div>
  );
}
