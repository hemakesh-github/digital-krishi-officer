import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { removeToken } from '../utils/Auth'

const NAV_ITEMS = [
    { label: 'Dashboard', icon: '🏠', to: '/' },
    { label: 'Disease Prediction', icon: '🔬', to: '/disease' },
    { label: 'Crop Advice', icon: '🌿', to: '/crop-advice' },
    { label: 'History', icon: '🕘', to: '/history' },
]

export default function Navbar() {
    const navigate = useNavigate()
    const isLoggedIn = !!localStorage.getItem('token')
    const [open, setOpen] = useState(false)

    const handleLogout = async () => {
        await removeToken()
        setOpen(false)
        navigate('/login')
    }

    // Shared active/inactive class for nav links
    const linkCls = ({ isActive }) =>
        `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-150
        ${isActive
            ? 'bg-green-600 text-white shadow-sm shadow-green-200'
            : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
        }`

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

                    {/* Logo — matches Login page */}
                    <NavLink to="/" className="flex items-center gap-2 shrink-0 no-underline">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-sm">
                            🌿
                        </div>
                        <span className="font-extrabold text-gray-800 text-base tracking-tight">
                            Digital <span className="text-green-600">Krishi Officer</span>
                        </span>
                    </NavLink>

                    {/* ── Desktop nav links ── */}
                    <div className="hidden lg:flex gap-1 flex-1">
                        {NAV_ITEMS.map(({ label, icon, to }) => (
                            <NavLink key={to} to={to} end={to === '/'} className={linkCls}>
                                <span>{icon}</span>{label}
                            </NavLink>
                        ))}
                    </div>

                    {/* ── Desktop login / logout ── */}
                    <div className="hidden lg:block shrink-0 ml-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border-none cursor-pointer transition-all text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                            >
                                <span>🚪</span> Logout
                            </button>
                        ) : (
                            <NavLink to="/login" className={linkCls}>
                                <span>🔑</span> Login
                            </NavLink>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="lg:hidden ml-auto w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-gray-100 transition cursor-pointer border-none bg-transparent"
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 ${open ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                    </button>
                </div>

                {/* ── Mobile drawer ── */}
                {open && (
                    <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-lg">
                        {/* Nav links */}
                        {NAV_ITEMS.map(({ label, icon, to }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                onClick={() => setOpen(false)}
                                className={linkCls}
                            >
                                <span>{icon}</span>{label}
                            </NavLink>
                        ))}

                        {/* Divider */}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            {isLoggedIn ? (
                                /* Full-width red logout button — easy to tap on mobile */
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 cursor-pointer transition-all duration-150"
                                >
                                    <span>🚪</span> Logout
                                </button>
                            ) : (
                                <NavLink
                                    to="/login"
                                    onClick={() => setOpen(false)}
                                    className={linkCls}
                                >
                                    <span>🔑</span> Login
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
