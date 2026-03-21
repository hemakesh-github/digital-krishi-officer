import React, { useState, useContext, useEffect } from 'react'
import { verifyOtp, genOtp } from '../api_services/api_services'
import { UserContextData } from '../context/UserContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' }
]

const Login = () => {
    const { t, i18n } = useTranslation()
    const userTypes = ['Farmer', 'Expert', 'Admin']
    const [userType, setUserType] = useState(userTypes[0])
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [state, setState] = useState(0)
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(0)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [languageModalOpen, setLanguageModalOpen] = useState(false)
    const { email: loggedEmail, setEmail: setLoggedEmail, type, setType, setUserId } = useContext(UserContextData);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loggedEmail) return
        navigate('/dashboard', { replace: true })
    }, [loggedEmail, navigate])

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    const handleLanguageSelect = (langCode) => {
        i18n.changeLanguage(langCode)
        sessionStorage.setItem('language', langCode)
        setState(1)
    }

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

    const handleResendOtp = async () => {
        if (resendTimer > 0 || resendLoading) return
        setResendLoading(true)
        try {
            const response = await genOtp(email, userType)
            if (response && response.success) {
                setResendTimer(30)
                setError('')
            } else {
                setError(t('login.failedOtp'))
            }
        } catch (error) {
            const detail = error?.response?.data?.detail || ''
            if (error?.response?.status === 403 && detail.includes('not registered as an expert')) {
                setError(t('login.notRegisteredExpert'))
            } else {
                setError(t('login.failedOtp'))
            }
        } finally {
            setResendLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (submitLoading) return
        if (state === 1) {
            if (!validateEmail(email)) {
                setError(t('login.invalidEmail') || 'Please enter a valid email address')
                return
            }
            setSubmitLoading(true)
            try {
                const response = await genOtp(email, userType)
                if (response && response.success) {
                    console.log('OTP sent to email')
                    setError('')
                    setState(2)
                    setResendTimer(30)
                } else {
                    setError(t('login.failedOtp'))
                }
            } catch (error) {
                const detail = error?.response?.data?.detail || ''
                if (error?.response?.status === 403 && detail.includes('not registered as an expert')) {
                    setError(t('login.notRegisteredExpert'))
                } else {
                    setError(t('login.failedOtp'))
                }
            } finally {
                setSubmitLoading(false)
            }
        } else {
            if (!/^\d{6}$/.test(otp)) {
                setError(t('login.invalidOtp'))
                return
            }
            setSubmitLoading(true)
            try {
                const response = await verifyOtp(email, otp, userType)
                if (response && response.success) {
                    setLoggedEmail(response.email)
                    setUserId(response.userId)
                    setType(response.userType)
                    navigate('/dashboard')
                } else {
                    setError(t('login.invalidOtpError'))
                }
            } catch (error) {
                const detail = error?.response?.data?.detail || ''
                if (error?.response?.status === 403 && detail.includes('not registered as an expert')) {
                    setError(t('login.notRegisteredExpert'))
                } else {
                    setError(t('login.failedVerify'))
                }
            } finally {
                setSubmitLoading(false)
            }
        }
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
                                    onClick={() => {
                                        i18n.changeLanguage(lang.code)
                                        sessionStorage.setItem('language', lang.code)
                                        setLanguageModalOpen(false)
                                    }}
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

            <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-8 font-sans">
                <div className="w-full max-w-sm rounded-2xl backdrop-blur-xl bg-white/80 border border-green-800/10 shadow-[0_12px_30px_rgba(46,125,50,0.2)] overflow-hidden">

                <div className="flex items-center justify-center px-6 pt-6 pb-2">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-sm shrink-0">
                            <img src="/logo.png" alt="" />
                        </div>
                        <span className="font-extrabold text-gray-800 text-lg tracking-tight">
                            {t('login.title')}
                        </span>
                    </div>
                </div>

                {state === 0 && (
                    <div className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-800 text-center mb-4">
                            {t('login.selectLanguage')}
                        </div>
                        <div className="flex flex-col gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                                        ${i18n.language === lang.code
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-green-100 hover:border-green-300 hover:bg-green-50/50'
                                        }`}
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-800">{lang.nativeName}</div>
                                        <div className="text-sm text-gray-500">{lang.name}</div>
                                    </div>
                                    {i18n.language === lang.code && (
                                        <svg className="w-6 h-6 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {state > 0 && (
                    <>
                        <div className="px-6 pt-4 pb-0">
                            <div className="flex bg-green-50/80 p-1 rounded-xl w-full items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-green-100/50">
                                {userTypes.map((user) => (
                                    <button
                                        key={user}
                                        onClick={() => state === 1 && setUserType(user)}
                                        disabled={state === 2}
                                        className={`flex-1 py-2 text-sm font-bold transition-all duration-300 rounded-lg border-none ${state === 2 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                            } ${userType === user
                                                ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                                                : 'bg-transparent text-green-700/60 hover:text-green-800 hover:bg-green-100/50'
                                            }`}
                                    >
                                        {user === 'Farmer' ? t('login.farmer') : user === 'Expert' ? t('login.expert') : t('login.admin')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-3">
                            <button
                                onClick={() => setLanguageModalOpen(true)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 hover:bg-green-100 transition-all duration-200 cursor-pointer border-none"
                            >
                                <span className="text-2xl">{languages.find(l => l.code === i18n.language)?.flag}</span>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-semibold text-green-900">{languages.find(l => l.code === i18n.language)?.nativeName}</div>
                                    <div className="text-xs text-green-700/60">{t('language.changeLanguage')}</div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-700/50">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-7 flex flex-col gap-5">

                            {state === 1 ? (
                                <>
                                    <div className="text-xl font-bold text-gray-800">{t('login.loginAs')} {userType === 'Farmer' ? t('login.farmer') : userType === 'Expert' ? t('login.expert') : t('login.admin')}</div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-green-900">
                                            {t('login.emailAddress') || 'Email Address'}
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            inputMode="email"
                                            placeholder={t('login.enterEmail') || 'Enter your email address'}
                                            className="w-full px-3 py-2.5 rounded-xl bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium text-sm"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                        />
                                        {error && <div className="text-red-600 text-sm">{error}</div>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm text-gray-600">
                                        {t('login.otpSent') || 'OTP sent to'} <span className="font-bold text-gray-800">{email}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-green-900">OTP</label>
                                        <div className="flex gap-2">
                                            <input
                                                required
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder={t('login.enterOtp')}
                                                onChange={e => setOtp(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                                className="flex-1 px-3 py-2.5 rounded-xl bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium text-sm"
                                            />
                                            <button
                                                onClick={handleResendOtp}
                                                disabled={resendTimer > 0 || resendLoading}
                                                className={`px-3 py-2.5 font-semibold rounded-xl transition whitespace-nowrap shadow-sm cursor-pointer border-none text-sm flex items-center justify-center gap-2 ${resendTimer > 0 || resendLoading
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {resendLoading ? (
                                                    <>
                                                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        {t('login.resend')}
                                                    </>
                                                ) : resendTimer > 0 ? `${resendTimer}s` : t('login.resend')}
                                            </button>
                                        </div>
                                        {error && <div className="text-red-600 text-sm">{error}</div>}
                                    </div>
                                    <div className="text-sm text-green-700 cursor-pointer">
                                        {t('login.wrongNumber') || 'Wrong email?'}{' '}
                                        <span
                                            className="underline text-blue-700 font-medium"
                                            onClick={() => { setEmail(''); setState(1); setError('') }}
                                        >
                                            {t('login.updateIt')}
                                        </span>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading}
                                className={`w-full py-3 font-bold rounded-xl shadow-md transition-all duration-200 border-none text-sm flex items-center justify-center gap-2 ${submitLoading
                                    ? 'bg-green-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95 hover:shadow-green-900/20'
                                    }`}
                            >
                                {submitLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        {state === 1 ? t('login.sendOtp') : t('login.verifyOtp')}
                                    </>
                                ) : state === 1 ? t('login.sendOtp') : t('login.verifyOtp')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>        </>    )
}

export default Login