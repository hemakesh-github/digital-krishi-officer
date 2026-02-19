import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LocationSelector from './LocationSelector'

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Replace with real API call
// async function fetchCropAdvice({ crop, state, district, city, query }) {
//     const res = await api.post('/crop-advice', { crop, state, district, city, query })
//     return res.data.advice   // string — the AI response
// }
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_TAGS = ['Pest Attack', 'Nutrient Deficiency', 'Waterlogging', 'Drought Stress', 'Yellowing Leaves']

const inputCls = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800
    placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300
    focus:border-transparent transition-all duration-150`

export default function CropAdviceCard() {
    const { state: navState } = useLocation()
    const navigate = useNavigate()

    const [crop, setCrop] = useState(navState?.crop || '')
    const [locState, setLocState] = useState('')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)

    const canSubmit = crop.trim() && locState && district && city && query.trim()

    const appendTag = (tag) => setQuery(q => q ? `${q}, ${tag}` : tag)

    const handleSubmit = async () => {
        if (!canSubmit) return
        setLoading(true)

        // Build a human-readable user message for the chat
        const userMessage = `Crop: ${crop}\nLocation: ${city}, ${district}, ${locState}\nQuery: ${query}`

        // TODO: replace this block with the real API call:
        // const aiReply = await fetchCropAdvice({ crop, state: locState, district, city, query })
        await new Promise(r => setTimeout(r, 1400))   // simulated network delay
        const aiReply = getDummyAdvice(crop, query)

        setLoading(false)

        // Navigate to chat with the initial exchange already populated
        navigate('/chat', {
            state: {
                crop,
                initialMessages: [
                    { id: 1, role: 'user', text: userMessage, ts: Date.now() - 2000 },
                    { id: 2, role: 'ai', text: aiReply, ts: Date.now() },
                ],
            },
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-200">

            {/* Header band */}
            <div className="bg-linear-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">🌿</div>
                <div>
                    <div className="font-bold text-white text-sm">Crop Problem / Advice</div>
                    <div className="text-green-100 text-xs mt-0.5">Expert guidance for your crop issues</div>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Crop name */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Crop Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Paddy, Cotton, Maize..."
                        value={crop}
                        onChange={e => setCrop(e.target.value)}
                        className={inputCls}
                    />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <span>📍</span> Location
                    </label>
                    <LocationSelector
                        accent="focus:ring-green-300"
                        state={locState} setState={setLocState}
                        district={district} setDistrict={setDistrict}
                        city={city} setCity={setCity}
                    />
                </div>

                {/* Query */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Your Query</label>
                    <textarea
                        placeholder="Describe the problem — e.g. leaves turning yellow, stunted growth, pest attack..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                    />
                </div>

                {/* Quick tags */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-gray-400 font-medium">Quick add to query:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => appendTag(tag)}
                                className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium border border-green-100 cursor-pointer hover:bg-green-100 transition-all duration-150"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className={`mt-auto w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-150 border-none flex items-center justify-center gap-2
                        ${canSubmit && !loading
                            ? 'bg-green-600 hover:bg-green-700 active:scale-95 cursor-pointer shadow-sm shadow-green-200'
                            : 'bg-green-200 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Getting advice...
                        </>
                    ) : '💡 Get Advice'}
                </button>
            </div>
        </div>
    )
}

// ── Dummy advice generator (replace with API) ─────────────────────────────────
function getDummyAdvice(crop, query) {
    const q = query.toLowerCase()
    if (q.includes('yellow') || q.includes('nutrient')) {
        return `Based on your query about **${crop}**, the yellowing of leaves is most likely due to **Nitrogen or Zinc deficiency**.\n\n**Recommended actions:**\n1. Apply Urea @ 20 kg/acre as top dressing\n2. Spray Zinc Sulphate 0.5% solution on leaves\n3. Ensure proper drainage to avoid waterlogging\n\nMonitor the crop for 5–7 days after treatment. Would you like to know about organic alternatives?`
    }
    if (q.includes('pest') || q.includes('insect') || q.includes('attack')) {
        return `For **${crop}** pest attack, here is my recommendation:\n\n**Immediate action:**\n• Spray Chlorpyrifos 2ml/L or Imidacloprid 0.3ml/L\n• Remove and destroy heavily infested plant parts\n\n**Preventive measures:**\n• Use sticky yellow traps @ 10/acre\n• Maintain field hygiene — remove crop residues\n• Encourage natural predators like ladybird beetles\n\nWhat type of pest are you seeing? I can give more specific advice.`
    }
    if (q.includes('water') || q.includes('drought') || q.includes('dry')) {
        return `Water stress on **${crop}** can cause serious yield loss. Here's what to do:\n\n**If drought stress:**\n• Irrigate immediately at critical growth stage\n• Apply mulch to conserve soil moisture\n• Spray 1% KCl solution to reduce transpiration\n\n**If waterlogging:**\n• Open drainage channels immediately\n• Avoid further irrigation for 5–7 days\n• Apply Trichoderma to prevent root rot\n\nIs the stress due to excess water or lack of water?`
    }
    return `Thank you for your query about **${crop}**.\n\nBased on the symptoms you described: *"${query}"*\n\n**My assessment:**\n• This could be related to soil nutrient imbalance or early disease onset\n• Collect a soil sample for testing if symptoms persist\n• Ensure proper spacing and air circulation\n\n**Immediate steps:**\n1. Inspect roots for any rot or discolouration\n2. Check soil moisture levels\n3. Apply balanced NPK fertilizer if growth is stunted\n\nFeel free to ask follow-up questions — I'm here to help! 🌱`
}
