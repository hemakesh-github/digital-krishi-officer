import Navbar from '../components/Navbar'
import WeatherCard from '../components/WeatherCard'
import DiseasePredictionCard from '../components/DiseasePredictionCard'
import CropAdviceCard from '../components/CropAdviceCard'

export default function Home() {
    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-100 font-sans">

            <Navbar />

            {/* ── Hero ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Digital <span className="text-green-600">Krishi Officer</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1.5">
                    Your AI-powered agricultural advisor — disease prediction, crop advice &amp; expert guidance
                </p>
            </div>

            {/* ── Main grid: stacks on mobile, side-by-side on lg ── */}
            <div className="max-w-full mx-auto px-4 sm:px-6 pb-12 flex flex-col  gap-5 items-start ">



                <div className="flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <WeatherCard />
                        <DiseasePredictionCard />
                        <CropAdviceCard />
                    </div>
                </div>
            </div>
        </div>
    )
}