import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { detectDisease } from '../api_services/api_services'

export default function DiseasePredictionCard() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const uploadRef = useRef()
    const cameraRef = useRef()

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setImage(file); setPreview(URL.createObjectURL(file)); setResult(null)
    }
    const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
    const clearImage = () => {
        setImage(null); setPreview(null); setResult(null)
        if (uploadRef.current) uploadRef.current.value = ''
        if (cameraRef.current) cameraRef.current.value = ''
    }

    const handlePredict = async () => {
        if (!image) return
        setLoading(true)
        try {
            const data = await detectDisease(image)
            if (data?.success) {
                const conf = parseFloat(String(data.confidence).replace('%', ''))
                setResult({
                    id: data.sessionId,
                    disease: data.disease,
                    confidence: isNaN(conf) ? 0 : conf,
                    imageUrl: data.image_path ? `https://192.168.0.100:8000/${data.image_path}` : null
                })
            }
        } catch (err) {
            console.error('Disease detection failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = () => {
        navigate(`/disease/${result.id}`, {
            state: {
                id: result.id,
                crop: 'Crop',
                result: `${result.disease} detected (${result.confidence}%)`,
                date: new Date().toISOString(),
                imageUrl: result.imageUrl
            }
        })
    }

    return (
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">🔬</div>
                <div>
                    <div className="font-semibold text-foreground text-sm">{t('dashboard.disease.title')}</div>
                    <div className="text-muted-fg text-xs mt-0.5">{t('dashboard.disease.subtitle')}</div>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">

                {/* Preview / Drop zone */}
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border group">
                        <img src={preview} alt="preview" className="w-full h-36 object-cover" />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs shadow cursor-pointer border-none transition-all"
                        >✕</button>
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-3 py-1.5">
                            <p className="text-white text-xs truncate font-medium">{image?.name}</p>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-6 transition-all duration-200
                            ${dragging ? 'border-foreground bg-muted scale-[1.02]' : 'border-border bg-muted'}`}
                    >
                        <span className="text-3xl">{dragging ? '🎯' : '🌿'}</span>
                        <p className="text-xs text-muted-fg text-center leading-relaxed">
                            {t('dashboard.disease.dragDrop')}
                        </p>
                        <div className="flex gap-2 w-full px-4">
                            <button type="button" onClick={() => uploadRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:border-foreground/40 transition-all cursor-pointer">
                                📁 {t('dashboard.disease.browseFiles')}
                            </button>
                            <button type="button" onClick={() => cameraRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:border-foreground/40 transition-all cursor-pointer">
                                📷 {t('dashboard.disease.takePhoto')}
                            </button>
                        </div>
                    </div>
                )}

                <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />

                {/* Mini result */}
                {result && !loading && (
                    <div className="bg-muted rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider">{t('dashboard.disease.detectedLabel')}</p>
                            <p className="text-sm font-bold text-foreground truncate" title={result.disease}>{t(`diseases.${result.disease}`, result.disease)}</p>
                            <p className="text-[11px] text-muted-fg mt-0.5">{result.confidence}% {t('dashboard.disease.confidence')} · {result.severity || t('history.unknown')}</p>
                        </div>
                        {/* Confidence ring */}
                        <div className="shrink-0 w-10 h-10 relative">
                            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                                    strokeDasharray={`${result.confidence * 0.942} 94.2`}
                                    className="text-foreground transition-all duration-700" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{result.confidence}%</span>
                        </div>
                    </div>
                )}

                {/* Predict / View Details button */}
                {result && !loading ? (
                    <button
                        onClick={handleViewDetails}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-foreground text-card hover:bg-foreground/90 active:scale-95 cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-150"
                    >
                        {t('dashboard.disease.viewDetails')}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={handlePredict}
                        disabled={!image || loading}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 border-none flex items-center justify-center gap-2
                            ${image && !loading
                                ? 'bg-foreground text-card hover:bg-foreground/90 active:scale-95 cursor-pointer'
                                : 'bg-muted text-muted-fg cursor-not-allowed border border-border'}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                {t('dashboard.disease.analyzingImage')}
                            </>
                        ) : t('dashboard.disease.predictButton')}
                    </button>
                )}
            </div>
        </div>
    )
}
