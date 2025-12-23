// API Abstraction Layer - All API calls centralized here
// Currently using mock/dummy data

export const loginUser = async (userId, password) => {
  // Mock authentication
  return {
    success: true,
    role: "farmer",
    userId: userId
  };
};

export const getLanguages = async () => {
  return ["te", "en"];
};

export const getModes = async () => {
  return [
    { id: "crop", label: "Crop Problem", icon: "🌾" },
    { id: "pest", label: "Pest / Disease", icon: "🐛" },
    { id: "weather", label: "Weather Advice", icon: "☁️" },
    { id: "scheme", label: "Government Schemes", icon: "📋" }
  ];
};

export const submitContext = async (contextData) => {
  // Mock context submission
  console.log("Context submitted:", contextData);
  return { success: true };
};

export const submitQuery = async (queryPayload) => {
  // Mock query response
  return {
    issue: "Rice Blast Disease",
    recommendation: "Spray Tricyclazole @ 0.6 g/L water",
    precautions: "Avoid spraying before rain. Use protective gear.",
    weatherNote: "Rain expected in next 48 hours. Apply fungicide before rain.",
    confidence: 0.82
  };
};

export const escalateQuery = async (queryId) => {
  // Mock escalation
  return {
    status: "pending",
    queryId: queryId,
    message: "Your query has been sent to an Agriculture Officer"
  };
};

export const getHistory = async () => {
  // Mock history data
  return [
    {
      id: 1,
      title: "Rice pest issue",
      status: "AI Answered",
      date: "2025-12-20",
      mode: "pest"
    },
    {
      id: 2,
      title: "Cotton disease problem",
      status: "Officer Pending",
      date: "2025-12-19",
      mode: "crop"
    },
    {
      id: 3,
      title: "Weather prediction for crops",
      status: "Officer Replied",
      date: "2025-12-18",
      mode: "weather"
    },
    {
      id: 4,
      title: "Government crop subsidy schemes",
      status: "AI Answered",
      date: "2025-12-17",
      mode: "scheme"
    }
  ];
};

export const logoutUser = async () => {
  return { success: true };
};
