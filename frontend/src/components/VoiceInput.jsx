import { useState, useRef } from "react";

export default function VoiceInput({ onSubmit }) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleMicClick = () => {
    // Simulate voice input - fill with dummy text
    const dummyTexts = [
      "My rice crop is showing brown spots on the leaves",
      "There are small insects eating my cotton leaves",
      "I need advice about upcoming weather for my farm",
      "Which government schemes can I apply for?"
    ];
    const randomText =
      dummyTexts[Math.floor(Math.random() * dummyTexts.length)];
    setQuestion(randomText);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("Please describe your problem");
      return;
    }
    await onSubmit({
      question,
      image
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Describe Your Problem
        </h1>
        <p className="text-gray-600 mb-8">
          Tell us what's happening with your crop
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Textarea */}
          <div className="bg-white rounded-lg p-6 shadow">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              What's the problem?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 resize-none"
              rows="5"
              placeholder="Describe your crop problem in detail..."
            />
          </div>

          {/* Voice Input Button */}
          <div className="bg-white rounded-lg p-6 shadow">
            <button
              type="button"
              onClick={handleMicClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🎤</span>
              <span>Tap to record voice message</span>
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              (Simulated - fills with sample text)
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg p-6 shadow">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>Upload image of affected area</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {image && (
              <p className="text-sm text-gray-600 mt-2">
                📁 Selected: {image}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors"
          >
            Get Advice
          </button>
        </form>
      </div>
    </div>
  );
}
