import { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../utils/Auth'
import { UserContextData } from '../context/UserContext'
import { useTranslation } from 'react-i18next'

const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' }
]
/* ── Lucide-style SVG icons ── */
const IconDashboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
)
const IconDisease = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)
const IconLeaf = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
)
const IconHistory = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
)
const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)
const IconGraduate = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
)
const IconSessions = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)
const IconChart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)
const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-sidebar-fg font-extrabold text-[0.82rem] tracking-tight">Digital Krishi</span>
                <span className="text-sidebar-pri font-extrabold text-[0.82rem] tracking-tight">Officer</span>
            </div>
        </div>
    )
}

const NAV_ITEMS = [
    { labelKey: 'nav.dashboard', label: 'Dashboard', Icon: IconDashboard, to: '/dashboard', role: 'farmer' },
    { labelKey: 'nav.diseaseDetection', label: 'Disease Detection', Icon: IconDisease, to: '/disease', role: 'farmer' },
    { labelKey: 'nav.cropAdvice', label: 'Crop Advice', Icon: IconLeaf, to: '/crop-advice', role: 'farmer' },
    { labelKey: 'nav.history', label: 'History', Icon: IconHistory, to: '/history', role: 'farmer' },
    { labelKey: 'nav.farmerQueries', label: 'Farmer Queries', Icon: IconHistory, to: '/dashboard', role: 'expert' },
    // ── Admin ───────────────────────────────────────────────────────────
    { labelKey: 'nav.dashboard', label: 'Dashboard', Icon: IconDashboard, to: '/dashboard', role: 'admin' },
    { labelKey: 'nav.addExpert', label: 'Add Expert', Icon: IconUsers, to: '/addexpert', role: 'admin' },
]

function SidebarLink({ item, onClick, t }) {
    const { Icon } = item

    return (
        <NavLink
            to={item.to}
            end={item.to === '/'}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline
                ${isActive
                    ? 'bg-primary text-white'
                    : 'text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-sidebar-acc'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span className="shrink-0"><Icon /></span>
                    <span className="flex-1 truncate">{t(item.labelKey, item.label)}</span>
                    {isActive && (
                        <svg className="w-3.5 h-3.5 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    )}
                </>
            )}
        </NavLink>
    )
}

function SidebarContent({ navItems, isLoggedIn, onLogout, onLinkClick, currentLang, onLanguageClick, t }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await onLogout();
        navigate('/login')
    }

    return (
        <>
            <div className="px-4 py-4 border-b border-sidebar-bdr">
                <NavLink to="/" className="no-underline"><Logo /></NavLink>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    return <SidebarLink key={item.to + item.role} item={item} onClick={onLinkClick} t={t} />
                })}
            </nav>

            {isLoggedIn && (
                <div className="p-3 border-t border-sidebar-bdr">
                    <button
                        onClick={onLanguageClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-sidebar-acc hover:bg-primary/10 transition-all duration-200 cursor-pointer border-none"
                    >
                        <span className="text-2xl">{currentLang?.flag}</span>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-sidebar-fg">{currentLang?.nativeName}</div>
                            <div className="text-xs text-sidebar-fg/60">{t('language.selectLanguage')}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sidebar-fg/50">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="p-3 border-t border-sidebar-bdr">
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-sidebar-acc transition-all duration-200 cursor-pointer border-none bg-transparent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>{t('nav.logout')}</span>
                    </button>
                ) : (
                    <NavLink to="/login" className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline
                        ${isActive ? 'bg-primary text-white' : 'text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-sidebar-acc'}`
                    }>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span>{t('nav.login')}</span>
                    </NavLink>
                )}
            </div>
        </>
    )
}

export default function Navbar() {
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [languageModalOpen, setLanguageModalOpen] = useState(false)
    const { t, i18n } = useTranslation()
    const { type, mobileNo, setType, setMobileNo, setUserId } = useContext(UserContextData)

    const handleLogout = async () => {
        await logout()
        setType(null)
        setMobileNo(null)
        setUserId(null)
        setMobileOpen(false)
    }

    const isLoggedIn = Boolean(type || mobileNo)


    const navItems = type
        ? NAV_ITEMS.filter(item => item.role === type)
        : [];

    const currentLang = languages.find(l => l.code === i18n.language)

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode)
        sessionStorage.setItem('language', langCode)
        setLanguageModalOpen(false)
    }

    return (
        <>
            {languageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setLanguageModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('language.selectLanguage')}</h3>
                        <div className="flex flex-col gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                                        ${i18n.language === lang.code
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                        }`}
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-800">{lang.nativeName}</div>
                                        <div className="text-sm text-gray-500">{lang.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setLanguageModalOpen(false)}
                            className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 cursor-pointer border-none bg-transparent"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── Desktop sidebar (w-52 = 208px — narrower than before) ── */}
            <aside className="bg-sidebar hidden lg:flex flex-col w-52 fixed inset-y-0 left-0 z-30 border-r border-sidebar-bdr">
                <SidebarContent
                    navItems={navItems}
                    isLoggedIn={isLoggedIn}
                    onLogout={handleLogout}
                    currentLang={currentLang}
                    onLanguageClick={() => setLanguageModalOpen(true)}
                    t={t}
                />
            </aside>

            {/* ── Mobile top bar ── */}
            <header className="lg:hidden bg-sidebar border-b border-sidebar-bdr fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14">
                <NavLink to="/" className="no-underline"><Logo /></NavLink>
                <button
                    onClick={() => setMobileOpen(o => !o)}
                    className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-lg cursor-pointer border-none bg-transparent"
                    aria-label="Toggle menu"
                >
                    <span className={`block w-5 h-0.5 rounded bg-sidebar-fg transition-all duration-200 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                    <span className={`block w-5 h-0.5 rounded bg-sidebar-fg transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                    <span className={`block w-5 h-0.5 rounded bg-sidebar-fg transition-all duration-200 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </button>
            </header>

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            {/* ── Mobile drawer (w-52 to match desktop) ── */}
            <aside className={`lg:hidden bg-sidebar fixed inset-y-0 left-0 w-52 z-50 flex flex-col border-r border-sidebar-bdr
                transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent
                    navItems={navItems}
                    isLoggedIn={isLoggedIn}
                    onLogout={handleLogout}
                    onLinkClick={() => setMobileOpen(false)}
                    currentLang={currentLang}
                    onLanguageClick={() => {
                        setLanguageModalOpen(true)
                        setMobileOpen(false)
                    }}
                    t={t}
                />
            </aside>
        </>
    )
}
