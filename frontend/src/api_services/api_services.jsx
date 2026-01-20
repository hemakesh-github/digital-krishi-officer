import i18n from '../i18n';

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
    const isTe = i18n.language === 'te';
    if (isTe) {
        return {
            id,
            query: id === 1 ? "నా వరి ఆకులు ఎందుకు పసుపు రంగులో ఉన్నాయి?" : "పత్తిపై ఈ పురుగు ఏమిటి?",
            crop: id === 1 ? "వరి" : "పత్తి",
            location: id === 1 ? "గ్రామం A, మండలం B" : "గ్రామం X, మండలం Y",
            stage: id === 1 ? "శాఖీయ దశ" : "పూత దశ",
            mode: id === 1 ? "పంట సమస్య" : "తెగులు / వ్యాధి",
            issue: id === 1 ? "నత్రజని లోపం" : "ఎఫిడ్స్ ముట్టడి",
            recommendation: id === 1 ? "ఎకరానికి 50 కిలోల యూరియా వేయండి" : "సిఫార్సు చేసిన పురుగుమందు పిచికారీ చేయండి",
            precautions: id === 1 ? "మోతాదు మించకూడదు" : "పిచికారీ చేసేటప్పుడు చేతి తొడుగులు ధరించండి",
            weatherNote: id === 1 ? "3 రోజుల్లో వర్షం కురిసే అవకాశం ఉంది" : "వర్షం పడే అవకాశం లేదు",
        };
    }
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
    // Note: The UI might use 'translated' property directly, or we can swap 'name'.
    // Existing logic in getCrops returns both name and translated.
    // Let's keep returning both, but maybe if UI uses name, we might want to swap it?
    // For now, let's assume UI uses 'name'. I should check SelectCrop.jsx later.
    // But per instructions I will just leave it structure wise, maybe translating names if needed.
    // The previous code had "translated" field. I'll stick to that.
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
        { id: "marketprice", label: "Market Price" },
        { id: "mislenous", label: "Miscellaneous" },
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
    const isTe = i18n.language === 'te';
    if (isTe) {
        return {
            issue: "మీ వరి పంట నత్రజని లోపం సంకేతాలను చూపుతోంది. పాత ఆకుల నుండి ఆకులు పసుపు రంగులోకి మారడం (క్లోరోసిస్) ఒక సాధారణ లక్షణం.",
            recommendationList: [
                "ఎకరానికి 50 కిలోల యూరియా ఎరువు వేయండి",
                "విడతల వారీగా: సగం ఇప్పుడు, సగం 15 రోజుల తర్వాత",
                "పోషకాలను బాగా గ్రహించడానికి తగినంత నీరు ఉండేలా చూసుకోండి"
            ],
            precautionsList: [
                "సిఫార్సు చేసిన మోతాదు మించకూడదు",
                "ఉదయం లేదా సాయంత్రం వేళల్లో వేయండి",
                "7-10 రోజుల తర్వాత పంట మార్పును గమనించండి"
            ],
            weatherNote: "రాబోయే 3 రోజుల్లో తేలికపాటి వర్షం కురిసే అవకాశం ఉంది. ఎరువులు వేయడానికి ఇది మంచి సమయం, ఎందుకంటే ఇది పోషకాల శోషణకు సహాయపడుతుంది.",
            confidence: 0.82
        };
    }

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
