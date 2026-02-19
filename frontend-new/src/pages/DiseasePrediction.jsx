import Navbar from '../components/Navbar'
import DiseasePredictionCard from '../components/DiseasePredictionCard'

export default function DiseasePrediction() {
    return (
        <div className="min-h-screen bg-linear-to-br from-rose-50 via-red-50 to-orange-50 font-sans">
            <Navbar />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-5">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-xl shadow-sm">
                        🔬
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Disease Prediction</h1>
                </div>
                <p className="text-gray-500 text-sm mt-1 ml-13">
                    Upload a clear photo of the affected crop leaf or plant for AI-powered disease diagnosis
                </p>
            </div>

            {/* Content — card centred, max width */}
            <div className="max-w-xl mx-auto px-6 pb-12">
                <DiseasePredictionCard />
            </div>
        </div>
    )
}
