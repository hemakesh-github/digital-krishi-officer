import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const DUMMY_RESULT = {
    disease: 'Leaf Blight',
    confidence: 87,
    severity: 'Moderate',
    description: 'Leaf Blight is a fungal disease caused by Helminthosporium oryzae. It typically affects leaves, causing brown lesions with yellow halos that coalesce under humid conditions.',
    treatments: [
        { title: 'Fungicide Application', detail: 'Spray Mancozeb 75 WP @ 2.5 g/L or Carbendazim 50 WP @ 1 g/L. Repeat every 10–14 days.' },
        { title: 'Remove Infected Material', detail: 'Remove and destroy heavily infected leaves to reduce disease spread to healthy tissue.' },
        { title: 'Preventive Measures', detail: 'Maintain proper plant spacing for airflow. Avoid overhead irrigation to keep leaves dry.' },
    ],
}

export default function DiseasePrediction() {
    const { state: navState } = useLocation()

    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(navState?.previewUrl || null)
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(navState?.result || null)
    const inputRef = useRef()

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setImage(file); setPreview(URL.createObjectURL(file)); setResult(null)
    }
    const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
    const clearImage = () => { setImage(null); setPreview(null); setResult(null); if (inputRef.current) inputRef.current.value = '' }
    const handleAnalyze = async () => {
        if (!image) return
        setLoading(true)
        await new Promise(r => setTimeout(r, 2000))
        setResult(DUMMY_RESULT)
        setLoading(false)
    }

    return (
        <div className="animate-fade-in p-6 lg:p-8 min-h-screen">

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">Disease Detection</h1>
                <p className="text-sm text-muted-fg mt-1">
                    Upload a crop photo for AI-powered disease diagnosis
                </p>
            </div>

            {/* ── Split layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* LEFT — Upload */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">📷</div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">Image Upload</div>
                            <div className="text-muted-fg text-xs mt-0.5">Upload a plant image to analyze</div>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
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
                                onClick={() => inputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                className={`h-56 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                                    ${dragging ? 'border-foreground bg-muted scale-[1.02]' : 'border-border bg-muted hover:border-foreground/40'}`}
                            >
                                <span className="text-4xl">{dragging ? '🎯' : '📷'}</span>
                                <p className="text-sm font-semibold text-foreground">
                                    Drag and drop or <span className="underline">click to select</span>
                                </p>
                                <p className="text-xs text-muted-fg">JPG · PNG · WEBP</p>
                            </div>
                        )}
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

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
                                    Analyzing...
                                </>
                            ) : '🔍 Analyze Image'}
                        </button>

                        {/* Model info pills */}
                        <div className="flex flex-wrap gap-2">
                            {[['🤖', 'InceptionV3 CNN'], ['📊', '95.3% Accuracy'], ['🌱', '50+ Diseases']].map(([ico, lbl]) => (
                                <span key={lbl} className="flex items-center gap-1.5 text-[11px] bg-muted text-foreground px-2.5 py-1 rounded-full border border-border font-medium">
                                    <span>{ico}</span>{lbl}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — Results */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">📊</div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">Analysis Results</div>
                            <div className="text-muted-fg text-xs mt-0.5">AI diagnosis output</div>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <svg className="animate-spin w-9 h-9 text-foreground/40" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <p className="text-sm font-semibold text-foreground">Analyzing image...</p>
                                <p className="text-xs text-muted-fg">Running InceptionV3 model</p>
                            </div>
                        ) : result ? (
                            <>
                                {/* Disease + confidence */}
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className="text-[11px] text-muted-fg font-semibold uppercase tracking-wider mb-1">Detected Disease</p>
                                        <h2 className="text-xl font-extrabold text-foreground leading-tight">{result.disease}</h2>
                                        <p className="text-xs text-muted-fg mt-0.5">Severity: <span className="font-semibold text-foreground">{result.severity}</span></p>
                                    </div>
                                    <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-muted text-foreground border border-border">
                                        {result.confidence}% match
                                    </span>
                                </div>

                                {/* Confidence bar */}
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                                    <div
                                        className="h-full bg-foreground rounded-full transition-all duration-700"
                                        style={{ width: `${result.confidence}%` }}
                                    />
                                </div>

                                {/* Description */}
                                <div className="bg-muted rounded-xl p-3.5 border border-border">
                                    <p className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider mb-1.5">Description</p>
                                    <p className="text-sm text-foreground leading-relaxed">{result.description}</p>
                                </div>

                                {/* Treatments */}
                                <div>
                                    <p className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider mb-2.5">Treatment Recommendations</p>
                                    <div className="flex flex-col gap-2.5">
                                        {result.treatments.map((t, i) => (
                                            <div key={i} className="flex gap-3 bg-muted rounded-xl p-3 border border-border">
                                                <div className="w-5 h-5 rounded-full bg-foreground text-card flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">{t.title}</p>
                                                    <p className="text-xs text-muted-fg mt-0.5 leading-relaxed">{t.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-3xl">
                                    🌱
                                </div>
                                <p className="text-sm font-semibold text-foreground">Upload and analyze an image</p>
                                <p className="text-xs text-muted-fg max-w-48">Results will appear here after AI analysis</p>

                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
