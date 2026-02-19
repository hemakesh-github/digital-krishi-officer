import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// TODO: Replace with real API calls
// async function sendChatMessage({ message, cropName, diseaseName }) { ... }
// async function sendToExpert({ message, cropName }) { ... }

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMessage(text) {
    const lines = text.split('\n')
    const elements = []
    let i = 0
    while (i < lines.length) {
        const line = lines[i]
        if (/^\d+\.\s/.test(line)) {
            const items = []
            while (i < lines.length && /^\d+\.\s/.test(lines[i]))
                items.push(lines[i++].replace(/^\d+\.\s/, ''))
            elements.push(
                <ol key={i} className="list-decimal list-inside flex flex-col gap-1 my-1 pl-1">
                    {items.map((it, j) => <li key={j} className="text-sm leading-relaxed">{inlineBold(it)}</li>)}
                </ol>
            )
            continue
        }
        if (/^[•\-\*]\s/.test(line)) {
            const items = []
            while (i < lines.length && /^[•\-\*]\s/.test(lines[i]))
                items.push(lines[i++].replace(/^[•\-\*]\s/, ''))
            elements.push(
                <ul key={i} className="flex flex-col gap-1 my-1 pl-1">
                    {items.map((it, j) => (
                        <li key={j} className="flex gap-2 text-sm leading-relaxed">
                            <span className="text-green-500 shrink-0 mt-0.5">▸</span>
                            <span>{inlineBold(it)}</span>
                        </li>
                    ))}
                </ul>
            )
            continue
        }
        if (line.trim() === '') { elements.push(<div key={i} className="h-1" />); i++; continue }
        elements.push(<p key={i} className="text-sm leading-relaxed">{inlineBold(line)}</p>)
        i++
    }
    return elements
}

function inlineBold(text) {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
            : part
    )
}

// ── Sender meta ───────────────────────────────────────────────────────────────
const SENDER = {
    ai: {
        label: 'AI Assistant',
        sublabel: 'Automated · Instant',
        avatar: '🤖',
        avatarBg: 'from-green-500 to-emerald-600',
        badgeBg: 'bg-green-100 text-green-700 border-green-200',
        bubbleBg: 'bg-white border border-gray-100 text-gray-800 rounded-bl-none',
        listColor: 'text-green-500',
    },
    expert: {
        label: 'Dr. Ravi Kumar',
        sublabel: 'Verified Agricultural Expert · KVK Guntur',
        avatar: '👨‍🌾',
        avatarBg: 'from-amber-500 to-orange-500',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        bubbleBg: 'bg-amber-50 border border-amber-100 text-gray-800 rounded-bl-none',
        listColor: 'text-amber-500',
    },
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ role = 'ai' }) {
    const s = SENDER[role]
    return (
        <div className="flex items-end gap-3 px-3 sm:px-6">
            <div className={`w-9 h-9 rounded-full bg-linear-to-br ${s.avatarBg} flex items-center justify-center text-base shrink-0 shadow-sm`}>
                {s.avatar}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
                </div>
            </div>
        </div>
    )
}

