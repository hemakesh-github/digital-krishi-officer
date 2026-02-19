import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// TODO: Replace with real API call
// async function fetchHistory(token) { return await api.get('/history') }

const DUMMY_HISTORY = [
    {
        id: 1,
        type: 'disease',
        crop: 'Paddy',
        query: 'Uploaded leaf image',
        result: 'Leaf Blight detected (92% confidence)',
        location: null,
        date: '2026-02-18T10:32:00',
    },
    {
        id: 2,
        type: 'advice',
        crop: 'Cotton',
        query: 'Leaves turning yellow and dropping early, possible pest attack',
        result: 'Likely Aphid infestation. Spray Imidacloprid 0.3ml/L. Ensure proper drainage.',
        location: 'Guntur, Andhra Pradesh',
        date: '2026-02-17T15:10:00',
    },
    {
        id: 3,
        type: 'disease',
        crop: 'Tomato',
        query: 'Uploaded leaf image',
        result: 'Early Blight detected (87% confidence)',
        location: null,
        date: '2026-02-16T09:05:00',
    },
    {
        id: 4,
        type: 'advice',
        crop: 'Wheat',
        query: 'Stunted growth, soil looks dry despite irrigation',
        result: 'Possible Zinc deficiency. Apply Zinc Sulphate 25kg/ha. Check irrigation uniformity.',
        location: 'Ludhiana, Punjab',
        date: '2026-02-15T11:48:00',
    },
    {
        id: 5,
        type: 'disease',
        crop: 'Maize',
        query: 'Uploaded leaf image',
        result: 'Northern Leaf Blight detected (78% confidence)',
        location: null,
        date: '2026-02-14T14:22:00',
    },
]

const TYPE_META = {
    disease: {
        label: 'Disease Prediction',
        icon: '🔬',
        badgeCls: 'bg-rose-50 text-rose-600 border-rose-100',
        borderCls: 'border-l-rose-400',
        iconBg: 'bg-rose-50',
    },
    advice: {
        label: 'Crop Advice',
        icon: '🌿',
        badgeCls: 'bg-green-50 text-green-700 border-green-100',
        borderCls: 'border-l-green-500',
        iconBg: 'bg-green-50',
    },
}

function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    })
}

export default function History() {
    const navigate = useNavigate()

    const handleViewDetails = (item) => {
        if (item.type === 'disease') {
            navigate('/disease-result', { state: item })
        } else {
            // TODO: navigate to advice detail page when implemented
            console.log('View advice details for id:', item.id)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-zinc-100 font-sans">
            <Navbar />

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-slate-500 to-gray-700 flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0">
                                🕘
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Query History</h1>
                        </div>
                        <p className="text-gray-500 text-sm mt-1 ml-12 sm:ml-13">
                            All your past disease predictions and crop advice queries
                        </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full">
                        {DUMMY_HISTORY.length} records
                    </span>
                </div>
            </div>

            {/* History list */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-3">
                {DUMMY_HISTORY.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl shadow-sm">
                        <span className="text-5xl">📭</span>
                        <p className="text-gray-400 text-sm font-medium text-center px-4">
                            No queries yet. Start by using Disease Prediction or Crop Advice.
                        </p>
                    </div>
                ) : (
                    DUMMY_HISTORY.map((item) => {
                        const meta = TYPE_META[item.type]
                        return (
                            <div
                                key={item.id}
                                className={`bg-white rounded-2xl shadow-sm border-l-4 ${meta.borderCls} px-4 sm:px-5 py-4 flex gap-3 sm:gap-4 hover:shadow-md transition-shadow duration-200`}
                            >
                                {/* Icon */}
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${meta.iconBg} flex items-center justify-center text-lg sm:text-xl shrink-0 mt-0.5`}>
                                    {meta.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeCls}`}>
                                            {meta.label}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800">{item.crop}</span>
                                        {item.location && (
                                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                                                📍 {item.location}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 mb-2 truncate">
                                        <span className="font-medium text-gray-600">Query: </span>{item.query}
                                    </p>

                                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-500">Result: </span>{item.result}
                                    </div>

                                    {/* On mobile: date + button below content */}
                                    <div className="flex items-center justify-between mt-3 sm:hidden">
                                        <span className="text-[11px] text-gray-400">{formatDate(item.date)}</span>
                                        <button
                                            onClick={() => handleViewDetails(item)}
                                            className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-150
                                                ${item.type === 'disease'
                                                    ? 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100'
                                                    : 'text-green-700 border-green-200 bg-green-50 hover:bg-green-100'
                                                }`}
                                        >
                                            View Details <span className="text-[10px]">→</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Date + Action — desktop only */}
                                <div className="hidden sm:flex flex-col items-end justify-between shrink-0 gap-2 min-w-[110px]">
                                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                        {formatDate(item.date)}
                                    </span>
                                    <button
                                        onClick={() => handleViewDetails(item)}
                                        className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-150
                                            ${item.type === 'disease'
                                                ? 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100'
                                                : 'text-green-700 border-green-200 bg-green-50 hover:bg-green-100'
                                            }`}
                                    >
                                        View Details <span className="text-[10px]">→</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
