import { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../utils/Auth'
import { UserContextData } from '../context/UserContext'
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

const NAV_ITEMS = [
    { label: 'Dashboard', Icon: IconDashboard, to: '/', role: "farmer" },
    { label: 'Disease Detection', Icon: IconDisease, to: '/disease', role: "farmer" },
    { label: 'Crop Advice', Icon: IconLeaf, to: '/crop-advice', role: "farmer" },
    { label: 'History', Icon: IconHistory, to: '/history', role: "farmer" },
    { label: "Farmer Queries", Icon: IconHistory, to: "/", role: "expert" }
]

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                {/* Lucide Leaf icon */}
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

function SidebarLink({ item, onClick }) {
    const { Icon, role } = item
   
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
                    <span className="flex-1 truncate">{item.label}</span>
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

export default function Navbar() {
    const navigate = useNavigate()
    const isLoggedIn = !!localStorage.getItem('token')
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = async () => {
        await logout();
        setMobileOpen(false)
        navigate('/login')
    }
    
    const {type} = useContext(UserContextData);
    
    
    const navItems = type
  ? NAV_ITEMS.filter(item => item.role === type)
  : [];
    


    const SidebarContent = ({ onLinkClick }) => (
        <>
            <div className="px-4 py-4 border-b border-sidebar-bdr">
                <NavLink to="/" className="no-underline"><Logo /></NavLink>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    return <SidebarLink key={item.to} item={item} onClick={onLinkClick} />
                })}
            </nav>

            <div className="p-3 border-t border-sidebar-bdr">
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-sidebar-acc transition-all duration-200 cursor-pointer border-none bg-transparent"
                    >
                        {/* Lucide LogOut icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
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
                        <span>Login</span>
                    </NavLink>
                )}
            </div>
        </>
    )

    return (
        <>
            {/* ── Desktop sidebar (w-52 = 208px — narrower than before) ── */}
            <aside className="bg-sidebar hidden lg:flex flex-col w-52 fixed inset-y-0 left-0 z-30 border-r border-sidebar-bdr">
                <SidebarContent />
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
                <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </aside>
        </>
    )
}
