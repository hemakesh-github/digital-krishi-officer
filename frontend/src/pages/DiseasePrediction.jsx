import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { detectDisease } from '../api_services/api_services'

const resolveImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    return null
}

export default function DiseasePrediction() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { state: navState } = useLocation()

    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(navState?.previewUrl || null)
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(navState?.result || null)
    const [error, setError] = useState(null)
    const uploadRef = useRef()
    const cameraRef = useRef()

    const handleFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError(t('errors.invalidFileType', 'Please upload a valid image file.'));
            setImage(null); setPreview(null); setResult(null);
            return;
        }

        const MAX_SIZE_MB = 5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(t('errors.fileTooLarge', `File size must be less than ${MAX_SIZE_MB}MB.`));
            setImage(null); setPreview(null); setResult(null);
            return;
        }

        setImage(file); setPreview(URL.createObjectURL(file)); setResult(null); setError(null)
    }
    const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
    const clearImage = () => {
        setImage(null); setPreview(null); setResult(null); setError(null);
        if (uploadRef.current) uploadRef.current.value = ''
        if (cameraRef.current) cameraRef.current.value = ''
    }

    const handleAnalyze = async () => {
        if (!image) return
        setLoading(true)
        setResult(null)
        setError(null)
        try {
            const data = await detectDisease(image)
            if (data?.success) {
                const conf = parseFloat(String(data.confidence).replace('%', ''))
                setResult({
                    id: data.sessionId,
                    disease: data.disease,
                    confidence: isNaN(conf) ? 0 : conf,
                    imageUrl: resolveImageUrl(data.image_path)
                })
            } else {
                setError(data?.userMessage || t('errors.diseaseFriendly'))
            }
        } catch (err) {
            setError(t('errors.diseaseFriendly'))
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = () => {
        if (!result) return
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
        <div className="animate-fade-in p-6 lg:p-8 flex-1">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">{t('dashboard.disease.title')}</h1>
                <p className="text-sm text-muted-fg mt-1">
                    {t('dashboard.disease.pageSubtitle', 'Upload a crop photo for AI-powered disease diagnosis')}
                </p>
            </div>

            {/* ── Split layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* LEFT — Upload */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">📷</div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">{t('dashboard.disease.uploadTitle')}</div>
                            <div className="text-muted-fg text-xs mt-0.5">{t('dashboard.disease.uploadSubtitle')}</div>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4 align-center justify-center">
                        {/* Drop zone / preview */}
                        {preview ? (
                            <div className="relative rounded-xl overflow-hidden border border-border group">
                                <img src={preview} alt="preview" className="w-full h-56 object-cover" />
                                <button
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs shadow cursor-pointer border-none transition-all opacity-0 group-hover:opacity-100"
                                >✕</button>
                                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2">
                                    <p className="text-white text-xs truncate font-medium">{image?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200
                                    ${dragging ? 'border-foreground bg-muted scale-[1.02]' : 'border-border bg-muted'}`}
                            >
                                <span className="text-4xl">{dragging ? '🎯' : '🌿'}</span>
                                <p className="text-sm text-muted-fg text-center leading-relaxed">
                                    {t('dashboard.disease.dragDrop')}
                                </p>
                                <div className="flex gap-2 w-full px-8 mt-2">
                                    <button type="button" onClick={() => uploadRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:border-foreground/40 transition-all cursor-pointer">
                                        📁 {t('dashboard.disease.browseFiles')}
                                    </button>
                                    <button type="button" onClick={() => cameraRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:border-foreground/40 transition-all cursor-pointer">
                                        📷 {t('dashboard.disease.takePhoto')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />

                        {/* Analyze button */}
                        <button
                            onClick={handleAnalyze}
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
                            ) : `🔍 ${t('dashboard.disease.predictButton')}`}
                        </button>
                    </div>
                </div>

                {/* RIGHT — Results */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">📊</div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">{t('dashboard.disease.analysisTitle')}</div>
                            <div className="text-muted-fg text-xs mt-0.5">{t('dashboard.disease.analysisSubtitle')}</div>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <svg className="animate-spin w-9 h-9 text-foreground/40" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <p className="text-sm font-semibold text-foreground">{t('dashboard.disease.analyzingImage')}</p>
                            </div>
                        ) : result ? (
                            <div className="flex-1 flex flex-col">
                                {/* Disease + confidence */}
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className="text-[11px] text-muted-fg font-semibold uppercase tracking-wider mb-1">{t('dashboard.disease.detectedDisease')}</p>
                                        <h2 className="text-xl font-extrabold text-foreground leading-tight">{t(`diseases.${result.disease}`, result.disease)}</h2>
                                    </div>
                                    <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-muted text-foreground border border-border">
                                        {result.confidence}% {t('dashboard.disease.match')}                                  </span>
                                </div>

                                {/* Confidence bar */}
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border mt-4 mb-auto">
                                    <div
                                        className="h-full bg-foreground rounded-full transition-all duration-700"
                                        style={{ width: `${result.confidence}%` }}
                                    />
                                </div>

                                <button
                                    onClick={handleViewDetails}
                                    className="mt-6 w-full py-2.5 rounded-xl font-semibold text-sm bg-foreground text-card hover:bg-foreground/90 active:scale-95 cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-150"
                                >
                                    {t('dashboard.disease.viewDetails')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="text-4xl">⚠️</div>
                                <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                                    <p className="text-sm font-semibold text-amber-800">{t('errors.detectionFailed')}</p>
                                    <p className="text-xs text-amber-700 mt-1">{error}</p>
                                    <p className="text-xs text-amber-700 mt-1">{t('errors.diseaseGuide')}</p>
                                </div>
                                {image && (
                                    <button onClick={handleAnalyze} className="px-4 py-2 bg-foreground text-card text-xs font-semibold rounded-lg hover:bg-foreground/90 transition border-none cursor-pointer">
                                        ↻ {t('dashboard.disease.retry')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-3xl">
                                    🌱
                                </div>
                                <p className="text-sm font-semibold text-foreground">{t('dashboard.disease.uploadAnalyzePrompt')}</p>
                                <p className="text-xs text-muted-fg max-w-48">{t('dashboard.disease.resultsAppearPrompt')}</p>

                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
