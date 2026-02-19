import Navbar from '../components/Navbar'
import CropAdviceCard from '../components/CropAdviceCard'

export default function CropAdvice() {
    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">
            <Navbar />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-5">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-sm">
                        🌿
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Crop Problem / Advice</h1>
                </div>
                <p className="text-gray-500 text-sm mt-1 ml-13">
                    Describe your crop issue and get expert AI-powered advice tailored to your location
                </p>
            </div>

            {/* Content — card centred, max width */}
            <div className="max-w-xl mx-auto px-6 pb-12">
                <CropAdviceCard />
            </div>
        </div>
    )
}