// ── Chat bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ msg, onFeedback }) {
    const isUser = msg.role === 'user'
    const isExpert = msg.role === 'expert'
    const s = isUser ? null : SENDER[msg.role] || SENDER.ai

    return (
        <div className={`flex items-end gap-2 sm:gap-3 px-3 sm:px-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            {isUser ? (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base shrink-0 shadow-sm">
                    👤
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${s.avatarBg} flex items-center justify-center text-lg shadow-sm ${isExpert ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}>
                        {s.avatar}
                    </div>
                    {/* Expert verified badge */}
                    {isExpert && (
                        <span className="text-[9px] bg-amber-400 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">✓ Expert</span>
                    )}
                </div>
            )}

            {/* Bubble column */}
            <div className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>

                {/* Sender name row (non-user only) */}
                {!isUser && (
                    <div className="flex items-center gap-2 px-1 mb-0.5">
                        <span className="text-xs font-bold text-gray-700">{s.label}</span>
                        {isExpert ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.badgeBg} flex items-center gap-1`}>
                                🏅 Expert
                            </span>
                        ) : (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.badgeBg}`}>
                                🤖 AI Agent
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400">{s.sublabel}</span>
                    </div>
                )}

                {/* Bubble */}
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm
                    ${isUser
                        ? 'bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-br-none'
                        : s.bubbleBg
                    }`}>
                    {isUser
                        ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        : <div className="flex flex-col gap-0.5">{renderMessage(msg.text)}</div>
                    }
                </div>

                {/* Footer: timestamp + feedback */}
                <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-gray-400">
                        {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>

                    {/* Fulfilled / Not Fulfilled — only on AI or Expert messages */}
                    {!isUser && (
                        <div className="flex items-center gap-1">
                            {msg.feedback === 'fulfilled' ? (
                                <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5">
                                    ✅ Helpful
                                </span>
                            ) : msg.feedback === 'not_fulfilled' ? (
                                <span className="text-[11px] text-red-500 font-semibold flex items-center gap-0.5">
                                    ❌ Not helpful
                                </span>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onFeedback(msg.id, 'fulfilled')}
                                        title="This was helpful"
                                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 hover:bg-green-50 px-2 py-0.5 rounded-full border border-transparent hover:border-green-200 transition-all cursor-pointer bg-transparent"
                                    >
                                        👍 Fulfilled
                                    </button>
                                    <button
                                        onClick={() => onFeedback(msg.id, 'not_fulfilled')}
                                        title="This didn't help"
                                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-0.5 rounded-full border border-transparent hover:border-red-200 transition-all cursor-pointer bg-transparent"
                                    >
                                        👎 Not Fulfilled
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Chat page ─────────────────────────────────────────────────────────────────
export default function Chat() {
    const { state: navState } = useLocation()
    const navigate = useNavigate()

    const cropName = navState?.crop || ''
    const diseaseName = navState?.diseaseName || ''

    // 'ai' | 'expert'
    const [mode, setMode] = useState('ai')

    const buildGreeting = (m = 'ai') => {
        const prefix = m === 'expert'
            ? `Namaste! I'm **Dr. Ravi Kumar**, an agricultural expert from KVK Guntur.\n\nI've reviewed your case`
            : `Hello! I'm your **AI Farming Assistant**.`

        if (diseaseName && cropName)
            return `${prefix} — you're dealing with **${diseaseName}** on your **${cropName}** crop.\n\nHow can I help you today? Feel free to ask about:\n• Treatment options\n• Prevention methods\n• Fertilizer recommendations`
        if (cropName)
            return `${prefix}\n\nI'm ready to help with your **${cropName}** crop. What issue are you facing?\n• Pest or disease problems\n• Nutrient deficiencies\n• Irrigation advice`
        return `${prefix}\n\nAsk me anything about:\n• Crop diseases and treatments\n• Fertilizer and nutrient management\n• Irrigation and water stress\n• Pest control methods`
    }

    const [messages, setMessages] = useState(
        navState?.initialMessages
            ? navState.initialMessages
            : [{ id: 1, role: 'ai', text: buildGreeting('ai'), ts: Date.now() }]
    )
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [interimText, setInterimText] = useState('')

    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const recognitionRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    useEffect(() => { inputRef.current?.focus() }, [])

    const sendMessage = async (text) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return

        const userMsg = { id: Date.now(), role: 'user', text: trimmed, ts: Date.now() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // TODO: replace with real API call based on mode:
        // if (mode === 'ai')     reply = await sendChatMessage({ message: trimmed, cropName, diseaseName })
        // if (mode === 'expert') reply = await sendToExpert({ message: trimmed, cropName })
        await new Promise(r => setTimeout(r, mode === 'expert' ? 2200 + Math.random() * 1000 : 1200 + Math.random() * 800))
        const reply = getDummyReply(trimmed, cropName, diseaseName, mode)

        setIsTyping(false)
        setMessages(prev => [...prev, { id: Date.now() + 1, role: mode, text: reply, ts: Date.now(), feedback: null }])
    }

    const handleFeedback = (msgId, value) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: value } : m))
        // TODO: POST feedback to API: api.post('/feedback', { msgId, value })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
    }

    const toggleRecording = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) { alert('Speech recognition is not supported. Please use Chrome.'); return }

        if (isRecording) {
            recognitionRef.current?.stop()
            setIsRecording(false)
            setInterimText('')
            return
        }

        const rec = new SR()
        rec.lang = 'en-IN'
        rec.interimResults = true
        rec.continuous = true
        rec.onresult = (e) => {
            let final = '', interim = ''
            for (const r of e.results) {
                if (r.isFinal) final += r[0].transcript
                else interim += r[0].transcript
            }
            if (final) setInput(prev => (prev + ' ' + final).trim())
            setInterimText(interim)
        }
        rec.onend = () => { setIsRecording(false); setInterimText('') }
        rec.onerror = () => { setIsRecording(false); setInterimText('') }
        recognitionRef.current = rec
        rec.start()
        setIsRecording(true)
    }

    const switchMode = (m) => {
        if (m === mode) return
        setMode(m)
        setMessages([{ id: Date.now(), role: m, text: buildGreeting(m), ts: Date.now(), feedback: null }])
    }

    const clearChat = () => setMessages([{ id: Date.now(), role: mode, text: buildGreeting(mode), ts: Date.now(), feedback: null }])

    const currentSender = SENDER[mode]

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
            <Navbar />

            {/* ── Sub-header ── */}
            <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-sm gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-gray-700 text-sm font-medium cursor-pointer border-none bg-transparent flex items-center gap-1 transition shrink-0"
                    >
                        ← Back
                    </button>
                    <div className="w-px h-5 bg-gray-200 shrink-0" />

                    {/* Active sender info */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br ${currentSender.avatarBg} flex items-center justify-center text-base sm:text-lg shadow-sm ${mode === 'expert' ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}>
                                {currentSender.avatar}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 border-2 border-white rounded-full" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs sm:text-sm leading-tight truncate">{currentSender.label}</div>
                            <div className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">{currentSender.sublabel}</div>
                        </div>
                    </div>

                    {/* Context pills — hidden on xs */}
                    {(cropName || diseaseName) && (
                        <div className="hidden sm:flex gap-1.5 ml-1">
                            {cropName && <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full font-semibold">🌾 {cropName}</span>}
                            {diseaseName && <span className="text-[11px] bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full font-semibold">🔬 {diseaseName}</span>}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                    {/* Mode toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5 sm:gap-1">
                        <button
                            onClick={() => switchMode('ai')}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none
                                ${mode === 'ai' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
                        >
                            🤖 <span className="hidden sm:inline">AI Assistant</span>
                        </button>
                        <button
                            onClick={() => switchMode('expert')}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none
                                ${mode === 'expert' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
                        >
                            👨‍🌾 <span className="hidden sm:inline">Expert</span>
                        </button>
                    </div>

                    <button
                        onClick={clearChat}
                        className="text-[11px] text-gray-400 hover:text-red-500 transition cursor-pointer border-none bg-transparent font-medium"
                    >
                        🗑
                    </button>
                </div>
            </div>

            {/* Expert banner */}
            {mode === 'expert' && (
                <div className="bg-amber-50 border-b border-amber-100 px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-lg shrink-0">👨‍🌾</span>
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-amber-800">Chatting with a verified agricultural expert.</span>
                        <span className="text-xs text-amber-600 ml-1 hidden sm:inline">Responses may take a few minutes. Experts are real humans — not bots.</span>
                    </div>
                    <span className="shrink-0 text-[11px] bg-amber-400 text-white font-bold px-2 py-0.5 rounded-full">🏅 Human</span>
                </div>
            )}

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
                {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} onFeedback={handleFeedback} />
                ))}
                {isTyping && <TypingIndicator role={mode} />}
                <div ref={bottomRef} />
            </div>

            {/* ── Input bar ── */}
            <div className={`bg-white border-t px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] transition-colors duration-300
                ${isRecording ? 'border-red-200 bg-red-50/40' : 'border-gray-100'}`}>

                {/* Recording banner */}
                {isRecording && (
                    <div className="mb-3 flex items-center justify-between bg-red-500 text-white rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-[3px] h-6">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="wave-bar w-1 bg-white/80 rounded-full" />
                                ))}
                            </div>
                            <div>
                                <div className="text-xs font-bold tracking-wide">Recording…</div>
                                {interimText
                                    ? <div className="text-[11px] text-red-100 mt-0.5 max-w-xs truncate italic">"{interimText}"</div>
                                    : <div className="text-[11px] text-red-200 mt-0.5">Speak now in English or Hindi</div>
                                }
                            </div>
                        </div>
                        <button onClick={toggleRecording} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg cursor-pointer border-none text-white transition">
                            ✕ Stop
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* Mic with pulse rings */}
                    <div className="relative shrink-0 flex items-center justify-center">
                        {isRecording && (
                            <>
                                <span className="mic-ring   absolute w-10 h-10 rounded-full bg-red-400 opacity-60" />
                                <span className="mic-ring-2 absolute w-10 h-10 rounded-full bg-red-400 opacity-40" />
                            </>
                        )}
                        <button
                            onClick={toggleRecording}
                            title={isRecording ? 'Stop recording' : 'Voice input'}
                            className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-base border-none cursor-pointer transition-all duration-200
                                ${isRecording
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-300 scale-110'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            🎙️
                        </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            isRecording
                                ? 'Listening… your speech will appear here'
                                : mode === 'expert'
                                    ? 'Ask the expert your farming question…'
                                    : 'Type your farming question… (Enter to send · Shift+Enter for new line)'
                        }
                        rows={1}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none leading-relaxed
                            ${isRecording
                                ? 'border-red-300 bg-white focus:ring-red-300'
                                : mode === 'expert'
                                    ? 'border-amber-200 bg-amber-50/40 focus:ring-amber-300'
                                    : 'border-gray-200 bg-gray-50 focus:ring-green-300'
                            }`}
                        style={{ maxHeight: '120px', overflowY: 'auto' }}
                        onInput={e => {
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                        }}
                    />

                    {/* Send */}
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border-none transition-all duration-150
                            ${input.trim() && !isTyping
                                ? mode === 'expert'
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95 shadow-sm shadow-amber-200'
                                    : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95 shadow-sm shadow-green-200'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Dummy reply generator ─────────────────────────────────────────────────────
function getDummyReply(message, crop, disease, mode) {
    const msg = message.toLowerCase()
    const expertPrefix = mode === 'expert' ? `Namaste! Based on my 15 years of field experience — ` : ''

    if (msg.includes('treat') || msg.includes('spray') || msg.includes('medicine') || msg.includes('cure')) {
        return `${expertPrefix}For **${disease || 'this disease'}** on **${crop || 'your crop'}**, here are the recommended treatments:\n\n1. **Fungicide spray** – Apply Mancozeb 75% WP @ 2g/L of water\n2. **Remove infected leaves** – Prune and destroy affected plant parts\n3. **Improve air circulation** – Avoid dense planting\n4. **Repeat spray** – After 7–10 days if symptoms persist\n\nWould you like dosage details or information on organic alternatives?`
    }
    if (msg.includes('prevent') || msg.includes('avoid') || msg.includes('stop')) {
        return `${expertPrefix}To prevent **${disease || 'crop diseases'}** on **${crop || 'your crop'}**:\n\n• Use certified disease-free seeds\n• Maintain proper spacing between plants\n• Avoid overhead irrigation — use drip instead\n• Apply preventive fungicide at early growth stages\n• Rotate crops every season\n\nPrevention is always more effective than cure! 🌱`
    }
    if (msg.includes('fertilizer') || msg.includes('nutrient') || msg.includes('manure')) {
        return `${expertPrefix}For **${crop || 'your crop'}**, a balanced nutrition plan is key:\n\n• **NPK ratio** – 120:60:60 kg/ha for most cereals\n• **Micronutrients** – Zinc sulphate 25 kg/ha if yellowing is observed\n• **Organic** – FYM (Farm Yard Manure) 10 tonnes/ha before sowing\n\nWould you like a stage-wise fertilizer schedule?`
    }
    if (msg.includes('water') || msg.includes('irrigat')) {
        return `${expertPrefix}Irrigation advice for **${crop || 'your crop'}**:\n\n• Critical stages: germination, flowering, grain filling\n• Avoid waterlogging — ensure proper field drainage\n• Drip irrigation saves 40% water vs flood irrigation\n• Irrigate in early morning or evening to reduce evaporation\n\nIs your field showing signs of waterlogging or drought stress?`
    }
    return `${expertPrefix}Thank you for your question about **${crop ? `your ${crop} crop` : 'your farm'}**.\n\nBased on what you've described, I recommend:\n\n1. Monitor the affected area closely over the next 48 hours\n2. Collect a sample of affected leaves for closer inspection\n3. Ensure proper drainage and avoid over-watering\n\nCould you describe the symptoms in more detail? For example:\n• Are the leaves yellowing, wilting, or showing spots?\n• Is the problem spreading to other plants?\n• When did you first notice this?`
}
