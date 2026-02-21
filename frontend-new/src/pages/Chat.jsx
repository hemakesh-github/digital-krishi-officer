import { useState, useRef, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMessages, addMessage, cropAdviceContinue } from '../api_services/api_services'
import { UserContextData } from '../context/UserContext'

// TODO: Replace with real API calls
// async function sendChatMessage({ message, cropName, diseaseName }) { ... }
// async function sendToExpert({ message, cropName }) { ... }

function renderMessage(text) {
    
   console.log(text)   
   if (typeof text === 'string') {
    return <p>{text}</p>
   }
   return (
  <div >
    <div>
      {Object.entries(text).map(([key, value]) => (
        ["query","disease_identified","recommended_action", ].includes(key) ? (
            <>
          <div
            key={key + "-label"}
            className="font-semibold text-gray-500 uppercase w-100% text-left"
          >
            {key.replaceAll("_", " ")}:
          </div>

          <div
            key={key + "-value"}
            className={`col-span-2 text-gray-800 text-left pl-2`}
          >
            {typeof value === "boolean"
              ? value ? "Yes" : "No"
              : String(value)}
          </div>
        </>
        ): key == "msg" ? <span className='col-span-2 text-gray-800'>{value}</span> : null
      ))}
    </div>
  </div>
)
}



// ── Sender meta ───────────────────────────────────────────────────────────────
const SENDER = {
    ai: {
        label: 'AI Assistant',
        avatar: '🤖',
        avatarBg: 'from-green-500 to-emerald-600',
        badgeBg: 'bg-green-100 text-green-700 border-green-200',
        bubbleBg: 'bg-white border border-gray-100 text-gray-800 rounded-bl-none',
        listColor: 'text-green-500',
    },
    expert: {
        label: 'Expert',
        avatar: '👨‍🌾',
        avatarBg: 'from-amber-500 to-orange-500',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        bubbleBg: 'bg-amber-50 border border-amber-100 text-gray-800 rounded-bl-none',
        listColor: 'text-amber-500',
    },
}

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

function ChatBubble({ msg, onFeedback }) {
    const isUser = msg.role === 'farmer'
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
                    </div>
                )}

                {/* Bubble */}
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm
                    ${isUser
                        ? 'bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-br-none'
                        : s.bubbleBg
                    }`}>
                    {isUser
                        ? <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                            {/* {typeof msg.content === 'string' ? JSON.parse(msg.content).query : msg.content.query} */}
                        </p>
                        : <div className="flex flex-col gap-0.5">{renderMessage(msg.content)}</div>
                    }
                </div>

                {/* Footer: timestamp + feedback */}
                <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-gray-400">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : "now"}
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

export default function Chat() {
    const navigate = useNavigate()
    const { search } = useLocation()
    const params = new URLSearchParams(search)
    const sessionId = params.get("session")
    const [cropName, setCropName] = useState("")
    const [messages, setMessages] = useState([])
    const userData = useContext(UserContextData)

    

    let response;
    useEffect(() => {
        async function fetchMessages() {
            try {
                response = await getMessages(sessionId)
                setCropName(response[0].content.crop_name)
                setMessages(response)

            }
            catch (err) {
                console.log(err)
            }
        }
        fetchMessages();
        
    }, [search])


    

    console.log(messages)
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

        try {
            setIsTyping(true)
            setInput('')
            setMessages(prev => [...prev, { role: "farmer", content: trimmed, feedback: null }])
            const reply = await cropAdviceContinue(sessionId, trimmed)
            response = await getMessages(sessionId)
            setCropName(response[0].content.crop_name)
            setMessages(response)
            setIsTyping(false)
        } catch (err) {
            console.log(err)
        }   
        
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


    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">

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

                  

                    {/* Context pills — hidden on xs */}
                    {cropName && (
                        <div className="hidden sm:flex gap-1.5 ml-1">
                            <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full font-semibold">🌾 {cropName}</span>
                        </div>
                    )}
                </div>

            </div>

           

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
                {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} onFeedback={handleFeedback} />
                ))}
                {isTyping && <TypingIndicator />}
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
                                    : 'Type your farming question… (Enter to send · Shift+Enter for new line)'
                        }
                        rows={1}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none leading-relaxed
                            ${isRecording
                                ? 'border-red-300 bg-white focus:ring-red-300'
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
                                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95 shadow-sm shadow-green-200'
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
