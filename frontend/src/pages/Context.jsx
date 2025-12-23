import { useState } from "react";
import ContextForm from "../components/ContextForm";
import { submitContext } from "../api_services/api_services";

export default function Context({ mode, onContextSubmit, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (contextData) => {
    setLoading(true);
    try {
      await submitContext(contextData);
      onContextSubmit(contextData);
    } catch (error) {
      console.error("Context submission error:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Processing...</p>
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
      <ContextForm onSubmit={handleSubmit} mode={mode.id} />
    </div>
  );
}
