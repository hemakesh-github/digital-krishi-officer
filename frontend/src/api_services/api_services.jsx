/**
 * API: getHistoryDetails(id)
 * Input: id: number
 * Output: {
 *   id: number,
 *   query: string,
 *   crop: string,
 *   location: string,
 *   stage: string,
 *   mode: string,
 *   issue: string,
 *   recommendation: string,
 *   precautions: string,
 *   weatherNote: string
 * }
 */
export const getHistoryDetails = async (id) => {
  // Return mock details based on id
  return {
    id,
    query: id === 1 ? "Why are my rice leaves yellow?" : "What is this pest on cotton?",
    crop: id === 1 ? "Rice" : "Cotton",
    location: id === 1 ? "Village A, Mandal B" : "Village X, Mandal Y",
    stage: id === 1 ? "Vegetative" : "Flowering",
    mode: id === 1 ? "Crop Problem" : "Pest / Disease",
    issue: id === 1 ? "Nitrogen deficiency" : "Aphid infestation",
    recommendation: id === 1 ? "Apply Urea fertilizer at 50 kg/acre" : "Spray recommended pesticide",
    precautions: id === 1 ? "Do not exceed dosage" : "Wear gloves while spraying",
    weatherNote: id === 1 ? "Rain expected in 3 days" : "No rain expected",
  };
};
// Dummy crop data for SelectCrop page
/**
 * API: getCrops()
 * Input: none
 * Output: Array<{ id: string, name: string, translated: string }>
 * Example Output:
 * [
 *   { id: "rice", name: "Rice", translated: "బియ్యం" },
 *   { id: "cotton", name: "Cotton", translated: "పత్తి" },
 *   ...
 * ]
 */
export const getCrops = async () => {
  return [
    { id: "rice", name: "Rice", translated: "బియ్యం" },
    { id: "cotton", name: "Cotton", translated: "పత్తి" },
    { id: "chilli", name: "Chilli", translated: "మిరప" },
    { id: "tomato", name: "Tomato", translated: "టమోటా" },
    { id: "onion", name: "Onion", translated: "ఉల్లిపాయ" },
    { id: "wheat", name: "Wheat", translated: "గోధుమ" },
  ];
};
// API Abstraction Layer - All API calls centralized here
// Currently using mock/dummy data

/**
 * API: loginUser(userId, password)
 * Input: userId: string, password: string
 * Output: { success: boolean, role: string }
 */
export const loginUser = async (userId, password) => {
  return { success: true, role: "farmer" };
};

/**
 * API: getLanguages()
 * Input: none
 * Output: Array<string> (e.g., ["te", "en"])
 */
export const getLanguages = async () => {
  return ["te", "en"];
};

/**
 * API: getModes()
 * Input: none
 * Output: Array<{ id: string, label: string }>
 */
export const getModes = async () => {
  return [
    { id: "crop", label: "Crop Problem" },
    { id: "pest", label: "Pest / Disease" },
    { id: "weather", label: "Weather Advice" },
    { id: "scheme", label: "Government Schemes" },
    { id: "mislenous", label: "Miscellaneous" }
  ];
};

/**
 * API: submitContext(contextData)
 * Input: contextData: object
 * Output: { success: boolean }
 */
export const submitContext = async (contextData) => {
  return { success: true };
};

/**
 * API: submitQuery(queryPayload)
 * Input: queryPayload: { question, crop, location, stage, ... }
 * Output: {
 *   issue: string,
 *   recommendationList: string[],
 *   precautionsList: string[],
 *   weatherNote: string,
 *   confidence: number
 * }
 */
export const submitQuery = async (queryPayload) => {
  // Example: parse question/crop for more dynamic advice if needed
  return {
    issue: "Your rice crop is showing signs of nitrogen deficiency. The yellowing of leaves (chlorosis) starting from older leaves is a typical symptom.",
    recommendationList: [
      "Apply Urea fertilizer at 50 kg per acre",
      "Split application: Half now, half after 15 days",
      "Ensure adequate water for better nutrient uptake"
    ],
    precautionsList: [
      "Do not exceed recommended dosage",
      "Apply early morning or evening",
      "Monitor crop response after 7-10 days"
    ],
    weatherNote: "Light rain expected in next 3 days. Good time for fertilizer application as it will help nutrient absorption.",
    confidence: 0.82
  };
};

/**
 * API: escalateQuery(queryId)
 * Input: queryId: string|number
 * Output: { status: string }
 */
export const escalateQuery = async (queryId) => {
  return { status: "pending" };
};

/**
 * API: getHistory()
 * Input: none
 * Output: Array<{ id: number, title: string, status: string }>
 */
export const getHistory = async () => {
  return [
    { id: 1, title: "Rice pest issue", status: "AI Answered" },
    { id: 2, title: "Cotton disease", status: "Officer Pending" }
  ];
};

/**
 * API: logoutUser()
 * Input: none
 * Output: { success: boolean }
 */
export const logoutUser = async () => {
  return { success: true };
};
