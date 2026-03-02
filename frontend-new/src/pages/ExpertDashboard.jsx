import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExpertDashboard } from '../api_services/api_services'
import { useTranslation } from 'react-i18next'

// ── Helpers ──────────────────────────────────────────────────────────────
function timeAgo(iso) {
    if (!iso) return '—'
    const h = (Date.now() - new Date(iso)) / 36e5
    if (h < 1) return `${Math.round(h * 60)}m ago`
    if (h < 24) return `${Math.round(h)}h ago`
    if (h < 48) return 'Yesterday'
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function maskMobile(no) {
    const s = String(no || '')
    return s.length >= 4 ? `+91 ****${s.slice(-4)}` : (s || '—')
}

function cropEmoji(crop) {
    const m = { rice: '🌾', wheat: '🌾', paddy: '🌾', cotton: '🌿', tomato: '🍅', sugarcane: '🎋', banana: '🍌', groundnut: '🥜', turmeric: '🟡', maize: '🌽', chilli: '🌶️' }
    return m[String(crop || '').toLowerCase()] || '🌱'
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ emoji, label, count, sub, bg }) {
    return (
        <div className={`${bg} rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">{emoji}</div>
                <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
                    <div className="text-3xl font-extrabold text-gray-900">{count}</div>
                    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
                </div>
            </div>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────
export default function ExpertDashboard() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('pending')
    const [pending, setPending] = useState([])
    const [answered, setAnswered] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getExpertDashboard()
            setPending(Array.isArray(data?.pending) ? data.pending : [])
            setAnswered(Array.isArray(data?.answered) ? data.answered : [])
        } catch (e) {
            console.error(e)
            setError(t('errors.dashboardLoad'))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleOpenSession = sessionId => navigate(`/chat?session=${sessionId}`)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="w-11 h-11 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-gray-400 text-sm">Loading dashboard…</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="text-sm font-semibold text-red-600 text-center max-w-sm">{error}</div>
                <button onClick={load} className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition">
                    ↻ {t('dashboard.disease.retry')}
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f2f6f2] p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{t('dashboard.expert.title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('dashboard.expert.subtitle')}</p>
                </div>
                <button onClick={load} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shrink-0">
                    ↻ {t('dashboard.expert.refresh')}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard emoji="⏳" label={t('dashboard.expert.pendingTitle')} count={pending.length} sub={t('dashboard.expert.pendingSub')} bg="bg-amber-50" />
                <StatCard emoji="✅" label={t('dashboard.expert.answeredTitle')} count={answered.length} sub={t('dashboard.expert.answeredSub')} bg="bg-green-50" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {[['pending', t('dashboard.expert.pendingTab'), pending.length, 'amber'], ['answered', t('dashboard.expert.answeredTab'), answered.length, 'green']].map(([tab, label, count, color]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {label}
                        {count > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Lists */}
            {activeTab === 'pending'
                ? <PendingList queries={pending} onOpen={handleOpenSession} t={t} />
                : <AnsweredList queries={answered} onOpen={handleOpenSession} t={t} />
            }
        </div>
    )
}

// ── Pending list ──────────────────────────────────────────────────────────
function PendingList({ queries, onOpen, t }) {
    if (!queries.length) return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-600">{t('dashboard.expert.noPending')}</p>
        </div>
    )

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">⏳ {t('dashboard.expert.pendingLabel')}</span>
                <span className="text-xs text-gray-400">{queries.length} {t('dashboard.expert.items')}</span>
            </div>
            <div className="h-px bg-gray-200 mb-4" />
            {queries.map((q, i) => {
                const cd = q.cropdata || {}
                const isEscalated = q.escalated
                return (
                    <div key={q.session_id || i}
                        onClick={() => onOpen(q.session_id)}
                        className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${isEscalated ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${isEscalated ? 'bg-red-50' : 'bg-amber-50'}`}>
                                {isEscalated ? '🚨' : '💬'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 capitalize">{t('dashboard.expert.farmerQuery')}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{maskMobile(q.farmer_mobile)}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2 line-clamp-1">{cd.query || '—'}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {cd.location && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">📍 {cd.location}</span>}
                                    <span className={`text-xs px-2 py-1 rounded-full ${isEscalated ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {isEscalated ? `🚨 ${t('dashboard.expert.escalatedBadge')}` : t('dashboard.expert.pendingBadge')}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 font-mono mt-2">{q.session_id}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-xs text-gray-400">{timeAgo(q.created_at)}</span>
                                <button onClick={e => { e.stopPropagation(); onOpen(q.session_id) }}
                                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition">
                                    {t('dashboard.expert.answerBtn')} →
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Answered list ─────────────────────────────────────────────────────────
function AnsweredList({ queries, onOpen, t }) {
    if (!queries.length) return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-600">{t('dashboard.expert.noAnswered')}</p>
        </div>
    )

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">✅ {t('dashboard.expert.answeredLabel')}</span>
                <span className="text-xs text-gray-400">{queries.length} {t('dashboard.expert.items')}</span>
            </div>
            <div className="h-px bg-gray-200 mb-4" />
            {queries.map((q, i) => {
                const cd = q.cropdata || {}
                return (
                    <div key={q.session_id || i}
                        onClick={() => onOpen(q.session_id)}
                        className="bg-white rounded-2xl p-5 border-2 border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl shrink-0">
                                💬
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 capitalize">{t('dashboard.expert.farmerQuery')}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{maskMobile(q.farmer_mobile)}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2 line-clamp-1">{cd.query || '—'}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {cd.location && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">📍 {cd.location}</span>}
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{t('dashboard.expert.answeredLabel')}</span>
                                </div>
                                <div className="text-xs text-gray-400 font-mono mt-2">{q.session_id}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-xs text-gray-400">{timeAgo(q.created_at)}</span>
                                <button onClick={e => { e.stopPropagation(); onOpen(q.session_id) }}
                                    className="px-4 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                                    {t('dashboard.expert.detailsBtn')} →
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
