import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDiseaseResult } from '../api_services/diseaseApi'
import { toISTDateTime } from '../utils/dateUtils'

const resolveImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    return null
}

export default function DiseaseResult() {
    const { t } = useTranslation()
    const { sessionId } = useParams()
    const { state: navState } = useLocation()
    const navigate = useNavigate()

    const [data, setData] = useState(navState || null)
    const [loading, setLoading] = useState(!navState)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (!data && sessionId) {
            const fetchResult = async () => {
                setLoading(true)
                try {
                    const response = await getDiseaseResult(sessionId)
                    if (response?.success && response.detection) {
                        const det = response.detection
                        // Map backend detection format to what the component expects
                        setData({
                            id: det.id,
                            crop: det.crop || 'Crop', // Default since disease_detection doesn't store crop yet
                            result: `${det.disease} detected (${det.confidence}%)`,
                            date: det.created_at,
                            imageUrl: resolveImageUrl(det.image)
                        })
                    } else {
                        setError('Detection record not found')
                    }
                } catch (err) {
                    setError('Failed to load result')
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
            fetchResult()
        }
    }, [sessionId, data])

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-rose-50 to-red-50 font-sans flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-rose-600 font-bold animate-pulse">{t('diseaseResult.loading', 'Loading Result...')}</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-linear-to-br from-rose-50 to-red-50 font-sans">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 flex flex-col items-center gap-4 text-center">
                    <span className="text-5xl">🔍</span>
                    <h2 className="text-xl font-bold text-gray-700">{error || t('diseaseResult.notFound', 'No result data found')}</h2>
                    <p className="text-gray-400 text-sm">{t('diseaseResult.errorPrompt', 'Please go back and select a query from History.')}</p>
                    <button
                        onClick={() => navigate('/history')}
                        className="mt-2 px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition cursor-pointer border-none"
                    >
                        ← {t('diseaseResult.backToHistory', 'Back to History')}
                    </button>
                </div>
            </div>
        )
    }


    const confidenceMatch = data.result?.match(/\((\d+)%/)
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : null
    const diseaseName = data.result?.replace(/\s*\(\d+%.*?\)/, '').replace(' detected', '').trim()

    const confidenceColor =
        confidence >= 85 ? 'text-red-600 bg-red-50 border-red-200' :
            confidence >= 70 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-gray-600 bg-gray-50 border-gray-200'

    return (
        <div className="flex-1 bg-linear-to-br from-rose-50 via-red-50 to-orange-50 font-sans">

            <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 flex flex-col gap-4 sm:gap-5">

                {/* Back */}
                <button
                    onClick={() => navigate('/history')}
                    className="self-start flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer border-none bg-transparent font-medium"
                >
                    ← {t('diseaseResult.backToHistory', 'Back to History')}
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0">
                        🔬
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{t('diseaseResult.diseaseDetails', 'Disease Prediction Result')}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {data.crop} · {toISTDateTime(data.date)}
                        </p>
                    </div>
                </div>

                {/* Image card */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="bg-gray-100 flex items-center justify-center h-52 sm:h-72 relative">
                        {data.imageUrl ? (
                            <img src={data.imageUrl} alt="Uploaded crop" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <span className="text-5xl sm:text-6xl">🌿</span>
                                <p className="text-sm font-medium">{t('diseaseResult.noImage', 'Image not available')}</p>
                                <p className="text-xs text-gray-300">{t('diseaseResult.storageComing', 'Image storage coming with API integration')}</p>
                            </div>
                        )}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            🌾 {data.crop}
                        </span>
                    </div>

                    {/* Result section */}
                    <div className="p-4 sm:p-5 flex flex-col gap-4">

                        {/* Disease name */}
                        <div>
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{t('diseaseResult.detectedDisease', 'Detected Disease')}</div>
                            <div className="text-lg sm:text-xl font-extrabold text-gray-900">{t(`diseases.${diseaseName}`, diseaseName)}</div>
                        </div>

                        {/* Confidence bar */}
                        {confidence !== null && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{t('diseaseResult.confidence', 'Confidence')}</span>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${confidenceColor}`}>
                                        {confidence}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ${confidence >= 85 ? 'bg-rose-500' :
                                            confidence >= 70 ? 'bg-amber-400' : 'bg-gray-400'
                                            }`}
                                        style={{ width: `${confidence}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Full result text */}
                        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                            <span className="font-semibold text-rose-600">{t('diseaseResult.aiResult', 'AI Result')}: </span>
                            {t(`diseases.${diseaseName}`, diseaseName)} {t('dashboard.disease.detectedLabel', 'detected').toLowerCase()} {confidence}
                        </div>
                    </div>
                </div>



            </div>
        </div>
    )
}
