import { useState, useRef, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMessages, cropAdviceContinue, sendExpertReply } from '../api_services/api_services'
import { transcribe } from '../api_services/transcription'
import { UserContextData } from '../context/UserContext'
import { useTranslation } from 'react-i18next'
import { toISTTime } from '../utils/dateUtils'


function renderMessage(text) {

    if (typeof text === 'string') {
        return <p>{text}</p>
    }
    const displayFields = ["crop_name", "query", "disease_identified", "recommended_action", "message"]

    const hasDisplayableFields = displayFields.some(key => {
        const value = text[key]
        return value !== undefined && value !== null && value !== ""
    })

    if (!hasDisplayableFields) {
        return <p>{text.msg || ""}</p>
    }

    return (
        <div >
            <div>
                {Object.entries(text).map(([key, value]) => {
                    if (!displayFields.includes(key)) return null
                    if (value === undefined || value === null || value === "") return null

                    return (
                        <>
                            <div
                                key={key + "-label"}
                                className="font-semibold text-gray-500 uppercase w-100% text-left"
                            >
                                {key != "message" ? key.replaceAll("_", " ") : <></>}
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
                    )
                })}
            </div>
        </div>
    )
}



const SENDER = {
    ai: {
        label: 'AI Assistant',
        avatar: '🤖',
        avatarBg: 'from-gray-500 to-gray-700',
        badgeBg: 'bg-gray-100 text-gray-700 border-gray-200',
        bubbleBg: 'bg-gray-50 border border-gray-200 text-gray-900 rounded-bl-none shadow-sm',
        listColor: 'text-gray-500',
    },
    expert: {
        label: 'Expert',
        avatar: '👨‍🌾',
        avatarBg: 'from-amber-500 to-orange-500',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        bubbleBg: 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-none shadow-sm',
        listColor: 'text-amber-500',
    },
    farmer: {
        label: 'Farmer',
        avatar: '🧑‍🌾',
        avatarBg: 'from-blue-400 to-blue-600',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        bubbleBg: 'bg-blue-50 border border-blue-200 text-blue-900 rounded-bl-none shadow-sm',
        listColor: 'text-blue-500',
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

function ChatBubble({ msg, myRole, t }) {
    // Normalize role string (e.g. "Agent" -> "agent", "farmer" -> "farmer", etc.)
    const msgRole = (msg.role || 'ai').toLowerCase()

    // isMine = this message was sent by the currently logged-in user
    // Note: myRole could be 'expert' or 'farmer' depending on user context
    const isMine = msgRole === myRole
    const isExpert = msgRole === 'expert'

    // Determine visual style (ai, expert, or farmer fallback)
    let senderKey = msgRole
    // If we don't have a direct match in SENDER (e.g. for "agent"), default to "ai"
    if (!SENDER[senderKey]) senderKey = 'ai'

    const s = isMine ? null : SENDER[senderKey]

    // Right-side bubble colours
    const myBubbleBg = myRole === 'expert'
        ? 'bg-linear-to-br from-teal-500 to-cyan-600 text-white rounded-br-none'
        : 'bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-br-none'

    // Right-side avatar colours
    const myAvatarBg = myRole === 'expert'
        ? 'bg-linear-to-br from-teal-500 to-cyan-600'
        : 'bg-linear-to-br from-green-500 to-emerald-600'

    return (
        <div className={`flex items-end gap-2 sm:gap-3 px-3 sm:px-6 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            {isMine ? (
                <div className={`w-9 h-9 rounded-full ${myAvatarBg} flex items-center justify-center text-base shrink-0 shadow-sm`}>
                    {myRole === 'expert' ? '👨‍🌾' : '👤'}
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
            <div className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[78%] ${isMine ? 'items-end' : 'items-start'}`}>

                {/* Sender label — only for messages not sent by me */}
                {!isMine && (
                    <div className="flex items-center gap-2 px-1 mb-0.5">
                        <span className="text-xs font-bold text-gray-700">{s.label}</span>
                        {isExpert ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.badgeBg} flex items-center gap-1`}>
                                🏅 {t('chat.expert')}
                            </span>
                        ) : msgRole === 'farmer' || msgRole === 'user' ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                                🧑‍🌾 Farmer
                            </span>
                        ) : (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.badgeBg}`}>
                                🤖 AI Bot
                            </span>
                        )}
                    </div>
                )}

                {/* Bubble */}
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm ${isMine ? myBubbleBg : s.bubbleBg
                    }`}>
                    {isMine
                        ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        : <div className="flex flex-col gap-0.5">{renderMessage(msg.content)}</div>
                    }
                </div>

                {/* Footer: timestamp */}
                <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-gray-400">
                        {msg.created_at ? toISTTime(msg.created_at) : "now"}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default function Chat() {
    const navigate = useNavigate()
    const { search } = useLocation()
    const { t } = useTranslation()
    const params = new URLSearchParams(search)
    const sessionId = params.get("session") || params.get("sessionId")

    const [cropName, setCropName] = useState("")
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [interimText, setInterimText] = useState('')

    const userData = useContext(UserContextData)

    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])

    useEffect(() => {
        async function fetchMessages() {
            try {
                if (!sessionId) return
                const response = await getMessages(sessionId)
                const first = response?.[0]
                const firstContent = first?.content
                setCropName(firstContent?.crop_name || firstContent?.crop || "")
                setMessages(Array.isArray(response) ? response : [])

            }
            catch (err) {
                console.log(err)
            }
        }
        fetchMessages();

    }, [search, sessionId]) // Added sessionId to dependency array

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    useEffect(() => { inputRef.current?.focus() }, [])

    const sendMessage = async (text) => {
        const trimmed = text.trim()
        if (!trimmed) return

        try {
            if (!sessionId) return
            setInput('')
            setInterimText('') // Clear interim text after sending

            // Expert flow: reply to farmer, stay in chat
            if (userData?.type === 'expert') {
                setIsSending(true)
                // Add the expert's message immediately for UI optimism
                setMessages(prev => [...prev, { id: 'temp-' + Date.now(), role: "expert", content: trimmed, created_at: new Date().toISOString() }])
                await sendExpertReply(sessionId, trimmed)

                // Refresh messages from server to get correct IDs/timestamps
                const response = await getMessages(sessionId)
                setMessages(Array.isArray(response) ? response : [])
                setIsSending(false)
                return
            }

            // Farmer flow: continue AI crop advice chat
            setIsTyping(true)
            setIsSending(true)
            setMessages(prev => [...prev, { id: 'temp-' + Date.now(), role: "farmer", content: trimmed, created_at: new Date().toISOString() }])
            await cropAdviceContinue(sessionId, trimmed)
            const response = await getMessages(sessionId)
            const first = response?.[0]
            const firstContent = first?.content
            setCropName(firstContent?.crop_name || firstContent?.crop || "")
            setMessages(Array.isArray(response) ? response : [])
            setIsTyping(false)
            setIsSending(false)
        } catch (err) {
            console.log(err)
            setIsTyping(false)
            setIsSending(false)
        }
    }



    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop()
            setIsRecording(false)
            setInterimText('')
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const mediaRecorder = new MediaRecorder(stream)
                mediaRecorderRef.current = mediaRecorder
                audioChunksRef.current = []

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data)
                }

                mediaRecorder.onstop = async () => {
                    stream.getTracks().forEach(t => t.stop())
                    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
                    const ext = mimeType.includes('webm') ? 'webm' : 'ogg'
                    const blob = new Blob(audioChunksRef.current, { type: mimeType })
                    const formData = new FormData()
                    formData.append('audio_file', blob, `recording.${ext}`)
                    setIsTranscribing(true)
                    try {
                        const result = await transcribe(formData)
                        const text = result?.transcript ?? ''
                        if (text) setInput(prev => prev ? `${prev} ${text}` : text)
                    } catch (error) {
                        console.error('Error transcribing audio:', error)
                        alert(t('chat.transcriptionFailed'))
                    } finally {
                        setIsTranscribing(false)
                    }
                }

                mediaRecorder.start()
                setIsRecording(true)
                // Optional: Implement real-time transcription for interimText if supported by API
            } catch (error) {
                console.error('Error accessing microphone:', error)
                alert(t('chat.micAccessDenied'))
            }
        }
    }

    return (
        <div className="flex-1 w-full flex flex-col">
            {/* ── Sub-header ── */}
            <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-sm gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-gray-700 text-sm font-medium cursor-pointer border-none bg-transparent flex items-center gap-1 transition shrink-0"
                    >
                        ← {t('chat.back')}
                    </button>
                    <div className="w-px h-5 bg-gray-200 shrink-0" />



                    {/* Crop name pill */}
                    {cropName && (
                        <div className="flex gap-1.5 ml-1">
                            <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full font-semibold">🌾 {cropName}</span>
                        </div>
                    )}
                </div>
            </div>



            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
                {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} myRole={userData?.type === 'expert' ? 'expert' : 'farmer'} t={t} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* ── Input bar ── */}
            <div className={`bg-white border-t border-gray-100 px-3 sm:px-5 py-3 shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]
                ${isRecording ? 'border-red-200 bg-red-50/30' : ''}`}>

                {/* Recording / Transcribing status */}
                {(isRecording || isTranscribing) && (
                    <div className="mb-3 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium
                        ${isRecording ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}">
                        <div className="flex items-center gap-2">
                            {isRecording ? (
                                <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span>{t('chat.recording')}...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>Transcribing...</span>
                                </>
                            )}
                        </div>
                        <button onClick={toggleRecording} className="hover:bg-red-100 px-2 py-1 rounded-lg transition cursor-pointer border-none text-red-600">
                            ✕ {t('chat.stop')}
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 sm:gap-3">
                    {/* Mic button */}
                    <button
                        onClick={toggleRecording}
                        title={isRecording ? t('chat.stopRecording') : t('chat.voiceInput')}
                        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-base border-none cursor-pointer transition-all duration-200
                            ${isRecording
                                ? 'bg-red-500 text-white shadow-lg shadow-red-300'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-105'
                            }`}
                    >
                        🎙️
                    </button>

                    {/* Text input */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            isRecording
                                ? t('chat.listening')
                                : (userData?.type === 'expert'
                                    ? t('chat.expertReplyPlaceholder')
                                    : t('chat.farmerQuestionPlaceholder')
                                )
                        }
                        rows={1}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none leading-relaxed
                            ${isRecording
                                ? 'border-red-300 bg-white focus:ring-red-300'
                                : 'border-gray-200 bg-gray-50 focus:ring-green-300'
                            }`}
                        style={{ maxHeight: '120px' }}
                        onInput={e => {
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.scrollHeight, 120) + 'px'
                        }}
                    />

                    {/* Send button */}
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isSending || isTranscribing}
                        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg border-none transition-all duration-150
                            ${input.trim() && !isSending && !isTranscribing
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
