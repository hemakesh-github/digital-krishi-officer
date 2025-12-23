import { useState } from "react";
import ResultCard from "../components/ResultCard";
import { escalateQuery } from "../api_services/api_services";

export default function Result({ result, onEscalate, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleEscalate = async () => {
    setLoading(true);
    try {
      const escalationResult = await escalateQuery("query_1");
      onEscalate(escalationResult);
    } catch (error) {
      console.error("Escalation error:", error);
    }
    setLoading(false);
  };

  const handleHelpful = () => {
    alert("Thank you for the feedback! 👍");
    onBack();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="fixed top-4 left-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        ← Back
      </button>
      <ResultCard
        result={result}
        onHelpful={handleHelpful}
        onEscalate={handleEscalate}
        loading={loading}
      />
    </div>
  );
}
