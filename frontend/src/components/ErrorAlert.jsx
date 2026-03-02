import { useError } from '../context/ErrorContext'
import { useTranslation } from 'react-i18next'

export default function ErrorAlert() {
    const { errors, removeError } = useError()
    const { t, i18n } = useTranslation()

    if (errors.length === 0) return null

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-32px)] sm:w-auto sm:min-w-[320px] sm:max-w-[420px]">
            {errors.map((error) => (
                <div
                    key={error.id}
                    className="bg-white rounded-xl shadow-lg border-l-4 border-l-red-500 overflow-hidden animate-in slide-in-from-top-5 fade-in duration-300"
                >
                    <div className="p-4 flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg shrink-0">
                            ⚠️
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                    {i18n.language === 'te' ? 'లోపం' : 'Error'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {error.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeError(error.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="h-1 bg-red-100">
                        <div 
                            className="h-full bg-red-500 animate-[shrink_5s_linear_forwards]"
                            style={{ animation: 'shrink 5s linear forwards' }}
                        />
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    )
}
