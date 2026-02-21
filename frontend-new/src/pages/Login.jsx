import React, { useState, useContext } from 'react'
import { verifyOtp, genOtp } from '../api_services/api_services'
import { UserContextData } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../utils/Auth'
const Login = () => {
    const userTypes = ['Farmer', 'Expert', 'Admin']
    const [userType, setUserType] = useState(userTypes[0])
    const [mobileNumber, setMobileNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [state, setState] = useState(0) // 0: enter mobile, 1: enter otp
    const [error, setError] = useState('')
    const { setMobileNo, setUserId, setType } = useContext(UserContextData);
    const navigate = useNavigate();
    const handleSubmit = async () => {
        if (state === 0) {
            if (!/^\d{10}$/.test(mobileNumber)) {
                setError('Please enter a valid 10-digit mobile number')
                return
            }
            try {
                const response = await genOtp(mobileNumber, userType)
                if (response && response.success) {
                    console.log('OTP generated successfully')
                } else {
                    setError('Failed to generate OTP. Please try again.')
                    return
                }
            } catch (err) {
                setError('Failed to send OTP. Please try again.')
                console.error(err)
                return
            }
            setError('')
            setState(1)
        } else {
            if (!/^\d{6}$/.test(otp)) {
                setError('Please enter a valid 6-digit OTP')
                return
            }
            try {
                const response = await verifyOtp(mobileNumber, otp, userType)
                if (response && response.success) {
                    console.log(response)
                    setToken(response.access_token)
                    setMobileNo(response.mobile_number)
                    setUserId(response.userId)
                    setType(response.userType)
                    navigate('/')
                    console.log('OTP verified successfully')
                } else {
                    setError('Invalid OTP. Please try again.')
                    return
                }
            } catch (err) {
                setError('Failed to verify OTP. Please try again.')
                return
            }
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-8 font-sans">
            <div className="w-full max-w-sm rounded-2xl backdrop-blur-xl bg-white/80 border border-green-800/10 shadow-[0_12px_30px_rgba(46,125,50,0.2)] overflow-hidden">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-sm">
                        🌿
                    </div>
                    <span className="font-extrabold text-gray-800 text-lg tracking-tight">
                        Digital <span className="text-green-600">Krishi Officer</span>
                    </span>
                </div>

                {/* User type tabs */}
                <div className="flex border-b border-green-900/10">
                    {userTypes.map((user) => (
                        <button
                            key={user}
                            onClick={() => setUserType(user)}
                            className={`flex-1 py-3 text-sm font-semibold transition-all duration-150 border-none cursor-pointer
                                ${userType === user
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-50 text-green-800 hover:bg-green-100'
                                }`}
                        >
                            {user}
                        </button>
                    ))}
                </div>

                {/* Form body */}
                <div className="px-6 py-7 flex flex-col gap-5">

                    {state === 0 ? (
                        <>
                            <div className="text-xl font-bold text-gray-800">Login as {userType}</div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-green-900">Mobile Number</label>
                                <input
                                    required
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full px-3 py-2.5 rounded-xl bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium text-sm"
                                    onChange={e => setMobileNumber(e.target.value)}
                                />
                                {error && <div className="text-red-600 text-sm">{error}</div>}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-sm text-gray-600">
                                OTP sent to <span className="font-bold text-gray-800">{mobileNumber}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-green-900">OTP</label>
                                <div className="flex gap-2">
                                    <input
                                        required
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        onChange={e => setOtp(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-xl bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium text-sm"
                                    />
                                    <button className="px-3 py-2.5 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 transition whitespace-nowrap shadow-sm cursor-pointer border-none text-sm">
                                        Resend
                                    </button>
                                </div>
                                {error && <div className="text-red-600 text-sm">{error}</div>}
                            </div>
                            <div className="text-sm text-green-700 cursor-pointer">
                                Wrong number?{' '}
                                <span
                                    className="underline text-blue-700 font-medium"
                                    onClick={() => { setMobileNumber(''); setState(0); setError('') }}
                                >
                                    Update it
                                </span>
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-green-900/20 active:scale-95 transition-all duration-200 cursor-pointer border-none text-sm"
                    >
                        {state === 0 ? 'Send OTP' : 'Verify OTP'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login