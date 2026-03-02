import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNotifications, markNotificationRead } from '../api_services/api_services'
import { UserContextData } from '../context/UserContext'

export default function NotificationToast() {
    const { t } = useTranslation()
    const { userId, role } = useContext(UserContextData)
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (!userId || role === 'expert' || role === 'admin') return

        const fetchNotifs = async () => {
            const data = await getNotifications()
            if (data?.length > 0) {
                setNotifications(data)
            }
        }

        fetchNotifs()

        const interval = setInterval(fetchNotifs, 15000)
        return () => clearInterval(interval)
    }, [userId, role])

    const handleOpen = async (n) => {
        await markNotificationRead(n.id)
        setNotifications(prev => prev.filter(notif => notif.id !== n.id))
        navigate(`/chat?session=${n.session_id}`)
    }

    const handleDismiss = async (e, n) => {
        e.stopPropagation()
        await markNotificationRead(n.id)
        setNotifications(prev => prev.filter(notif => notif.id !== n.id))
    }

    if (notifications.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 w-[calc(100vw-32px)] sm:w-80">
            {notifications.slice(0, 3).map(n => (
                <div
                    key={n.id}
                    className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-l-4 border-l-green-500 overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-5 fade-in duration-300"
                    onClick={() => handleOpen(n)}
                >
                    <div className="p-4 flex gap-3 relative">
                        <button
                            onClick={(e) => handleDismiss(e, n)}
                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>

                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl shrink-0 border border-green-100">
                            👨‍🌾
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {t('notifications.expertReplyTitle', 'Expert Reply Received')}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">
                                {n.message}
                            </p>
                            <div className="mt-2 text-[10.5px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                                {t('notifications.tapToView', 'Tap to view session')}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
