import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LocationSelector from './LocationSelector'
import { cropAdvice } from '../api_services/api_services'
import { transcribe } from '../api_services/transcription'

export default function CropAdviceCard() {
    const { t } = useTranslation()
    const { state: navState } = useLocation()
    const navigate = useNavigate()

    const [locState, setLocState] = useState('Andhra Pradesh')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [listening, setListening] = useState(false)
    const [transcribing, setTranscribing] = useState(false)

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const canSubmit = locState && district && city && query.trim()

    /* ── Sarvam mic: record → upload → transcribe ── */
    const toggleMic = async () => {
        if (listening) {
            // Stop recording — this triggers ondataavailable + onstop
            mediaRecorderRef.current?.stop()
            setListening(false)
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
            const recorder = new MediaRecorder(stream, { mimeType })
            audioChunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop())
                const blob = new Blob(audioChunksRef.current, { type: mimeType })
                const ext = mimeType.includes('webm') ? 'webm' : 'ogg'
                const formData = new FormData()
                formData.append('audio_file', blob, `recording.${ext}`)

                setTranscribing(true)
                try {
                    const result = await transcribe(formData)
                    const text = result?.transcript ?? ""
                    if (text) setQuery(q => q ? `${q} ${text}` : text)
                } finally {
                    setTranscribing(false)
                }
            }

            mediaRecorderRef.current = recorder
            recorder.start()
            setListening(true)
        } catch {
            alert('Microphone access denied or not available.')
        }
    }

    const handleSubmit = async () => {
        if (!canSubmit) return
        setLoading(true)

        const locationStr = `${city}, ${district}, ${locState}`
        const userLanguage = sessionStorage.getItem('language') || 'en'

        // Call API
        const response = await cropAdvice(locationStr, query, userLanguage)
        setLoading(false)

        if (response) {
            let aiText = response
            // If the backend returns a structured object, format it as markdown
            if (typeof aiText === 'object') {
                const { crop_name, disease_identified, recommended_action, needs_escalation } = aiText
                aiText = `Here is the analysis based on your inputs:\n\n> **Identified Issue:** ${disease_identified || 'Unknown'}\n> **Crop:** ${crop_name}\n\n**Recommendation:**\n${recommended_action}`

                if (needs_escalation) {
                    aiText += `\n\n> ⚠️ **Note:** This issue appears complex and may require expert validation.`
                }
            }
            
            navigate(`/chat?session=${response.sessionId}`)
        } else {
            alert("Sorry, we couldn't get advice at this moment. Please try again.")
        }
    }

    const inputCls = `w-full border border-border rounded-xl px-3 py-2.5 text-sm text-foreground
        placeholder:text-muted-fg bg-card focus:outline-none focus:ring-2 focus:ring-foreground/20
        focus:border-foreground/50 transition-all duration-150`

    return (
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-primary">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                </div>
                <div>
                    <div className="font-semibold text-foreground text-sm">{t('dashboard.advice.title')}</div>
                    <div className="text-muted-fg text-xs mt-0.5">{t('dashboard.advice.subtitle')}</div>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">

                {/* Crop name (hidden/removed, AI will deduce) */}
                {/* 
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider">{t('dashboard.advice.cropNameTitle')}</label>
                    <input
                        type="text"
                        placeholder={t('dashboard.advice.cropNamePlaceholder')}
                        value={crop}
                        onChange={e => setCrop(e.target.value)}
                        className={inputCls}
                    />
                </div>
                */}

                {/* Location */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider">{t('dashboard.advice.locationTitle')}</label>
                    <LocationSelector
                        state={locState} setState={setLocState}
                        district={district} setDistrict={setDistrict}
                        city={city} setCity={setCity}
                    />
                </div>

                {/* Query + mic */}
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider">{t('dashboard.advice.queryTitle')}</label>
                    <textarea
                        placeholder={t('dashboard.advice.queryPlaceholder')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        rows={4}
                        className={`${inputCls} resize-none`}
                    />
                    {/* Prominent voice input button */}
                    <button
                        type="button"
                        onClick={toggleMic}
                        disabled={transcribing}
                        className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer
                            ${transcribing
                                ? 'bg-muted text-muted-fg border-border cursor-not-allowed'
                                : listening
                                    ? 'bg-foreground text-card border-foreground'
                                    : 'bg-muted text-foreground border-border hover:border-foreground/40'}`}
                    >
                        {transcribing ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                {t('dashboard.advice.transcribing')}
                            </>
                        ) : listening ? (
                            <>
                                <span className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                </span>
                                {t('dashboard.advice.recordingTap')}
                            </>
                        ) : (
                            <>
                                {t('dashboard.advice.tapSpeak')}
                            </>
                        )}
                    </button>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 border-none flex items-center justify-center gap-2
                        ${canSubmit && !loading
                            ? 'bg-foreground text-card hover:bg-foreground/90 active:scale-95 cursor-pointer'
                            : 'bg-muted text-muted-fg cursor-not-allowed border border-border'}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            {t('dashboard.advice.gettingAdvice')}
                        </>
                    ) : t('dashboard.advice.getAdvice')}
                </button>
            </div>
        </div>
    )
}
