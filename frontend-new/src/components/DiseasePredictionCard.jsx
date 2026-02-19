import { useState, useRef } from 'react'

// TODO: Replace with real API call
// async function predictDisease(imageFile) { ... }

const COMMON_DISEASES = ['Leaf Blight', 'Rust', 'Powdery Mildew', 'Root Rot', 'Mosaic Virus']

export default function DiseasePredictionCard() {
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef()

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const onDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files[0])
    }

    const clearImage = () => {
        setImage(null)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    const handlePredict = () => {
        // TODO: call predictDisease(image) and handle response
        alert('API integration pending')
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-200">

            {/* Header band */}
            <div className="bg-linear-to-r from-rose-500 to-red-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">🔬</div>
                <div>
                    <div className="font-bold text-white text-sm">Disease Prediction</div>
                    <div className="text-rose-100 text-xs mt-0.5">Upload a crop photo for AI diagnosis</div>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Drop zone / Preview */}
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-rose-200 group">
                        <img src={preview} alt="preview" className="w-full h-44 object-cover" />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-md cursor-pointer border-none transition-all duration-150 opacity-0 group-hover:opacity-100"
                            title="Remove image"
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
                        className={`h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                            ${dragging
                                ? 'border-rose-400 bg-rose-50 scale-[1.02]'
                                : 'border-gray-200 bg-gray-50 hover:border-rose-300 hover:bg-rose-50'
                            }`}
                    >
                        <span className="text-4xl">{dragging ? '🎯' : '📷'}</span>
                        <p className="text-sm font-semibold text-gray-600">
                            Drop image here or <span className="text-rose-500">browse</span>
                        </p>
                        <p className="text-xs text-gray-400">JPG · PNG · WEBP</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0])}
                />

                {/* Predict button */}
                <button
                    onClick={handlePredict}
                    disabled={!image}
                    className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-150 border-none
                        ${image
                            ? 'bg-rose-500 hover:bg-rose-600 active:scale-95 cursor-pointer shadow-sm shadow-rose-200'
                            : 'bg-rose-200 cursor-not-allowed'
                        }`}
                >
                    🔍 Predict Disease
                </button>

                {/* Common disease tags */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-gray-400 font-medium">💡 Common diseases detected:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {COMMON_DISEASES.map(tag => (
                            <span key={tag} className="text-[11px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-medium border border-rose-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
